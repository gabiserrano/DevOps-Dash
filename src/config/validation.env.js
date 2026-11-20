const Joi = require('joi')

const JoiValidationSchema = Joi.object({
    env: Joi.string().required(),
    port: Joi.number().required(),
    dbUrl: Joi.string().required(),
    dbUrle2e: Joi.string().required(),
    jwtSecret: Joi.string().required()
})

function validationEnv(config) {
    const { error } = JoiValidationSchema.validate(config)

    if (error) throw new Error(` Enviroment ${error?.message} `)
}

module.exports = { validationEnv }