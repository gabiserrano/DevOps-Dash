const { AuthService } = require('../services/auth.service');

const service = new AuthService();

const loginController = async (req, res, next) => {
    try {
        // req.user viene inyectado por passport.authenticate('local')
        const session = service.generateSession(req.user);

        res.status(200).json({
            message: 'Inicio de sesión exitoso',
            ...session,
        });
    } catch (error) {
        next(error);
    }
};

const getProfileController = async (req, res, next) => {
    try {
        // req.user.sub viene del payload del JWT verificado por passport-jwt
        const profile = await service.getProfile(req.user.sub);

        res.status(200).json({
            data: profile,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    loginController,
    getProfileController,
};