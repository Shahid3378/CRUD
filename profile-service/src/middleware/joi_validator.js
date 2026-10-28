// const Joi = require('joi')
const _ = require('lodash')

module.exports.validate = async (req, paylaod)=>{
    reqData = _.merge(req.body, req.params, req.query)
    result = paylaod.validate(reqData)
    if(result.error) throw (result.error) 
    return result?.value
}