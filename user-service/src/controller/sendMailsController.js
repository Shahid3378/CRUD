// const nodemailer = require('nodemailer')
const sendMailModel = require("../../model/sendMailModel");
const User = require("../../model/userModel");
const { validBalance, campaignUsers, balanceDeductionParentTree, singleUpload } = require("../../utils/helper");
const response = require("../../utils/response");
// const { sendMail, bodyReplace } = require("../../utils/helper");
const templateModel = require("../../model/templateModel");
const { producer } = require('../../utils/rabbitMQ')

const fs = require("fs");
const { parse } = require("csv-parse/sync");
const { uploadOnCloudinary } = require("../../utils/cloudinary");

module.exports.userSendMail = async (req, res) => {
    try {
        const apiKey = req.headers["x-api-key"];

        const { MailPrimary , MailSecondary } = await sendMailModel
        const { UserPrimary , UserSecondary } = await User
        const { TemplatePrimary, TemplateSecondary } = await templateModel;

        let user;
        if (!apiKey) {
            user = req.userInfo;
        } else {
            user = await UserPrimary.findUser({ apiKey });
        }
        // console.log(user, "user========")

        let {userId, userType, username, parentTree} = user

        const file = req.file; // *
        const { templateId } = req.body;

        if(!file?.path){
            return response.error(res, "Please upload a CSV file")
        }

        if (!templateId) {
            return response.error(res, "Template ID is required");
        }

        const campaigndata = await campaignUsers(file, fs, parse);
        // console.log(campaigndata, "============")

        const emails = campaigndata.map((data) => data.Email);
        // console.log(emails, "emails======");
        
        const uploadFile = await singleUpload({file, uploadOnCloudinary})
        console.log(uploadFile, "UploadFile from sendMailController")
        
        
        const template = await TemplatePrimary.findTemp({ templateId });
        console.log("\nTemplate from sendMailController : ", template)
        
        if (!template) {
            return response.error(res, "Template not found");
        }
        
        // const isVariable = template.isVariable;
        let body = template.body;
        
        const messageCount = emails.length;
        console.log("Message count: ", messageCount);
        
        // let { messageCredit, balance } = {};
        
        const deduction = await balanceDeductionParentTree( parentTree, messageCount, validBalance);
        console.log(deduction, "========")
        // return

        const messageCredit = deduction;

        const messageIds = [];
        const variablesList = [];

        for(const campaignUser of campaigndata){
            const variables = {
                First_Name: campaignUser.First_Name,
                Last_Name: campaignUser.Last_Name,
                Company: campaignUser.Company,
                Subscription_Date: campaignUser.Subscription_Date,
                Website: campaignUser.Website
            }

            // const userBody = bodyReplace(body, variables)
            // const info = await sendMail({
            //     to: campaignUser.Email,
            //     subject: "Campaign Mail Test",
            //     text: userBody,
            //     html: `
            //     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
            //     <h2>${template.name}</h2>
    
            //     <p>${userBody}</p>
    
            //     <img
            //         src="${template.mediaURL}"
            //         alt="Image"
            //         width="600"
            //         style="display: block; width: 100%; max-width: 600px; height: auto;"
            //     />
    
            //     <p style="color: #888; font-size: 12px;">
            //         This is an automated email.
            //     </p>
            //     </div>
            //     `,
            // });

            await producer({
                to: campaignUser.Email,
                templateId,
                variables
            })
            // messageIds.push(info.messageId)
            variablesList.push(variables)
            // console.log(info.messageId, "Info from send mail controller");
        }


        const data = {
            userId,
            username,
            templateId,
            body,
            messageCredit,
            messageCount,
            messageIds,
            variables: variablesList,
            mediaURL: template.mediaURL || "",
        };

        await MailPrimary.createMailRecord(data)
        await MailSecondary.createMailRecord(data);

        // console.log("Data from sendMailController : ", data, "=====");
        console.log("Step-12")

        return response.success(
            res,
            data,
            "Info from send mail controller"
        );
    } catch (error) {
        return response.error(res, `Mails are not sent, got ${error}`);
    }
};
