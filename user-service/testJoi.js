// const Joi = require('joi');

// const schema = Joi.object({
//     name: Joi.string()
//         .min(3)
//         .max(20)
//         .required()
//         .error(new Error('Invalid name'))
// });

// const result = schema.validate({ name: 'Al' });

// console.log(result.error?.message);
// const dbConnection = require('./connections/DBConnection');
// const redisClient = require('./connections/redisConnection');
// const User = require('./model/userModel');

// const redisListing = async () => {
//     try {
//         await dbConnection(); // Connect to MongoDB first

//         const users = await User.findAllUser();
//         // console.log(users)
//         // return

//         const userData = []
 
//         users.forEach( async (user) => {
//             // console.log(user.email, "=====")
//             const cacheKey = `userId:${user.userId}`
//             const cacheData = {
//                 userId: user.userId,
//                 name: user.name,
//                 username: user.username,
//                 usernameLookup: user.usernameLookup,
//                 email: user.email,
//                 emailLookup: user.emailLookup,
//                 password: user.password,
//                 number: user.phone,
//                 userType: user.userType,
//                 price: user.price,
//                 wallet: user.wallet,
//                 parentTree: user.parentTree,
//                 apiKey: user.apiKey,
//             }
//             console.log(cacheData)
//             await redisClient.set(cacheKey, JSON.stringify(cacheData));
//             console.log(cacheKey, "cacheKey=====")
            
//             userData.push(`userId:${user.userId}`);
//         });

//         console.log(emails, "======");

//     } catch (error) {
//         console.error('Error:', error.message);
//     }
// };

// redisListing();


// =================================================
require("dotenv").config();

const { createClient } = require("redis");
const mongoose = require("mongoose");

const {
    dbConnection_1,
    dbConnection_2,
    closeConnections
} = require("./connections/DBConnection");

const User = require("./model/userModel");

const redisClient = createClient({
    url: process.env.REDIS_URL || "redis://127.0.0.1:6379"
});

redisClient.on("error", (error) => {
    console.error("Redis error:", error);
});

async function migrateRedisToMongo() {
    try {
        // 1. Connect to Redis
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }

        console.log("Redis connected");

        // 2. Connect to both MongoDB databases
        await Promise.all([
            dbConnection_1(),
            dbConnection_2()
        ]);

        console.log("Both MongoDB databases connected");

        // 3. Get models for both databases
        const {
            UserPrimary,
            UserSecondary
        } = await User;

        let migrated = 0;
        let skipped = 0;
        let failed = 0;

        // 4. Scan Redis keys matching userId:*
        // for await (const key of redisClient.scanIterator({
        //     MATCH: "userId:*",
        //     COUNT: 500
        // })) {
        //     try {
        //         const rawData = await redisClient.get(key);

        //         if (!rawData) {
        //             skipped++;
        //             continue;
        //         }

        //         // 5. Convert JSON string into object
        //         const userData = JSON.parse(rawData);

        //         if (!userData.userId) {
        //             console.warn("Missing userId:", key);
        //             skipped++;
        //             continue;
        //         }

        //         // Optional consistency check
        //         if (key !== `userId:${userData.userId}`) {
        //             console.warn("Key/userId mismatch:", key);
        //             skipped++;
        //             continue;
        //         }

        //         // 6. Insert into primary DB if not already present
        //         await UserPrimary.updateOne(
        //             { userId: userData.userId },
        //             { $setOnInsert: userData },
        //             { upsert: true }
        //         );

        //         // 7. Insert into secondary DB if not already present
        //         await UserSecondary.updateOne(
        //             { userId: userData.userId },
        //             { $setOnInsert: userData },
        //             { upsert: true }
        //         );

        //         migrated++;

        //         console.log(
        //             `${migrated}. User migrated: ${userData.userId}`
        //         );

        //     } catch (error) {
        //         failed++;
        //         console.error(
        //             `Failed to migrate ${key}:`,
        //             error.message
        //         );
        //     }
        // }

        
for await (const keys of redisClient.scanIterator({
    MATCH: "userId:*",
    COUNT: 100
})) {
    // scanIterator array of keys return kar sakta hai
    const keyList = Array.isArray(keys) ? keys : [keys];

    for (const key of keyList) {
        try {
            const rawData = await redisClient.get(key);

            if (!rawData) {
                console.log("Key has no data:", key);
                continue;
            }

            const userData = JSON.parse(rawData);

            if (!userData.userId) {
                console.log("Missing userId:", key);
                continue;
            }

            if (key !== `userId:${userData.userId}`) {
                console.log("Key mismatch:", key, userData.userId);
                continue;
            }

            await UserPrimary.updateOne(
                { userId: userData.userId },
                { $setOnInsert: userData },
                { upsert: true }
            );

            await UserSecondary.updateOne(
                { userId: userData.userId },
                { $setOnInsert: userData },
                { upsert: true }
            );

            migrated++;

            console.log(
                `${migrated}. User migrated: ${userData.userId}`
            );

        } catch (error) {
            failed++;
            console.error(
                `Failed to migrate key ${String(key)}:`,
                error.message
            );
        }
    }
}


        console.log("\n========== MIGRATION RESULT ==========");
        console.log("Processed successfully:", migrated);
        console.log("Skipped:", skipped);
        console.log("Failed:", failed);
        console.log("======================================");

    } catch (error) {
        console.error("Migration error:", error);

    } finally {
        // Close only connections opened by this script
        if (redisClient.isOpen) {
            await redisClient.quit();
        }

        // await closeConnections();

        console.log("Connections closed");
    }
}

migrateRedisToMongo();
//  ============================================