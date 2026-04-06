import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import config from "../config/index.js";
import { AppError } from "../utils/appError.js";
import * as userService from "../services/user.service.js";

const client = jwksClient({
  jwksUri: `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}/.well-known/jwks.json`,
});

const getKey = (header, callback) => {
  client.getSigningKey(header.kid, function (err, key) {
    if (err) {
      return callback(err);
    }
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
};

const normalizeRole = (value) => {
  const role = String(value || "")
    .trim()
    .toUpperCase();
  if (!role) {
    return "";
  }

  if (role === "DATASTEWARD") {
    return "STEWARD";
  }

  return role;
};

const resolveRole = (decoded = {}, userRecord = {}) => {
  const roleCandidates = [
    decoded["cognito:groups"]?.[0],
    decoded["custom:role"],
    decoded.role,
    userRecord?.userType,
    userRecord?.role,
  ];

  for (const candidate of roleCandidates) {
    const normalized = normalizeRole(candidate);
    if (normalized) {
      return normalized;
    }
  }

  return "CUSTOMER";
};

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(
      new AppError(
        "Unauthorized: No token provided",
        config.CONSTANTS.HTTP_STATUS.UNAUTHORIZED,
      ),
    );
  }
  const token = authHeader.split(" ")[1];

  jwt.verify(
    token,
    getKey,
    {
      issuer: `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`,
      algorithms: ["RS256"],
    },
    async (err, decoded) => {
      if (err) {
        return next(
          new AppError(
            "Unauthorized: Invalid token",
            config.CONSTANTS.HTTP_STATUS.UNAUTHORIZED,
          ),
        );
      }

      if (decoded.token_use !== "access") {
        return next(
          new AppError(
            "Unauthorized: Invalid token use",
            config.CONSTANTS.HTTP_STATUS.UNAUTHORIZED,
          ),
        );
      }

      try {
        const userRecord = await userService.resolveUserByCognitoId(
          decoded.sub,
        );

        req.user = {
          cognitoId: decoded.sub,
          userId: userRecord?.id,
          role: resolveRole(decoded, userRecord),
          token,
        };

        if (!req.user.userId) {
          return next(
            new AppError(
              "Unauthorized: User mapping not found",
              config.CONSTANTS.HTTP_STATUS.UNAUTHORIZED,
            ),
          );
        }

        next();
      } catch (resolveError) {
        return next(
          new AppError(
            "Unauthorized: Failed to resolve user identity",
            config.CONSTANTS.HTTP_STATUS.UNAUTHORIZED,
          ),
        );
      }
    },
  );
};

export default authMiddleware;
