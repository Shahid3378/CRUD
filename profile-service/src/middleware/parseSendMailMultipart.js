
module.exports.parseSendMailMultipart = async (request, reply) => {
    try {
        const fields = {};
        let document = null;

        for await (const part of request.parts()) {
            if (part.type === "file") {
                if (part.fieldname !== "document") {
                    await part.toBuffer();

                    return reply.code(400).send({
                        success: false,
                        message: "Unexpected file field"
                    });
                }

                document = {
                    buffer: await part.toBuffer(),
                    filename: part.filename,
                    mimetype: part.mimetype
                };
            } else {
                fields[part.fieldname] = part.value;
            }
        }

        request.sendMailFields = fields;
        request.sendMailDocument = document;

    } catch (error) {
        request.log.error({ err: error }, "Multipart parsing failed");

        return reply.code(400).send({
            success: false,
            message: "Unable to parse multipart request"
        });
    }
};
