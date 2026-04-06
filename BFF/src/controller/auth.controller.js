import config from '../config/index.js';
import { AppError } from '../utils/appError.js';
import * as cognitoService from '../services/cognito.service.js';

const logger = console;

export const loginUser = async (req, res, next) => {
    try{
        const { email, password } = req.body;

        logger.info('Controller: Login request received');
        if (!email || !password) {
            logger.warn('Controller: Login request failed due to missing fields.');
            return next(
                new AppError('Both email and password are required.',
                    config.CONSTANTS.HTTP_STATUS.BAD_REQUEST
            ));
        }

        const token = await cognitoService.authenticateCognitoUser({ email, password });

        logger.info('Controller: User logged in successfully.', { email });
        res.status(config.CONSTANTS.HTTP_STATUS.OK).json({
            status: 'success',
            message: 'Login successful!',
            data: { token }
        });

    } catch (error) {
        if (error.statusCode === config.CONSTANTS.HTTP_STATUS.UNAUTHORIZED) {
             return next(new AppError('Invalid email or password.', config.CONSTANTS.HTTP_STATUS.UNAUTHORIZED));
        }
        next(error);
    }
};

export const refreshToken = async (req, res, next) => {
    try{
        const { refreshToken } = req.body;
        logger.info('Controller: Token refresh request received');

        if (!refreshToken) {
            logger.warn('Controller: Token refresh request failed due to missing refresh token.');
            return next(
                new AppError('Refresh token is required.',
                    config.CONSTANTS.HTTP_STATUS.BAD_REQUEST
            ));
        }
        const newTokens = await cognitoService.refreshCognitoToken({ refreshToken });

        logger.info('Controller: Token refreshed successfully.');
        res.status(config.CONSTANTS.HTTP_STATUS.OK).json({
            status: 'success',
            message: 'Token refreshed successfully!',
            data: { tokens: newTokens }
        });

    } catch (error) {
        if (error.statusCode === config.CONSTANTS.HTTP_STATUS.UNAUTHORIZED) {
             return next(new AppError('Invalid refresh token.', config.CONSTANTS.HTTP_STATUS.UNAUTHORIZED));
        }

        next(error);
    }
};

export const logoutUser = async (req, res, next) => {
    try{
        const { accessToken } = req.body;
        logger.info('Controller: Logout request received');
        if (!accessToken) {
            logger.warn('Controller: Logout request failed due to missing access token.');
            return next(
                new AppError('Access token is required.',
                    config.CONSTANTS.HTTP_STATUS.BAD_REQUEST
            ));
        }
        await cognitoService.logoutCognitoUser(accessToken);

        logger.info('Controller: User logged out successfully.');
        res.status(config.CONSTANTS.HTTP_STATUS.OK).json({
            status: 'success',
            message: 'Logout successful!'
        });
    }
    catch (error) {
        next(error);
    }
};