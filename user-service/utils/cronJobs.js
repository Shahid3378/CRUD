const cron = require("node-cron");

const User = require("../model/userModel");

const { cache } = require("../connections/cacheConnection");

const refreshUserCache = async () => {
    try {
        console.log("Refreshing individual user cache...");

        const { UserPrimary: primary, UserSecondary: secondary } = await User;

        const [primaryUsers, secondaryUsers] = await Promise.all([
            primary.findAllUser(),
            secondary.findAllUser()
        ]);

        const usersMap = new Map()

        for (const user of secondaryUsers) {
            usersMap.set(user.userId, user);
        }

        for (const user of primaryUsers) {
            usersMap.set(user.userId, user);
        }

        for(const user of usersMap.values()){
            const cacheKey = `user:${user.userId}`
            cache.set(cacheKey, user)
        }

        const allUsers = Array.from(usersMap.values())
        cache.set('allUser', allUsers)

        // console.log("Worker cache keys:", cache.keys());
        // console.log("Worker cache count:", cache.keys().length);

        console.log("Total users cached: ", usersMap.size)
    } catch (error) {
        console.error("Cache refresh failed:", error.message);
    }
};


const startUserCacheJob = () => {
    cron.schedule("* * * * *", refreshUserCache);
    console.log("User cache cron started");
};

module.exports.startCron = async () => {

    await refreshUserCache();
    startUserCacheJob();

}