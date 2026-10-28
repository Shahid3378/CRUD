require("dotenv").config();

const fastify = require("fastify")({ logger: true });
const multipart = require("@fastify/multipart");

const userRouters = require("./routes/profileRoutes");
const templateRouters = require("./routes/templateRoutes");
const sendMailRoutes = require("./routes/sendMailRoutes");

const PORT = Number(process.env.PORT) || 3001;

// Health-check route
fastify.get("/", async (request, reply) => {
    return reply.send({
        success: true,
        message: "Profile Service is running"
    });
});

fastify.addHook("onRequest", async (request, reply) => {
    console.log("Incoming Content-Type:", request.headers["content-type"]);
});

fastify.register(multipart, {
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
        files: 1,
        fields: 10
    }
});

// Register route plugins
fastify.register(userRouters);
fastify.register(templateRouters);
fastify.register(sendMailRoutes);

async function startServer() {
    try {
        await fastify.listen({
            port: PORT,
            host: "0.0.0.0"
        });

        fastify.log.info(
            `Profile Service is running on port ${PORT}`
        );
    } catch (error) {
        fastify.log.error(error);
        process.exit(1);
    }
}

startServer();

module.exports = fastify;
