
const Joi = require("joi");
const { errorMsg } = require("../../../user-service/utils/errMsg");

module.exports.addTemplate = async (request, reply) => {
    const templateSchema = Joi.object({
        name: Joi.string().min(3).required().error(new Error(errorMsg.nameErr)),

        body: Joi.string().required(),

        isVariable: Joi.boolean().required(),

        mediaURL: Joi.string().uri().optional(),
    });

    const { error, value } = templateSchema.validate(request.body);

    if (error) {
        return reply.code(400).send({
            success: false,
            message: error.message,
        });
    }

    // Use Joi's validated/coerced values
    request.body = value;
};
