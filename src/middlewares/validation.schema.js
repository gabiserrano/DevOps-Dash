

const validationSchema = (schema, property) => {
    return (req, res, next) => {
        const data = req[property];

        const { error, value } = schema.validate(data, { abortEarly: false });

        if (error) {
            const errors = error.details.map((detail) => detail.message);
            return res.status(400).json({ errors });
        }

        req[property] = value;
        return next();
    };
};

module.exports = {
    validationSchema
}