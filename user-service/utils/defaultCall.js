module.exports.randomGenerateId = () => {
    return Math.floor(1000000000 + Math.random() * 1000000000).toString()
}

module.exports.setDate = () => {
    return Date.now().toString()
}

module.exports.otp = () => {
    return Math.floor(100000 + Math.random() * 100000)
}

module.exports.randomStringGenerate = () => {
    const char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let length = 32
    let result = ""
    for(let i=0; i<length; i++){
        const randomchar = Math.floor(Math.random() * char.length)
        result += char[randomchar]
    }
    console.log(result, "API key genrated...!")
    return result
}


// const crypto = require("crypto-js");
// const response = require('./response')

// module.exports.encryptedUsername = (username) => {
//     try{
//         const encrypted = crypto.AES.encrypt(username, process.env.KEY).toString();
//         console.log(encrypted, "Encrypted username")
//         return response.success(res, encrypted, "Username encrypted successful")
//     }catch(error){
//         return response.error(res, `Got error while encrypting username ${error}`)
//     }
// }

// module.exports.decryptedUsername = (hashedUsername) => {
//     try{
//         decrypted = crypto.AES.decrypt(hashedUsername, process.env.KEY)
//         console.log(decrypted, "decrypted username")
//         return response.success(res, decrypted, "USername decrypted successful" )
//     }catch(error){
//         return response.error(res, `Got error while encrypting username ${error}`)
//     }
// }