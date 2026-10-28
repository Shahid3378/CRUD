const Joi = require("joi")
const response = require("../../utils/response")
const { errorMsg } = require("../../utils/errMsg")

module.exports.validationSendmail = (req, res, next) => {
    try{
        const sendMailSchema = Joi.object({
                templateId: Joi.string().required().error(new Error(errorMsg.template.templateName)),
                emails: Joi.array().items(Joi.string().email()).required().optional().min(1),
                variables: Joi.array().items(Joi.string()).required().optional().min(1)
            })

        const { error } = sendMailSchema.validate(req.body)
        if(error){
            return response.error(res, error.message)
        }

        next()

    }catch(err){
        next(err)
    }

}