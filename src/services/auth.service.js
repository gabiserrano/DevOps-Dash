const { models } = require('../db/config.db');
const { HttpError } = require('../helpers/httpError.helper');
const { signToken } = require('../helpers/jwt.helper');
const { comparePassword } = require('../helpers/password.helper');

class AuthService {
    // Usado por LocalStrategy para verificar credenciales en el login
    async getUser(email, password) {
        const usuario = await models.Usuario.findOne({
            where: { email },
            include: [
                { association: 'rol', attributes: ['id', 'nombre'] },
                { association: 'sucursal', attributes: ['id', 'nombre', 'activa'] },
                { association: 'empleado', attributes: ['id', 'nombres', 'apellidos', 'puesto'] },
            ],
        });

        if (!usuario) {
            throw new HttpError(401, 'Credenciales inválidas');
        }

        if (!usuario.activo) {
            throw new HttpError(403, 'El usuario se encuentra desactivado');
        }

        const isMatch = await comparePassword(password, usuario.passwordHash);
        if (!isMatch) {
            throw new HttpError(401, 'Credenciales inválidas');
        }

        const userJson = usuario.toJSON();
        delete userJson.passwordHash;

        return userJson;
    }

    // Firma el JWT usando el helper y devuelve usuario + token
    generateSession(user) {
        const payload = {
            sub: user.id,
            rol: user.rol?.nombre,
            rolId: user.rolId,
            sucursalId: user.sucursalId,
        };

        const token = signToken(payload);

        return {
            user,
            token,
        };
    }

    // Obtiene el perfil actualizado del usuario autenticado (para GET /me)
    async getProfile(userId) {
        const usuario = await models.Usuario.findByPk(userId, {
            attributes: { exclude: ['passwordHash'] },
            include: [
                { association: 'rol', attributes: ['id', 'nombre'] },
                { association: 'sucursal', attributes: ['id', 'nombre', 'direccion'] },
                { association: 'empleado', attributes: ['id', 'nombres', 'apellidos', 'puesto'] },
            ],
        });

        if (!usuario || !usuario.activo) {
            throw new HttpError(401, 'Usuario no válido o inactivo');
        }

        return usuario;
    }
}

module.exports = { AuthService };