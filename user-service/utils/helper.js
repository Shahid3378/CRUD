const response = require('../utils/response')
const bcrypt = require("bcrypt");
const defaultCall = require('../utils/defaultCall')
const User = require('../model/userModel')
const nodemailer = require('nodemailer')

module.exports.checkUserType = (userType) => {
    const { superAdmin, reseller, endUser } = { 
        superAdmin:"superAdmin",
        reseller : "reseller",
        endUser : "endUser"
    }
    console.log(userType, "user userType from checkUserType")
    const type = userType === superAdmin || userType === reseller || userType === endUser
    console.log(type, "user type from checkUserType")
    if(!type){
        throw new Error("User type is not valid");
    }
    return type
}

module.exports.hashingPassword = async (password) => {
    return bcrypt.hash(password, 10)
}

module.exports.checkPassword = async (existPassword, inputPassword) => {
    return bcrypt.compare(existPassword, inputPassword)
}

module.exports.createTree = ({ username, userType, parent }) =>{

    console.log("create parent tree function...!")
    let parentTree = parent?.parentTree
    
    const userId = defaultCall.randomGenerateId()
    console.log("userId", userId, "username", username, "userType", userType,"parentUserTree", parentTree, "-----helper createTree-----")

    if(userType === "superAdmin"){
        parentTree  = {
                parentId : userId,
                parentUser : username
            }
        console.log(parentTree, "first superAdmin tree")
        return {tree:parentTree , userId}
    }else if(userType === "reseller"){
        const newUser = {
                parentId : userId,
                parentUser : username
            }
        parentTree.push(newUser)
        console.log(parentTree, "new user added in parent Tree ===========")
        return { tree: parentTree, userId }
    }else if( userType === "endUser"){
        const newUser = {
                parentId : userId,
                parentUser : username
            }
        parentTree.push(newUser)
        console.log(parentTree, "third endUser tree")
        return { tree:parentTree, userId }
    }
}

module.exports.createWallet = ( INR = 0 , USD = 0) => {
    return {
        INR,
        USD
    }
}

module.exports.validBalance = (wallet, credit) => {
    console.log("Wallet from userModel : ", wallet, "Credit from userModel : ", credit)
    return wallet >= credit
}

module.exports.escapeRegex = (text) => {
    console.log(text, "text---")
    return text.replace(/[-[\]{}()*+?.^$|\s]/g, '\\$&');
}


// const response = require("./response")
// ====
const username = process.env.GMAIL_USERNAME;
const password = process.env.GMAIL_PASSWORD;

if (!username || !password) {
    throw new Error("Missing Gmail SMTP credentials");
}

// Create the transporter only once
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: username,
        pass: password,
    },
    pool: true,
    maxConnections: 1,
    maxMessages: 100,
});

module.exports.sendMail = async ({ to, subject, text, html }) => {
    try {
        const info = await transporter.sendMail({
            from: `"Developer" <${username}>`,
            to,
            subject,
            text,
            html,
        });

        console.log("Message sent:", info.messageId);
        return info;
    } catch (error) {
        console.error("Email sending failed:", {
            message: error.message,
            code: error.code,
            responseCode: error.responseCode,
            command: error.command,
        });

        // Preserve the original error and its SMTP properties
        throw error;
    }
};
// ======

// module.exports.sendMail = async ({to, subject, text, html}) => {
//     try{        

//         const username = process.env.GMAIL_USERNAME
//         const password = process.env.GMAIL_PASSWORD

//         if(!username || !password){
//             throw new Error(`Missing Gmail credentials. Username exists: ${!!username}, ` +
//                 `Password exists: ${!!password}`)
//         }

//         let transporter  = nodemailer.createTransport({
//             host : "smtp.gmail.com",
//             port : 465,
//             secure : true,
//             auth : {
//                 user : username,
//                 pass : password
//             }
//         })

//         await transporter.verify()

//         let info = await transporter.sendMail({
//             from : `"Developer" <${process.env.GMAIL_USERNAME}>`,
//             to,
//             subject,
//             text,
//             html
//         })
//         // console.log(info, "Info ====")
//         // console.log(info.messageId, "Info from send mail utils")

//         console.log("Message sent from helper: ", info.messageId)
//         return info

//     }catch(error){
//         throw new Error(`Got some ${error}`)
//     }
// }

module.exports.campaignUsers = async (file, fs, parse) => {
try{  
    const fileData = fs.readFileSync(file.path, "utf-8")

    const users = parse(
            // cleanedFileData,
            fileData,
            {
                columns: true,
                skip_empty_lines: true,
                trim: true
            }
        )

    // console.log(users, "users======")

    const data = users.filter(user => user.Email?.trim())
            .map(user => ({
                Customer_Id: user.Customer_Id,
                First_Name: user.First_Name,
                Last_Name: user.Last_Name,
                Company: user.Company,
                City: user.City,
                Country: user.Country,
                Phone: user.Phone,
                Email: user.Email,
                Subscription_Date: user.Subscription_Date,
                Website: user.Website
    }))
    console.log(data.length, "data from campaign")
    return data

    }catch(error){
        throw new Error("Got error while parsing csv file : " + error.message)
  }
}

module.exports.balanceDeductionParentTree = async ( parentTree, messageCount, validBalance) => {
    for (const id of parentTree) {
        const parentId = id.parentId;

        const { UserPrimary, UserSecondary } = await User

        const sendUser = await UserPrimary.findUser({ userId: parentId });
        console.log("sendUser", sendUser);

        const price = sendUser.price;

        let userWallet = sendUser.wallet.INR;

        messageCredit = messageCount * price;

        balance = validBalance(userWallet, messageCredit);

        if (!balance) {
            throw new Error(
                `User ${sendUser.name} insufficient balance in wallet, please recharge...!`
            );
        }

        const updateWallet = {
            userId: parentId,
            amount: -messageCredit,
        };
        await UserPrimary.updateUserWallet(updateWallet)
        await UserSecondary.updateUserWallet(updateWallet)

        console.log("Updated wallet : ", userWallet)
        return messageCredit;
    }
}

module.exports.bodyReplace = (body, variables = {}) => {
    if(!body) return ""
    return body.replace(
        /\{\{\s*([^{}]+?)\s*\}\}/g,
        (match, key) => {
            const value = variables[key.trim()]
            return value !== undefined && value !== null
                ? String(value)
                : match;
        }
    )
}


const crypto = require("crypto-js");

module.exports.encryptedData = (data) => {
    try{
        const encrypted = crypto.AES.encrypt( data, process.env.KEY ).toString();
        console.log(encrypted, "Data encrypted successful")
        return encrypted
    }catch(error){
        throw error
    }
}

module.exports.decryptedData = (data) => {
    try{
        const decrypted = crypto.AES.decrypt( data, process.env.KEY ).toString(crypto.enc.Utf8)
        console.log(decrypted, "data decrypted successful")
        return decrypted
    }catch(error){
        throw error
    }
}

module.exports.searchAlgorithm = (model, element) => {
    const escapeRegex = (str) =>
        String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // No search → no conditions
    if (!element || !String(element).trim()) {
        return [];
    }

    const value = String(element).trim();

    const escapedDecryptedValue = escapeRegex(value);

    const search = [];

    Object.values(model.schema.paths).forEach((field) => {
        if (field.options?.search !== true) {
            return;
        }

        search.push({
            [field.path]: {
                $regex: escapedDecryptedValue,
                $options: "i",
            },
        });
    });

    return search;
};


// const decrypted = crypto.AES.decrypt( U2FsdGVkX1977vXAWV7ZjxgZi92ZwAf46R3tbCOGo7P4N7Zaas+mGsod266mwX1F, process.env.KEY ).toString(crypto.enc.Utf8)

module.exports.createLookupHook = (data) => {
    try{
        const lookup = crypto.HmacSHA256(
            String(data).trim().toLowerCase(),
            process.env.HMAC_KEY
        ).toString(crypto.enc.Hex)
        return lookup
    }catch(error){
        throw error
    }
}

module.exports.singleUpload = async ({ file, uploadOnCloudinary }) => {
    try{
        console.log(file, "file======")
        console.log(uploadOnCloudinary, "uploadOnCloudinary")
        if (!file?.path) {
            throw new Error("Uploaded file path is missing");
        }
        const uploadedFile  = await uploadOnCloudinary(file.path, file.mimetype)
        console.log(uploadedFile , "uploadedFile ==========")

        return uploadedFile
    }catch(error){
        console.log(error, "Error====")
        throw new Error (`Got some ${error}`)
    }
}

// module.exports.getModelData = async (model) => {
//     const { primarySchema, secondarySechema } = await model

//     const primary = await primarySchema
//     const secondary = await secondarySechema

//     return { primary, secondary }
// }