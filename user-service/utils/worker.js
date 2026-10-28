const path = require("path");

const envPath = path.resolve(__dirname, "../.env");

const result = require("dotenv").config({
    path: envPath
});
// require("dotenv").config()

const { consumer } = require("./rabbitMQ")
const { sendMail, bodyReplace } = require('./helper')
const Template = require('../model/templateModel')
const { dbConnection_1, dbConnection_2 } = require('../connections/DBConnection')

const startWorker = async () => {
    try{
        console.log("Worker environment check:", {
            usernameExists: !!process.env.GMAIL_USERNAME,
            passwordExists: !!process.env.GMAIL_PASSWORD,
            pid: process.pid
        });

        await Promise.all([
            dbConnection_1(),
            dbConnection_2()
        ])

        await consumer( async (data) => {
            console.log('Email job recived: ', data)

            const { TemplatePrimary, TemplateSecondary } = await Template
        
            const template = await TemplatePrimary.findTemp({ templateId: data.templateId})
        
            if(!template){
                throw new Error(`Template not found : ${data.templateId}`)
            }

            const userBody = bodyReplace( template.body, data.variables )

            const info = await sendMail({
                        to: data.to,
                        subject: "Campaign Mail Test",
                        text: userBody,
                        html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
                        <h2>${template.name}</h2>
            
                        <p>${userBody}</p>
            
                        <img
                            src="${template.mediaURL}"
                            alt="Image"
                            width="600"
                            style="display: block; width: 100%; max-width: 600px; height: auto;"
                        />
            
                        <p style="color: #888; font-size: 12px;">
                            This is an automated email.
                        </p>
                        </div>
                        `,
                    });

            // console.log("GMAIL_USERNAME exists:", !!process.env.GMAIL_USERNAME);
            // console.log("GMAIL_PASSWORD exists:", !!process.env.GMAIL_PASSWORD);
            // console.log(info, "Info from send mail worker")
        })

    } catch(err){
        throw new Error(`Error in worker: ${err.message}`)
    }
}

startWorker()