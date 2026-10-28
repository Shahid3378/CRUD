const jwt = require("jsonwebtoken")
const response = require("../../utils/response")
const User = require('../../model/userModel')

module.exports.authMiddleware = async (req, res, next) => {
    try{
        const authHeader = req.headers.authorization
        // console.log("Authorization : ", authHeader)

        if(authHeader){
            // return response.error(res, "Authorization header is missing")
        // }

            const [type, token] = authHeader.split(" ")
            // console.log(type," type ", token, " token ")

            if((type !== "Bearer" || !token)){
                return response.error(res, "Invalid authorization")
            }

            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            )
            // console.log("decode", decoded)
            req.userInfo = decoded

            return next()
        }

        // if(token){
        //     // if(apiKey){
        // // return response.error(res, 'missing api key / invalid api key')

        //     const user = await User.findUser({token})
    
        //     if(!user){
        //         return response.error(res, "User not found")
        //     }

        //     req.userInfo = {
        //         userId: user.userId,
        //         parentTree: user.parentTree,
        //         username: user.username,
        //         userType: user.userType
        //     };

        //     return next()
        // }
        // return next()

        const apiKey = req.headers["x-api-key"]
        console.log(apiKey, "=====apiKey=====")

        if(apiKey){
            // return response.error(res, 'missing api key / invalid api key')

            const { UserPrimary:primary, UserSecondary:secondary } = await User

            console.log("Primary:", primary?.modelName);
            console.log("Secondary:", secondary?.modelName);
            console.log("Primary findUser:", typeof primary?.findUser);
            console.log("Secondary findUser:", typeof secondary?.findUser);

            const user = await primary.findUser({apiKey:apiKey})
            const secondaryParentUser = await secondary.findUser({apiKey:apiKey})
            // console.log(secondaryParentUser, "secondaryParentUser from auth Middleware")

            // const user = await User.findUser({apiKey:apiKey})

            if(!user){
                return response.error(res, "User not found")
            }

            req.userInfo = user;

            return next()
        }

        // return response.error(
        //     res,
        //     "Authorization token or API key is required"
        // );

    }catch(err){
        return response.error(res, `Error : ${err}`)
    }
}