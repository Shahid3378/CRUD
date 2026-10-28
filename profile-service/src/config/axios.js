const axios = require("axios")

const userApi= axios.create({
    baseURL: process.env.USER_SERVICE_URL,
    timeout: 10000
})

module.exports = userApi