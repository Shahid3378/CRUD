//      Express
// ----------------

// const express = require('express')
// const router = express.Router()

// const { upload } = require('../controllers/profileSendMailController')

// const profileSendMailController = require('../controllers/profileSendMailController')

// router.post("/sendMails", profileSendMailController.forwardSendMail)

// module.exports = router

//      Fastify
// -----------------

async function sendMailRoutess(fastify, option){

    const { authMiddleware } = require('../middleware/authMiddleware')
    const { parseSendMailMultipart } = require('../middleware/parseSendMailMultipart')
    const { forwardSendMail } = require('../controllers/profileSendMailController')
    const { validationSendmail } = require('../validation/sendMail.Validation')

    fastify.post("/sendMails", { preHandler: [ authMiddleware, parseSendMailMultipart, validationSendmail ]}, forwardSendMail)

}
module.exports = sendMailRoutess