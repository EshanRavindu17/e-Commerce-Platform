import cognito from "../config/cognito.js";
import config from "../config/index.js";
import { AppError } from "../utils/appError.js";

export const createCognitoUser = async ({
  email,
  password,
  firstName,
  lastName,
}) => {
  const params = {
    UserPoolId: process.env.COGNITO_USER_POOL_ID,
    Username: email,
    TemporaryPassword: password,
    MessageAction: "SUPPRESS",
    UserAttributes: [
      { Name: "email", Value: email },
      { Name: "given_name", Value: firstName },
      { Name: "family_name", Value: lastName },
    ],
  };

  const result = await cognito.adminCreateUser(params).promise();

  // Make the provided password permanent so user can log in without NEW_PASSWORD_REQUIRED challenge.
  await cognito
    .adminSetUserPassword({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Username: email,
      Password: password,
      Permanent: true,
    })
    .promise();

  const sub = result.User.Attributes.find((attr) => attr.Name === "sub").Value;
  return sub;
};

export const authenticateCognitoUser = async ({ email, password }) => {
  const params = {
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: process.env.COGNITO_CLIENT_ID,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
  };
  try {
    const response = await cognito.initiateAuth(params).promise();

    if (!response?.AuthenticationResult) {
      const challenge = response?.ChallengeName || "UNKNOWN_CHALLENGE";
      if (challenge === "NEW_PASSWORD_REQUIRED") {
        throw new AppError(
          "Password reset required for this account. Please complete first-time password setup.",
          config.CONSTANTS.HTTP_STATUS.UNAUTHORIZED,
        );
      }

      throw new AppError(
        `Login challenge required: ${challenge}`,
        config.CONSTANTS.HTTP_STATUS.UNAUTHORIZED,
      );
    }

    return {
      accessToken: response.AuthenticationResult.AccessToken,
      idToken: response.AuthenticationResult.IdToken,
      refreshToken: response.AuthenticationResult.RefreshToken,
      expiresIn: response.AuthenticationResult.ExpiresIn,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    if (
      error.code === "NotAuthorizedException" ||
      error.code === "UserNotFoundException"
    ) {
      throw new AppError(
        "Invalid email or password.",
        config.CONSTANTS.HTTP_STATUS.UNAUTHORIZED,
      );
    }

    if (error.code === "InvalidParameterException") {
      throw new AppError(
        error.message || "Invalid Cognito auth configuration.",
        config.CONSTANTS.HTTP_STATUS.BAD_REQUEST,
      );
    }

    throw error;
  }
};

export const refreshCognitoToken = async ({ refreshToken }) => {
  const params = {
    AuthFlow: "REFRESH_TOKEN_AUTH",
    ClientId: process.env.COGNITO_CLIENT_ID,
    AuthParameters: {
      REFRESH_TOKEN: refreshToken,
    },
  };
  const response = await cognito.initiateAuth(params).promise();
  return {
    accessToken: response.AuthenticationResult.AccessToken,
    idToken: response.AuthenticationResult.IdToken,
    expiresIn: response.AuthenticationResult.ExpiresIn,
  };
};

export const logoutCognitoUser = async (accessToken) => {
  const params = {
    AccessToken: accessToken,
  };
  await cognito.globalSignOut(params).promise();
  return { message: "Logout successful" };
};
