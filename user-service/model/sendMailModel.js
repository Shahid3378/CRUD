const mongoose = require("mongoose")
const {v4 : uuidv4} = require('uuid')
const defaultCall = require("../utils/defaultCall");
const { dbConnection_1, dbConnection_2 } = require("../connections/DBConnection")

const schema = new mongoose.Schema({
    messageId:{ type:String, default : () => uuidv4() },
    userId:{ type:String, },
    username:{ type:String },
    templateId:{ type:String },
    body:{ type:String },
    messageIds:{ type:Array, default:[] },
    messageCredit:{ type:Number, default:0 },
    messageCount:{ type:Number, default:0 },
    createdAt: { type: Number, default: () => defaultCall.setDate() },
    variables:{ type:Array, default:[] }
})

class sendMailMethod{

    static async createMailRecord({userId, username, templateId, body, messageCredit, messageCount, messageIds, variables}){

        // console.log(`userId:${userId}, username:${username}, templateId:${templateId}, messageCredit:${messageCredit}, messageCount:${messageCount}, variables:${variables} ====== From sendMailModel create`)

        return await this.create({
            userId,
            username,
            templateId,
            body,
            messageCredit,
            messageCount,
            messageIds,
            variables,
        })
    }
}

// schema.loadClass(sendMailMethod)
// module.exports = mongoose.model("Email", schema)

// module.exports = ( async () => {
//     const [primary, secondary] = await Promise.all([db1, db2])

//     schema.loadClass(sendMailMethod)
//     return {
//         MailPrimary : primary.model("Email", schema),
//         MailSecondary : secondary.model("Email", schema)
//     }
// })()


module.exports = (async () => {
    const [primary, secondary] = await Promise.all([
        dbConnection_1(),
        dbConnection_2()
    ]);

    schema.loadClass(sendMailMethod);

    const MailPrimary = primary.model("Email", schema.clone());
    const MailSecondary = secondary.model("Email", schema.clone());

    // console.log("Primary DB:", MailPrimary.db.name);
    // console.log("Secondary DB:", MailSecondary.db.name);
    // console.log(
    //     "Same connection?",
    //     MailPrimary.db === MailSecondary.db
    // );

    return { MailPrimary, MailSecondary };
})();
