const FormData = require("form-data");
const userApi = require("../config/axios");

module.exports.forwardTemplate = async (request, reply) => {
    try {
        let data;
        let headers = {};

        const contentType = request.headers["content-type"] || "";

        // Handle multipart requests, such as POST /addTemp
        if (contentType.includes("multipart/form-data")) {
            const form = new FormData();

            // Read all uploaded files and text fields from Fastify
            for await (const part of request.parts()) {
                if (part.type === "file") {
                    const buffer = await part.toBuffer();

                    form.append(part.fieldname, buffer, {
                        filename: part.filename,
                        contentType: part.mimetype
                    });
                } else {
                    form.append(
                        part.fieldname,
                        String(part.value ?? "")
                    );
                }
            }

            data = form;

            // Generate headers with the new multipart boundary
            headers = { ...form.getHeaders() };
        } else {
            // Handle ordinary JSON or other parsed requests
            data = request.body;
        }

        // Forward authentication headers
        if (request.headers.authorization) {
            headers.authorization = request.headers.authorization;
        }

        if (request.headers["x-api-key"]) {
            headers["x-api-key"] = request.headers["x-api-key"];
        }

        // Forward the request to user-service
        const response = await userApi.request({
            method: request.method,
            url: request.raw.url,
            data,
            headers,
            maxBodyLength: Infinity,
            maxContentLength: Infinity
        });

        // Return the original downstream status and body
        return reply
            .code(response.status)
            .send(response.data);

    } catch (error) {
        request.log.error(
            { err: error },
            "Template forwarding failed"
        );

        if (error.response) {
            return reply
                .code(error.response.status)
                .send(error.response.data);
        }

        if (error.statusCode === 413) {
            return reply.code(413).send({
                success: false,
                message: "Uploaded file is too large"
            });
        }

        return reply.code(502).send({
            success: false,
            message: "UserService is unavailable"
        });
    }
};