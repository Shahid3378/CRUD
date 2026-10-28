const express = require("express")
const router = express.Router()
const userController = require("../controller/userController")
const userValidation = require("../validation/user.Validation")
const {authMiddleware} = require("../middleware/authMiddleware")
// const { upload } = require("../middleware/multer.middleware")


router.post("/signUp", userValidation.signUp, userController.signUp)
router.post("/verifyOtp", userValidation.verifyOtp, userController.verifyOtp);
router.post('/login', userValidation.login, userController.login)
router.post('/addBalance', authMiddleware, userValidation.addBalance, userController.addBalance)
router.post('/createUser', authMiddleware, userValidation.createUser, userController.createUser)
// router.post('/userList', authMiddleware, userValidation.userList, userController.userList)
router.post('/getChildUsers', authMiddleware, userController.getChildUsers)
router.post('/userTempDetails', authMiddleware, userController.userTempDetails)
// router.post('/campaign', authMiddleware, upload.single('document'), userController.campaignUsers)

// router.post('/upload', authMiddleware, upload.single('image'), userController.upload)

// router.post('/upload', authMiddleware, upload.array('image', 2), userController.upload)

// router.post('/upload', authMiddleware, upload.fields([
//         { name: 'images', maxCount: 2 },
//         { name: 'video',maxCount: 1 },
//         { name: 'documents', maxCount: 3 }
//     ]), userController.upload)



router.post('/usersData', authMiddleware, userValidation.userData, userController.usersData)
router.post('/delete', authMiddleware, userValidation.deleteUser, userController.deleteUser )

module.exports = router
