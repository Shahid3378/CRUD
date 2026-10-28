const { forwardrequest } = require("../services/profileService");

// Express => (req, res) , (status, json)
// Fastify => (request, reply) , (code, send)

module.exports.forwardRequest = async (request, reply) => {
    try {
        const response = await forwardrequest(request);

        // Express
        // return res.status(response.status).json(response.data);

        // Fastify
        return reply.code(response.status).send(response.data)

    } catch (error) {
        console.error("UserService error:", error.response?.data || error.message );

        if (error.response) {
            return reply.code(error.response.status).send(error.response.data);
        }

        return reply.code(502).send({
            success: false,
            message: "UserService is unavailable"
        });
    }
};