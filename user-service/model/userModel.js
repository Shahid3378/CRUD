const mongoose = require("mongoose");
const defaultCall = require("../utils/defaultCall");
// const helper = require("../utils/helper")
const { dbConnection_1, dbConnection_2 } = require("../connections/DBConnection");
// const {v4 : uuidv4} = require('uuid')

const schema = new mongoose.Schema({
    userId: { type: String, default: () => defaultCall.randomGenerateId() },
    name: { type: String, default: "", search: true },
    username: { type: String, default: "", search: true },
    usernameLookup: { type: String, default: "", search: true },
    email: { type: String, default: "", search: true },
    emailLookup: { type: String, default: "", search: true },
    password: { type: String, required: true },
    number: { type: String, default: "", search: true },
    userType: { type: String, default: "", search: true },
    price: { type: Number, default: 0, search: true },
    wallet: { type: Object, default: {}, search: true },
    parentTree: { type: Array, default: [], search: true },
    isActive: { type: Boolean, default: true, search: true },
    createdAt: { type: Number, default: () => defaultCall.setDate() },
    apiKey: { type: String, default: () => defaultCall.randomStringGenerate(), search: true},
    isDeleted: { type: Boolean, default: null },
});

// }, { timestamps: true });
// use only timestamp or createdAt func
// because timestamp automatically give createdAt & updatedAt

schema.index({ userId: 1, username: 1 });

class userMethods {
    static async findUser({ usernameLookup, emailLookup, userId, apiKey }) {
        // console.log(usernameLookup, "userModel==")
        return this.findOne({
            $or: [{ usernameLookup }, { emailLookup }, { userId }, { apiKey }],
        });
    }

    static async findAllChildUser(userId) {
        return this.find(
            { "parentTree.parentId": userId },
            { userId: 1, username: 1 },
        );
    }

    static async findAllUser() {
        return this.find();
    }

    static async findSuperAdmin(){
        return this.findOne({userType: "superAdmin"})
    }

    static async paginationSkip({ skip, length, sorting, searchCondition }) {
        return this.aggregate([
            { $or: [{ $match: searchCondition }] },
            { $sort: sorting },
            { $skip: Number(skip) },
            { $limit: Number(length) },
        ]);
    }

    static async updateUserWallet({ userId, amount }) {
        return this.findOneAndUpdate(
            { userId },
            { $inc: { "wallet.INR": amount } },
            { new: true },
        );
    }

    static async getUserTempData() {
        return this.aggregate([
            {
                $lookup: {
                    from: "temps",
                    localField: "userId",
                    foreignField: "userId",
                    as: "tempDetails",
                },
            },
            {
                $lookup: {
                    from: "emails",
                    localField: "userId",
                    foreignField: "userId",
                    as: "emailDetails",
                },
            },
            {
                $project: {
                    name: 1,
                    username: 1,
                    "tempDetails.name": 1,
                    "tempDetails.body": 1,
                    "tempDetails.templateId": 1,
                    "emailDetails.messageCredit": 1,
                    "emailDetails.messageCount": 1,
                },
            },
        ]);
    }

    static async checkCompoundIndex(userId, userType) {
        const result = await this.find({
            userId: userId,
            userType: userType,
        }).explain("executionStats");

        return result
    }

    static async createUser({ name, username, email, usernameLookup, emailLookup, password, number, wallet, userType, parentTree, userId, price}) {
        // helper.checkUserType(userType);
        return await this.create({
            userId,
            name,
            userType: userType,
            username,
            usernameLookup,
            emailLookup,
            email,
            password,
            number,
            price,
            wallet,
            parentTree,
        });
    }

    static async softDeleteHierarchy(userId) {
        return this.updateMany(
            {
                $or: [{ userId: userId }, { "parentTree.parentId": userId }],
            },
            {
                $set: { isDeleted: true, isActive: false },
            },
        );
    }

    static async restoreUser(userId) {
        return await this.updateMany(
            {
                $or: [{ userId: userId }, { "parentTree.parentId": userId }],
            },
            {
                $set: { isDeleted: false, isActive: true },
            },
        );
    }

    static async getUsers({ query, start = 0, length = 10, sorting = { createdAt: -1 }} = {}) {
        const skip = Math.max(Number(start) || 0, 0);
        const limit = Math.max(Number(length) || 10, 1);

        const pipeline = [
            { $match: query },
            {
                $facet: {
                    data: [
                        { $sort: sorting }, 
                        { $skip: skip }, 
                        { $limit: limit }
                    ],
                    total: [{ $count: "count" }],
                },
            },
        ];
        const [result] = await this.aggregate(pipeline);
        return {
            data: result?.data || [],
            total: result?.total?.[0]?.count || 0,
        };
    }
}

// module.exports = mongoose.model("User", schema);

module.exports = (async () => {
    const [primary, secondary] = await Promise.all([
        dbConnection_1(),
        dbConnection_2()
    ]);

    schema.loadClass(userMethods);

    const UserPrimary = primary.model("User", schema.clone());
    const UserSecondary = secondary.model("User", schema.clone());

    // console.log("Primary DB:", UserPrimary.db.name);
    // console.log("Secondary DB:", UserSecondary.db.name);
    // console.log(
    //     "Same connection?",
    //     UserPrimary.db === UserSecondary.db
    // );

    return { UserPrimary, UserSecondary };
})();
