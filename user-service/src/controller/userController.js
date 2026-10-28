const User = require("../../model/userModel");

const redisClient = require("../../connections/redisConnection");
const { success, error } = require("../../utils/response");
const defaultCall = require("../../utils/defaultCall");
const { decryptedData, encryptedData, createLookupHook, hashingPassword, createTree, checkUserType, createWallet, sendMail, checkPassword, searchAlgorithm } = require("../../utils/helper");
// const  sendMail  = require("../../utils/mails");
const jwt = require("jsonwebtoken");
// const { promises } = require("nodemailer/lib/xoauth2");

module.exports.signUp = async (req, res) => {
  try {
    console.log("signUp......!");
    const user = req.value[0];
    console.log(user, "====")
    // return
    const price = 2
    const userType = "endUser"

    const [ cryptedUsername, usernameLookup, cryptedEmail, lookupEmail, hashedPassword, apiKey ] = await Promise.all([
      encryptedData(user.username),
      createLookupHook(user.username),
      encryptedData(user.email),
      createLookupHook(user.email),
      await hashingPassword(user.password),
      defaultCall.randomStringGenerate()
    ])
    console.log(cryptedUsername, usernameLookup, cryptedEmail, lookupEmail, hashedPassword, apiKey, "========================")

    const { UserPrimary:primary, UserSecondary:secondary } = await User


    // const cryptedUsername = encryptedData(user.username);
    // const usernameLookup = createLookupHook(user.username);

    // const cryptedEmail = encryptedData(user.email);
    // const lookupEmail = createLookupHook(user.email);

    const existUser = await primary.findUser({ usernameLookup });

    if (existUser) {
      return  error(res, "User already created");
    }

    // const hashedPassword = await hashingPassword(user.password);

    const otp = defaultCall.otp();
    console.log(otp, "OTP");


    let parentTree;
    console.log(user, "usertype");

    const parent = await primary.findSuperAdmin()
    console.log(parent, "=======")

    parentTree = createTree({ username: cryptedUsername, userType: userType, parent: parent});

    const cacheKey = `userId:${parentTree.userId}`;
    console.log(cacheKey, "cacheKey");

    // const apiKey = defaultCall.randomStringGenerate();

    console.log(parentTree, "Parent Tree from signUp......!");

    const cacheData = {
      userId: parentTree.userId,
      name: user.name,
      username: cryptedUsername,
      email: cryptedEmail,
      usernameLookup: usernameLookup,
      emailLookup: lookupEmail,
      number: user.number,
      password: hashedPassword,
      otp: otp,
      price: price,
      userType: userType,
      parentTree: parentTree.tree,
      apiKey: apiKey,
    };

    console.log(cacheData, "cacheData");

    await redisClient.set(cacheKey, JSON.stringify(cacheData));

    const info = await sendMail({
      to: user.email,
      subject: "Signup OTP",
      text: `Hello ${user.name}, you receive otp : ${otp}`,
      html: `<b>Hello ${user.name}, you receive otp : ${otp}</b>`,
    });

    data = [user]
    data.push(`userId: ${parentTree.userId}`)

    return success(res, data, "OTP sent successful");
  } catch (err) {
    console.log("Got error while signup : ", err);
    return error(res, `Got error while signup : ${err}`);
  }
};

module.exports.verifyOtp = async (req, res) => {
  try {
    console.log("Verifying otp...!");

    const { userId, otp } = req.value;
    console.log("userId & OTP : ", userId, otp);

    const cacheKey = `userId:${userId}`;
    console.log(cacheKey, "cacheKey ===");

    const cacheData = await redisClient.get(cacheKey);
    console.log("Redis data: ", cacheData);

    if (!cacheData) {
      return error(res, "OTP expired or user not found");
    }

    const userData = JSON.parse(cacheData);
    console.log(userData, "userData+++++");

    if (Number(userData.otp) !== Number(otp)) {
      return error(res, "Invalid OTP");
    }

    const { UserPrimary:primary, UserSecondary:secondary } = await User


    const wallet = createWallet(10, 0);

    const newData = {
      userId: userData.userId,
      name: userData.name,
      username: userData.username,
      usernameLookup: userData.usernameLookup,
      email: userData.email,
      emailLookup: userData.emailLookup,
      number: userData.number,
      password: userData.password,
      price: userData.price,
      wallet: wallet,
      userType: userData.userType,
      parentTree: userData.parentTree,
      apiKey: userData.apiKey,
    };

    await primary.createUser(newData)
    await secondary.createUser(newData)

    console.log(newData, "newData========");

    console.log("OTP verified successfully");
    return  success(res, newData, "OTP verified successfully");
  } catch (err) {
    console.log(`OTP verify failed & got some error : ${err}`);
    return  error(res, `OTP verify failed & got some error : ${err}`);
  }
};

module.exports.login = async (req, res) => {
  try {
    const { username, email, password } = req.value;
    const logValue = username || email;
    console.log(`Username : ${logValue}, Password : ${password}`);

    if (!logValue || !password) {
      return  error(res, `Username / email ^ password are required`);
    }

    const encryptedUsername = encryptedData(username);
    // console.log(encryptedUsername, "encryptedUsername======")

    const decryptedUsername = decryptedData(encryptedUsername);
    console.log(decryptedUsername, "decryptedUsername==========");

    const { UserPrimary:primary, UserSecondary:secondary } = await User

    let user;
    if (username) {
      const usernameLookup = createLookupHook(username);
      console.log("usernameLookup : ", usernameLookup);
      user = await primary.findOne({ usernameLookup });
    }
    if (email) {
      const emailLookup = createLookupHook(email);
      console.log("emailLookup : ", emailLookup);
      user = await primary.findOne({ emailLookup });
    }
    console.log("User details: ", user);

    if (!user) {
      return  error(
        res,
        "Invalid username/password or password / Not exist user",
      );
    }

    const isPasswordCorrect = await checkPassword(password, user.password);
    console.log("Password : ", password);
    console.log("Password hash: ", user.password);
    console.log("isPasswordCorrect : ", isPasswordCorrect);

    console.log("JWT_SECRET:", process.env.JWT_SECRET);

    if (!isPasswordCorrect) {
      return  error(res, "Invalid password or password not matched");
    }

    const token = jwt.sign(
      {
        userId: user.userId,
        parentTree: user.parentTree,
        username: user.username,
        userType: user.userType,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );

    // console.log(`Token : ${token}`);

    const authTokenApiKey = {
      token: token,
      apiKey: user.apiKey,
    };

    return success(
      res,
      authTokenApiKey,
      "Login successful & token generated",
    );
  } catch (err) {
    return  error(res, `Got error while login ${err}`);
  }
};

module.exports.addBalance = async (req, res) => {
  try {
    const { userId, email, amount } = req.value;

    const { UserPrimary:primary, UserSecondary:secondary } = await User

    const existUser = await primary.findUser({ userId:userId })
    console.log(existUser, "existUSer")
    if(!existUser){
      return error(res, "User not found")
    }
    const parent = req.userInfo
    const apiKey = req.headers["x-api-key"];
    
    const cacheKey = `userId:${userId}`;
    const cacheData = await redisClient.get(cacheKey);
    
    const parentData = JSON.parse(cacheData);
    console.log(parentData, "parentUser")

    // const key = parentData.apiKey;

    // const isApiKey = await User.findUser({apiKey:apiKey})
    // let userId;

    let userType;

    if (apiKey) {
      userType = parentData.userType
    }else{
      userType = parent.userType
    }
    // const {userId, userType} = req.userInfo
    // console.log(" UserType : ", userType);

    const superAdmin = userType === "superAdmin" || "reseller";
    if (!superAdmin) {
      return error(
        res, "You don't have permission to perform this action",
      );
    }

    const updateWallet = {
      userId,
      amount: amount,
    };
    await primary.updateUserWallet(updateWallet)
    await secondary.updateUserWallet(updateWallet)

    // console.log(updateWallet, " Update Wallet ")
    return  success(res, "Balance added successfully");
  } catch (err) {
    return  error(res, `Got error while adding balance ${err}`);
  }
};

module.exports.createUser = async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];

    const { UserPrimary:primary, UserSecondary:secondary } = await User

    // const secondaryParentUser = await secondary.findUser({apiKey:apiKey})

    let parentUser
    if(apiKey){
      parentUser = await primary.findUser({apiKey:apiKey})
      // parentUser = await User.findUser({apiKey:apiKey})
    } else{
      parentUser = req.userInfo
    }

    // const parentUserCacheKey = `userId:${parentUser.userId}`;
    // const cachedData = await redisClient.get(parentUserCacheKey);
    // const parentUserCachedData = JSON.parse(cachedData);

    // // let parentUser;
    // if (apiKey) {
    //   parentUser = parentUserCachedData
    // }
    // if (!apiKey) {
    //   parentUser = req.userInfo;
    // }

    if (
      parentUser.userType !== "superAdmin" &&
      parentUser.userType !== "reseller"
    ) {
      return error(res, "You have not authorized to create users");
    }

    console.log(req.value, "==========");

    const { name, username, email, password, number } = req.value;
    const price = 2
    const userType = "endUser"

    const [ hashedPassword, wallet, cryptedUsername, usernameLookup, cryptedEmail, emailLookup ] = await Promise.all([
      await hashingPassword(password),
      createWallet(20, 0),
      encryptedData(username),
      createLookupHook(username),
      encryptedData(email),
      createLookupHook(email)
    ])

    // const hashedPassword = await hashingPassword(password);
    // const wallet = createWallet(20, 0);
    // const cryptedUsername = encryptedData(username);
    // const usernameLookup = createLookupHook(username);
    // console.log(User, "User =============")
    // return

    const existUser = await primary.findUser({ usernameLookup });
    console.log(existUser, "exist user");
    if (existUser) {
      return  error(res, "User already exist check from secondary db");
    }

    // const cryptedEmail = encryptedData(email);
    // const emailLookup = createLookupHook(email);

    let parent
    const userParentTree = createTree({
      username: cryptedUsername,
      userType: userType,
      parent: { parentTree: parentUser.parentTree },
    });
    console.log(userParentTree, "created user parent tree");
    const cacheKey = `userId:${userParentTree.userId}`;

    const cacheData = {
      name: name,
      username: cryptedUsername,
      email: cryptedEmail,
      usernameLookup: usernameLookup,
      emailLookup: emailLookup,
      number: number,
      password: hashedPassword,
      userType: userType,
      price: price,
      wallet,
      parentTree: userParentTree.tree,
      userId: userParentTree.userId,
    };

    console.log(cacheData, "cacheData");
    await redisClient.set(cacheKey, JSON.stringify(cacheData));

    // userData = JSON.parse(await redisClient.get(cacheKey))

    const userData = {
      name: cacheData.name,
      username: cacheData.username,
      email: cacheData.email,
      usernameLookup: cacheData.usernameLookup,
      emailLookup: cacheData.emailLookup,
      password: cacheData.password,
      number: cacheData.number,
      wallet: cacheData.wallet,
      userType: cacheData.userType,
      price: cacheData.price,
      wallet: cacheData.wallet,
      parentTree: cacheData.parentTree,
      userId: cacheData.userId,
    };

    await primary.createUser(userData)
    await secondary.createUser(userData)

    console.log(userData, "userData from createUser");

    return success(res, userData, "User created successfully & save in both db");
  } catch (err) {
    return error(res, `Got error while creating user ${err}`);
  }
};

// module.exports.userList = async (req, res) => {
//   try{

//     const { username, email, userType } = req.body
//     // console.log(username, email, userType)

//     if(userType !=="All"){
//       checkUserType(userType)
//     }

//     const allUserList = await User.findAllUser()
//     // console.log(allUserList)

//     let userList = []
//     for(let user of allUserList){
//       const username = user.username
//       const decryptedUsername = decryptedData(username)
//       const isDeleted = user.isDeleted
//       if(isDeleted !== true){
//         userList.push({
//           "username":decryptedUsername,
//           "userType" : user.userType
//         })
//       }
//     }

//     const filterData = userList.filter(
//       user => user.userType === userType
//     )

//     let data = [];
//     if(userType === "All"){
//       const count = userList.length
//       data = [ {count :count} , userList ]
//     }else{
//       const count = filterData.length
//       data = [ {count :count}, {userType:userType}, filterData ]
//     }

//     return  success(res, data, `${userType} user list`)

//   }catch(error){
//     return  error(res, `Got error while user listing : ${error}`)
//   }

// }

module.exports.getChildUsers = async (req, res) => {
  try {
    console.log(req.userInfo);

    const apiKey = req.headers["x-api-key"];
    const { UserPrimary:primary, UserSecondary:secondary } = await User

    const user = await primary.findUser({ apiKey: apiKey });

    let userId;
    if (user) {
      userId = user.userId;
    }
    if (!user) {
      userId = req.userInfo.userId;
    }

    // let { userId } = req.userInfo

    const allUserList = await secondary.findAllChildUser(userId);

    console.log(allUserList, "allUserList");
    const records = allUserList.map((item) => ({
      user: item?.userId,
      username: decryptedData(item?.username),
    }));
    console.log(records, "records");
    const data = [{count:records.length}, records]

    return  success(res, data, "Child user list");
  } catch (error) {
    return  success(res, `Got error while child user ${error}`);
  }
};

module.exports.userTempDetails = async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];
    const { UserPrimary:primary, UserSecondary:secondary } = await User

    const userApiKey = await primary.findUser({apiKey:apiKey})
    let user;
    if(apiKey){
      user = userApiKey
    }
    if(!apiKey){
      user = req.userInfo;
    }
    console.log(user);

    const compoundIdx = await primary.checkCompoundIndex(user.userId, user.userType);
    console.log(compoundIdx, "===compoundIdx===");

    const userTemp = await primary.getUserTempData();
    console.log(userTemp, "from userController============");
    return success(res, userTemp, "Successful");
  } catch (err) {
    return error(res, `Got error ${err}`);
  }
};

// module.exports.upload = async (req, res) => {
//   try{
//     console.log("=============")
//     console.log("FILES:", req.file);
//     const file = req.file

//     console.log(file, "file")

//     // return
//     if(!file){
//       return  error(res, "File not uploaded..!")
//     }

//     const uploadedImage = await uploadOnCloudinary(file.path,"images")
//     console.log(uploadedImage, "uploadedImage==========")

//     // const imageDoc = await Image.create({
//     //   url: uploadedImage.url,
//     //   public_id: uploadedImage.public_id,
//     //   folder: "images"
//     // })
//     // console.log(imageDoc, "imageDoc=====")

//     const result = [ file, uploadedImage ]

//     return  success(res, result, "got it")

//   }catch(error){
//     console.log(error, "Error====")
//     return  error(res, `Got error ${error}`)
//   }
// }

module.exports.usersData = async (req, res) => {
  try {
    const { start, length, sorting, searching } = req.value;
    const { UserPrimary:primary, UserSecondary:secondary } = await User
    const search = searchAlgorithm(primary, searching);
    const query = { isDeleted: { $ne: true } };


    if (search.length) {
      query.$or = search;
    }

    let pageNum = (start - 1) * length;

    const result = await primary.getUsers({ query, start:pageNum, length, sorting });

    return  success(
      res,
      {
        total: result.total,
        users: result.data,
      },
      "Users data",
    );
  } catch (err) {
    console.error(err);

    return error(res, `Got some error: ${err}`);
  }
};

// module.exports.deleteUser = async (req, res) =>{
//   try{
//     const userId = req.body

//     const existUser = await User.findUser(userId)

//     if(!existUser){
//       return  error(res, "User not found")
//     }

//     const user = await User.findById(userId);

//     const canDeleteByRole =
//     superAdmin.userType === "superAdmin" ||
//     superAdmin.userType === "reseller";

// if (!canDeleteByRole) {
//     return  error(
//         res,
//         "EndUser is not allowed to delete users"
//     );
// }

// if (superAdmin.userId === targetUserId) {
//     return  error(
//         res,
//         "You cannot delete yourself"
//     );
// }

// const isInHierarchy = targetUser.parentTree?.some(
//     item => item.parentId === superAdmin.userId
// );

// if (!isInHierarchy) {
//     return  error(
//         res,
//         "You cannot delete this user"
//     );
// }

//     // await user.softDeleteUser();
//     // return  success(res, user)

//     return  success(res, user, "User deleted")
//   }catch(error){
//     return  error(res, `Got some ${error}`)
//   }
// }

module.exports.deleteUser = async (req, res) => {
  try {
    const { userId: targetUserId } = req.body;

    const superAdmin = req.userInfo;

    if (!superAdmin) {
      return error(res, "Authentication required");
    }

    const admin =
      superAdmin.userType === "superAdmin" ||
      superAdmin.userType === "reseller";

    if (!admin) {
      return error(
        res,
        "EndUser don't have permission to delete user",
      );
    }

    if (superAdmin.userId === targetUserId) {
      return error(res, "You cannot delete yourself");
    }
    const { UserPrimary:primary, UserSecondary:secondary } = await User

    const targetUser = await primary.findUser({ userId: targetUserId });

    if (!targetUser) {
      return error(res, "User not found");
    }

    const isInParentTree = targetUser.parentTree?.some(
      (item) => item.parentId === superAdmin.userId,
    );

    if (!isInParentTree) {
      return error(res, "You cannot delete this user");
    }

    const result = await primary.softDeleteHierarchy(targetUserId);

    return success(res, result, "User deleted successfully");
  } catch (error) {
    return  error(res, `Got some ${error}`);
  }
};

// const fs = require("fs")
// const { parse } = require("csv-parse/sync");

// module.exports.campaignUsers = async (file, fs, parse) => {
//   try{  
//     const fileData = fs.readFileSync(file.path, "utf-8")
//     console.log(fileData, "fileData from campaign")

//     console.log(JSON.stringify(fileData), "RAW FILE DATA");

//     const cleanedFileData = fileData.replace(/^,\r?\n/, "")
//     console.log(cleanedFileData, "cleanedFileData=======")

//     const users = parse(
//         cleanedFileData,
//         {
//           columns: true,
//           skip_empty_lines: true,
//           trim: true
//         }
//       )

//     console.log(users, "users======")

//     const data = users.map((user) => {
//       return {username: user.username, email: user.email}
//     })
//     console.log(data, "data from campaign")

//     return  success(res, data, "File data")

//   }catch(error){
//     return  error(res, `Got some ${error}`)
//   }
// }