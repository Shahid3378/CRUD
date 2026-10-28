require("dotenv").config();

const mongoose = require("mongoose");

const User = require("./model/userModel");

const {
    encryptedData,
    createLookupHook,
    hashingPassword,
    createTree,
    createWallet
} = require("./utils/helper");


const MONGO_URL = "mongodb://localhost:27017/newProject";

const TOTAL_USERS = 100;
const TOTAL_RESELLERS = 20;
const TOTAL_END_USERS = 79;


const dbConnection = async () => {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("MongoDB connected");
    } catch (error) {
        console.log("MongoDB connection error:", error);
        process.exit(1);
    }
};


const createTestUser = async ({
    name,
    username,
    email,
    password,
    number,
    userType,
    price,
    parent
}) => {

    // Encrypt username
    const encryptedUsername = encryptedData(username);

    // Username lookup
    const usernameLookup = createLookupHook(username);

    // Encrypt email
    const encryptedEmail = encryptedData(email);

    // Email lookup
    const emailLookup = createLookupHook(email);

    // Hash password
    const hashedPassword = await hashingPassword(password);

    // IMPORTANT:
    // Make a copy of parent's parentTree
    // so createTree() doesn't mutate the original parent's tree.
    let parentCopy = null;

    if (parent) {
        parentCopy = {
            ...parent.toObject(),
            parentTree: [...parent.parentTree]
        };
    }

    // Create hierarchy
    const { tree, userId } = createTree({
        username: encryptedUsername,
        userType,
        parent: parentCopy
    });

    // Fixed wallet
    const wallet = createWallet(20, 0);

    const userData = {
        userId,

        name,

        username: encryptedUsername,
        usernameLookup,

        email: encryptedEmail,
        emailLookup,

        password: hashedPassword,

        number,

        userType,

        price,

        wallet,

        parentTree: tree,

        isActive: true
    };

    const { UserPrimary : primary, UserSecondary : secondary } = await User

    const user = await primary.create(userData);
    await secondary.create(userData)

    return user;
};


const seedUsers = async () => {

    try {

        await dbConnection();

        console.log("\n================================");
        console.log("STARTING 100 USER SEED");
        console.log("================================\n");


        /*
        ============================================================
        1. CREATE SUPER ADMIN
        ============================================================
        */

        const superAdmin = await createTestUser({
            name: "Shahid",
            username: "shahid",
            email: "shahid@gmail.com",
            password: "shahid@123",
            number: 9876500001,
            userType: "superAdmin",
            price: 1,
            parent: null
        });

        console.log(
            `1/100 - SuperAdmin created: ${superAdmin.userId}`
        );


        /*
        ============================================================
        2. CREATE 20 RESELLERS
        ============================================================
        */

        const resellers = [];

        for (let i = 1; i <= TOTAL_RESELLERS; i++) {

            const resellerNumber = String(i).padStart(3, "0");

            const reseller = await createTestUser({

                name: `Test Reseller ${i}`,

                username: `test_reseller_${resellerNumber}`,

                email: `reseller${resellerNumber}@test.com`,

                password: "Test@12345",

                number: 9876500000 + i,

                userType: "reseller",

                price: 1.5,

                // Every reseller directly belongs
                // to the SuperAdmin
                parent: superAdmin
            });

            resellers.push(reseller);

            console.log(
                `${i + 1}/100 - Reseller created: ${reseller.userId}`
            );
        }

        /*
        ============================================================
        3. CREATE 79 END USERS
        ============================================================
        */

        for (let i = 1; i <= TOTAL_END_USERS; i++) {

            const endUserNumber = String(i).padStart(3, "0");

            /*
            Distribute EndUsers among the 20 resellers.

            Example:

            EndUser 1  -> Reseller 1
            EndUser 2  -> Reseller 2
            ...
            EndUser 20 -> Reseller 20
            EndUser 21 -> Reseller 1
            ...
            */

            const resellerIndex =
                (i - 1) % TOTAL_RESELLERS;

            const parentReseller =
                resellers[resellerIndex];


            const endUser = await createTestUser({

                name: `Test End User ${i}`,

                username: `test_enduser_${endUserNumber}`,

                email: `enduser${endUserNumber}@test.com`,

                password: "Test@12345",

                number: 9880000000 + i,

                userType: "endUser",

                price: 2,

                parent: parentReseller
            });

            console.log(
                `${TOTAL_RESELLERS + i + 1}/100 - EndUser created: ${endUser.userId}`
            );
        }


        /*
        ============================================================
        FINAL RESULT
        ============================================================
        */

        console.log("\n================================");
        console.log("100 USERS CREATED SUCCESSFULLY");
        console.log("================================");

        console.log(`SuperAdmin : 1`);
        console.log(`Resellers  : ${TOTAL_RESELLERS}`);
        console.log(`EndUsers   : ${TOTAL_END_USERS}`);
        console.log(`Total      : ${TOTAL_USERS}`);

        console.log("\nHierarchy:");

        console.log(`
SuperAdmin
    |
    |-- Reseller 1
    |     |-- EndUser
    |     |-- EndUser
    |     └-- ...
    |
    |-- Reseller 2
    |     |-- EndUser
    |     └-- ...
    |
    |-- Reseller 3
    |
    └-- ...
        `);

    } catch (error) {

        console.error("\nSEED ERROR:");
        console.error(error);

    } finally {

        await mongoose.connection.close();

        console.log("MongoDB connection closed");
    }
};


seedUsers();