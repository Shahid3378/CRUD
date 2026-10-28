// Express
// ===========

// module.exports.authMiddleware = (req, res, next) => {
//     const hasToken = Boolean(req.headers.authorization);
//     const hasApiKey = Boolean(req.headers["x-api-key"]);

//     if (!hasToken && !hasApiKey) {
//         return res.status(401).json({
//             success: false,
//             message: "Authorization token or API key is required"
//         });
//     }

//     return next();
// };


// Fastify
// ===========

module.exports.authMiddleware = async (request, reply) => {
    const hasToken = Boolean(request.headers.authorization);
    const hasApiKey = Boolean(request.headers["x-api-key"]);

    console.log("1. Auth middleware reached")
    if (!hasToken && !hasApiKey) {
        return reply.code(401).send({
            success: false,
            message: "Authorization token or API key is required"
        });
    }
};