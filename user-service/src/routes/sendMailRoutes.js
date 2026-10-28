const express = require("express")
const router = express.Router()
const sendMailController = require("../controller/sendMailsController")
const {authMiddleware} = require("../middleware/authMiddleware")
const {validationSendmail} = require("../validation/sendMail.Validation")
const { upload } = require('../middleware/multer.middleware')

router.post("/sendMails", authMiddleware, validationSendmail, upload.single('document'), sendMailController.userSendMail)

module.exports = router
