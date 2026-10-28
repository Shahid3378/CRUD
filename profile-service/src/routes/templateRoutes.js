//      Express
// ===============

// const express = require('express')
// const router = express.Router()

// const { authMiddleware } = require("../middleware/authMiddleware");
// const { forwardTemplate } = require('../controllers/profileTemplateController')
// const { upload } = require("../middleware/multer.middleware")

// const routes = [ 
//     "/addTemp", 
//     "/templateListDownload" 
// ]

// routes.forEach( (route) => {
//     router.post( route , authMiddleware, upload.single("image"), forwardTemplate)
// })

// module.exports = router;

//      Fastify
// =================

async function templateRoutes(fastify, options) {

    const { authMiddleware } = require("../middleware/authMiddleware");
    const { forwardTemplate } = require('../controllers/profileTemplateController')
    const { addTemplate } = require("../validation/template.Validation")

    const routes = [ "/addTemp", "/templateListDownload" ]

    routes.forEach( (route) => {
        fastify.post( 
            route, 
            { preHandler: [ authMiddleware, addTemplate ] },
            forwardTemplate 
        )
    })
}

module.exports = templateRoutes