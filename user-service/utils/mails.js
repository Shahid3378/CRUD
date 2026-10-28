const nodemailer = require('nodemailer')
const response = require("./response")

module.exports.sendMail = async ({to, subject, text, html}) => {
    try{
        // console.log("to : ", to, " subject : ", subject," text : ", text, " html : ", html, "to, subject, text & html from sendMail util......")
        
            let transpoter = nodemailer.createTransport({
            host : "smtp.gmail.com",
            port : 465,
            secure : true,
            auth : {
                user : process.env.GMAIL_USERNAME,
                pass : process.env.GMAIL_PASSWORD
            }
        })
        
        await transpoter.verify()
        // console.log("SMTP authentication successfull from utils mail.js");
        
        let info = await transpoter.sendMail({
            from : `"Developer" <${process.env.GMAIL_USERNAME}>`,
            to,
            subject,
            text,
            html
        })
        // console.log(info, "Info ====")
        // console.log(info.messageId, "Info from send mail utils")


        // console.log("Message sent: ", info.messageId)
        return info

    }catch(error){
        return response.error(res, "Got error while sending emails : ", error)
        // throw new Error("Got error while sending emails : ")
    }
}
