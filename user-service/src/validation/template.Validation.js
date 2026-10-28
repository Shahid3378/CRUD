const Joi = require("joi")
const {errorMsg} = require("../../utils/errMsg")
const response = require("../../utils/response")

module.exports.addTemplate = (req, res, next) => {
    try{
        const templateSchema = Joi.object({
                name: Joi.string().min(3).required().error(new Error (errorMsg.nameErr)),
                body: Joi.string().required(),
                isVariable: Joi.boolean().required(),
                mediaURL: Joi.string().uri().optional()
            }) 

        const { error } = templateSchema.validate(req.body)
        if(error){
            return response.error(res, error.message)
        }
    
        next()
    } catch(err){
        next(err)
    }
}