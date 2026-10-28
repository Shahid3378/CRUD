
const Joi = require("joi");

module.exports.validationSendmail = (request, reply, done) => {
    const schema = Joi.object({
        templateId: Joi.string().required()
    });

    const { error, value } = schema.validate(
        request.sendMailFields
    );

    if (error) {
        return reply.code(400).send({
            success: false,
            message: error.message
        });
    }

    request.sendMailFields = value;

    done();
};
