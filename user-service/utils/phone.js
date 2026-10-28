// const { PhoneNumberUtil, PhoneNumberFormat } = require("google-libphonenumber")

// const phoneUtil = PhoneNumberUtil.getInstance()

// const validatePhone = (phone, region = "IN") => {
//     try{
//         if(!phone){
//             return {
//                 valid:false,
//                 message:"Phone number is required"
//             }
//         }

//         const parseNumber = phoneUtil.parseAndKeepRawInput(String(phone), region)

//         const isValid = phoneUtil.isValidNumber(parseNumber)

//         if(!isValid){
//             return {
//                 valid:false,
//                 message:"Invalid phone number"
//             }
//         }

//         const formattedNumber = phoneUtil.format( parseNumber, PhoneNumberFormat.E164)

//         const detectedRegion = phoneUtil.getRegionCodeForCountryCode(parseNumber)

//         return {
//             valid: true,
//             number: formattedNumber,
//             region: detectedRegion
//         }

//     }catch(error){
//         return {
//             valid: false,
//             message: "Invalid phone number format"
//         }
//     }
// }

// module.exports=[ validatePhone ]