const Joi = require('joi')
const {errorMsg} = require('../../utils/errMsg')
const {validate} = require('../middleware/joi_validator')

module.exports.signUp = async (req, res, next) => {
    const payload = Joi.array().items(
        Joi.object({
            name : Joi.string().min(3).max(20).required().error(new Error (errorMsg.nameErr)),
            username : Joi.string().min(3).max(25).required().error(new Error (errorMsg.usernameErr)),
            email : Joi.string().min(3).required().error(new Error (errorMsg.emailErr)),
            password : Joi.string().min(8).max(20).required().error(new Error (errorMsg.passwordErr)),
            // price : Joi.number().required().error(new Error (errorMsg.priceErr)),
            // userType : Joi.string().required().error(new Error(errorMsg.userType)),
            number : Joi.string().trim().required().error(new Error (errorMsg.numberErr)),
        })
    )

    try {
        const value = await validate( req, payload )
        req.value = value
        next()
    } catch (error) {
        next(error)
    }
}

module.exports.verifyOtp = async (req, res, next) => {
    const payload = Joi.object({
        userId : Joi.string().min(3).required().error(new Error (errorMsg.userIdErr)),
        otp : Joi.number().min(100000).max(999999).required(),
    })
    
    try {
        const value = await validate( req, payload )
        req.value = value
        next()
    } catch (error) {
        next(error)
    }
}

module.exports.login = async (req, res, next) => {

    const payload = Joi.object({
        username : Joi.string().min(3).max(25).required().error(new Error (errorMsg.usernameErr)),
        password : Joi.string().min(8).max(20).required().error(new Error (errorMsg.passwordErr)),
    })

    try {
        const value = await validate( req, payload )
        req.value = value
        next()
    } catch (error) {
        next(error)
    }
}

module.exports.addBalance= async (req, res, next) => {
    const payload = Joi.object({
        userId : Joi.number().required().error(new Error (errorMsg.userIdErr)),
        email : Joi.string().min(3).required().error(new Error (errorMsg.emailErr)),
        amount : Joi.number().min(10).required()
    })

    try {
        const value = await validate( req, payload )
        req.value = value
        next()
    } catch (error) {
        next(error)
    }
}

module.exports.createUser = async (req, res, next) => {
    const payload = Joi.object({
        name : Joi.string().min(3).max(20).required().error(new Error (errorMsg.nameErr)),
        username : Joi.string().min(3).max(25).required().error(new Error (errorMsg.usernameErr)),
        email : Joi.string().min(3).required().error(new Error (errorMsg.emailErr)),
        password : Joi.string().min(8).max(20).required().error(new Error (errorMsg.passwordErr)),
        // price : Joi.number().required().error(new Error (errorMsg.priceErr)),
        // userType : Joi.string().required().error(new Error(errorMsg.userType)),
        number : Joi.number().min(10).required().error(new Error (errorMsg.numberErr))
    })

    try {
        const value = await validate( req, payload )
        req.value = value
        next()
    } catch (error) {
        next(error)
    }
}

module.exports.userList = async (req, res, next) => {
    const payload = Joi.object({
        username : Joi.string().min(3).max(25).required().error(new Error (errorMsg.usernameErr)),
        email : Joi.string().min(3).required().error(new Error (errorMsg.emailErr)),
        userType : Joi.string().required().error(new Error(errorMsg.userType))
    })

    try {
        const value = await validate( req, payload )
        req.value = value
        next()
    } catch (error) {
        next(error)
    }
}

module.exports.userData = async (req, res, next) => {
    const payload = Joi.object({
        start : Joi.number().required().error(new Error (errorMsg.startErr)),
        length : Joi.number().required().error(new Error (errorMsg.lengthErr)),
        sorting : Joi.object().required().error(new Error (errorMsg.searchingErr)),
        searching : Joi.string().required().allow(null, "").error(new Error(errorMsg.searchingErr))
    })

    try {
        const value = await validate( req, payload )
        req.value = value
        next()
    } catch (error) {
        next(error)
    }
}

module.exports.deleteUser = async (req, res, next) => {
    const payload = Joi.object({
        username : Joi.string().min(3).max(25).required().error(new Error (errorMsg.usernameErr)),
        email : Joi.string().min(3).required().error(new Error (errorMsg.emailErr)),
        userType : Joi.string().required().error(new Error(errorMsg.userType)),
    })

    try {
        const value = await validate( req, payload )
        req.value = value
        next()
    } catch (error) {
        next(error)
    }
}
