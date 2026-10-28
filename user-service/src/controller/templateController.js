const temp = require("../../model/templateModel")
const response = require("../../utils/response")
const { randomGenerateId } = require("../../utils/defaultCall")
const { singleUpload, decryptedData } = require("../../utils/helper")
const { uploadOnCloudinary } = require("../../utils/cloudinary")
const { Parser } = require("json2csv");
const fs = require("fs")
const path = require("path")
const os = require("os")


module.exports.addTemplate = async (req, res) => {
    try{
        const { userId, username, parentTree, userType } = req.userInfo;
        const { name, body, isVariable } = req.body;
        let file = req.file;
        let media = null
        if(file){
            media = await singleUpload({file,uploadOnCloudinary})
        }
        const { TemplatePrimary:primary, TemplateSecondary:secondary } = await temp
        // console.log(template, "template")
        // return

        const existTemp = await primary.findTemp({ name })
        if(existTemp){
            return response.error(res, "Template already exist")
        }

        const templateId = randomGenerateId()

        const tempData = {
            templateId,
            userId,
            username,
            body,
            name,
            userType,
            parentTree,
            isVariable,
            mediaURL:media.url || ""
        }
        await primary.createTemplate(tempData)
        await secondary.createTemplate(tempData)

        console.log("Template Data : ", tempData)

        return response.success(res, tempData, "Template created")
    }catch(err){
        return response.error(res, `Error while addTemp : ${err}`)
    }
}

module.exports.templateListDownload = async (req, res) => {
    let csvPath;
    try{
        const apiKey = req.headers["x-api-key"]
        const {userId, parentTree, username, userType} = req.userInfo
        // console.log(userId, parentTree, username, userType)
        const { TemplatePrimary:primary, TemplateSecondary:secondary } = await temp

        const templateList = await primary.allTemplates() 

        const temps = templateList.map((user) => {

            user.username = decryptedData(user.username)

            user.parentTree = user.parentTree.map((parent) => { 
                return { parentId:parent.parentId, parentUser:decryptedData(parent.parentUser) }
            })

            return user

            // console.log(user)
            
        })
        // console.log(temp, "===============================")
        // console.dir(temp, { depth: null, colors: true });

        // return

        const fields = [ "userId", "name", "body", "username", "parentTree", "userType", "isVariable", "templateId", "mediaURL"]

        const parser = new Parser({ fields })
        // console.log(parser, "parser===")
        const csv = parser.parse(templateList);
        // console.log(csv, "csv===")

        csvPath = path.join(
            os.tmpdir(),
            `templateList_${Date.now()}.csv`
        )

        // console.log(csvPath, "csvPath===")

        fs.writeFileSync(csvPath, csv, "utf-8")

        const uploadResult = await uploadOnCloudinary( csvPath, "text/csv" )

        if(!uploadResult){
            throw new Error(`CSV upload failed`)
        }

        const data = [ {count:templateList.length}, uploadResult.url]
        return response.success(res, data, "template list data")
    }catch(err){
        if (csvPath && fs.existsSync(csvPath)) {
            fs.unlinkSync(csvPath);
        }
        return response.error(res, `Got some ${err}`)
    }
}

