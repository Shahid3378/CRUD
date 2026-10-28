const userApi = require("../config/axios");
// const response = require("../../utils/response")

module.exports.forwardrequest = async (request) => {
    try{

        const headers = {};
    
        // Forward authentication token, if present
        if (request.headers.authorization) {
            headers.authorization = request.headers.authorization;
        }

        // Forward API key, if present
        if (request.headers["x-api-key"]) {
            headers["x-api-key"] = request.headers["x-api-key"];
        }
    
        const response = await userApi.request({
            method: request.method,
            url: request.url,
            data: request.body,
            params: request.query,
            headers
        });
    
        return {
            status: response.status,
            data: response.data
        };
    }catch(error){
        console.error("Axios error:", {
        message: error.message,
        code: error.code,
        url: error.config?.baseURL + error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
    });
        // return response.success(res, `Got some ${error}`)
        throw error    }
};