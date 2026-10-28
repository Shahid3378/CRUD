const express = require("express")
const router = express.Router()
const templateController = require("../controller/templateController")
const {authMiddleware} = require("../middleware/authMiddleware")
const templateValidation = require("../validation/template.Validation")
const { upload } = require("../middleware/multer.middleware")


router.post("/addTemp" , authMiddleware, templateValidation.addTemplate, upload.single('image'), templateController.addTemplate)
router.post("/templateListDownload" , authMiddleware, templateController.templateListDownload)


module.exports = router