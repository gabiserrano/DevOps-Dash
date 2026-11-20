const { HttpError } = require('../helpers/httpError.helper');

function checkRoles(...rolesPermitidos) {
    return (req, res, next) => {
        const user = req.user;

        if (!user || !user.rol) {
            return next(new HttpError(401, 'No autorizado: token inválido o sin rol asignado'));
        }

        if (!rolesPermitidos.includes(user.rol)) {
            return next(
                new HttpError(403, `Acceso denegado: se requiere uno de los siguientes roles [${rolesPermitidos.join(', ')}]`)
            );
        }

        return next();
    };
}

module.exports = { checkRoles };