const { HttpError } = require('../helpers/httpError.helper');
const { models } = require('../db/config.db');

function checkRoles(...rolesPermitidos) {
    return async (req, res, next) => {
        try {
            const id = req.user?.sub;

            if (!id) {
                throw new HttpError(401, 'No autorizado');
            }

            const usuario = await models.Usuario.findByPk(id, {
                include: [
                    {
                        association: 'rol',
                        attributes: ['nombre']
                    }
                ]
            });

            if (!usuario || !usuario.activo) {
                throw new HttpError(401, 'Usuario inactivo o inexistente');
            }

            if (
                !usuario.rol ||
                !rolesPermitidos.includes(usuario.rol.nombre)
            ) {
                throw new HttpError(
                    403,
                    'No tienes permisos para esta operación'
                );
            }

            return next();

        } catch (error) {
            return next(error);
        }
    };
}

module.exports = { checkRoles };
