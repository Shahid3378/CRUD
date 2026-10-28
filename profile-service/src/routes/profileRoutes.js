
//    Express
// -------------

// const express = require("express");
// const router = express.Router();

// const profileController = require("../controllers/profileController");
// const { authMiddleware } = require("../middleware/authMiddleware")

// const publicRoutes = [ "/signUp", "/verifyOtp", "/login" ]

// const protectedRoutes = [ "/addBalance", "/createUser", "/getChildUsers", "/userTempDetails", "/usersData", "/delete" ] 


// publicRoutes.forEach( (route) => {
//     router.post( route , authMiddleware, profileController.forwardRequest)
// })

// protectedRoutes.forEach( (route) => {
//     router.post( route, authMiddleware, profileController.forwardRequest)
// })

// module.exports = router;


//    Fastify
// -------------

async function profileRoutes(fastify, options) {

    const profileController = require("../controllers/profileController");
    const { authMiddleware } = require("../middleware/authMiddleware")

    const publicRoutes = [ "/signUp", "/verifyOtp", "/login" ]

    const protectedRoutes = [ "/addBalance", "/createUser", "/getChildUsers", "/userTempDetails", "/usersData", "/delete" ] 

    publicRoutes.forEach((route) => {
        fastify.post(route, profileController.forwardRequest);
    });

    protectedRoutes.forEach((route) => {
        fastify.post(
            route,
            {
                preHandler: authMiddleware
            },
            profileController.forwardRequest
        );
    });
}

module.exports = profileRoutes;