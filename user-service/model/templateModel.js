const mongoose = require("mongoose")
const defaultCall = require("../utils/defaultCall")
const { dbConnection_1, dbConnection_2 } = require("../connections/DBConnection")

const schema = new mongoose.Schema({
    userId:{ type:String, },
    templateId:{ type:String, default:() => defaultCall.randomGenerateId() },
    body:{ type:String },
    name:{ type:String },
    username:{ type:String },
    parentTree:{  type: Array, default: () => [] },
    userType:{ type:String, default: "" },
    isVariable:{ type:Boolean, default:false },
    mediaURL:{ type: String, default :""}

    // mediaURL:{ type: Array, default : () => []}
})

class templateMethod{

    static async findTemp({templateId, name}){
        return this.findOne({ $or: [{ templateId }, { name } ]})
    }

    static async allTemplates(){
        return this.find()
    }

    static async createTemplate({templateId, name, body, username, userId, userType, parentTree, isVariable, isFile, mediaURL}){
        return this.create({ templateId, name, username, body, userId, userType, parentTree, isVariable, isFile, mediaURL })
    }
}

// schema.loadClass(templateMethod)
// module.exports = mongoose.model("Temp", schema)

// module.exports =( async() => {
//     const [primary, secondary] = await Promise.all([db1, db2])

//     schema.loadClass(templateMethod)

//     return {
//         TemplatePrimary : primary.model("Temp", schema),
//         TemplateSecondary : secondary.model("TemplateSecondary", schema)
//     }
// })()


module.exports = (async () => {
    const [primary, secondary] = await Promise.all([
        dbConnection_1(),
        dbConnection_2()
    ]);

    schema.loadClass(templateMethod);

    const TemplatePrimary = primary.model("Temp", schema.clone());
    const TemplateSecondary = secondary.model("Temp", schema.clone());

    // console.log("Primary DB:", TemplatePrimary.db.name);
    // console.log("Secondary DB:", TemplateSecondary.db.name);
    // console.log(
    //     "Same connection?",
    //     TemplatePrimary.db === TemplateSecondary.db
    // );

    return { TemplatePrimary, TemplateSecondary };
})();
