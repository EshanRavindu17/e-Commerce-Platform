export default {
  PORT: process.env.PORT || 3000,
  AWS_REGION: process.env.AWS_REGION || "us-east-1",
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
  AWS_S3_PRODUCT_IMAGE_PREFIX:
    process.env.AWS_S3_PRODUCT_IMAGE_PREFIX || "product-images",
  COGNITO: {
    USER_POOL_ID: process.env.COGNITO_USER_POOL_ID,
    CLIENT_ID: process.env.COGNITO_CLIENT_ID,
    REGION: process.env.AWS_REGION || "us-east-1",
  },
  CONSTANTS: {
    HTTP_STATUS: {
      OK: 200,
      CREATED: 201,
      NO_CONTENT: 204,
      BAD_REQUEST: 400,
      UNAUTHORIZED: 401,
      FORBIDDEN: 403,
      NOT_FOUND: 404,
      INTERNAL_SERVER_ERROR: 500,
    },
  },
  SERVICES: {
    PRODUCT_URL: process.env.PRODUCT_SERVICE_URL || "http://localhost:8080",
    USER_URL: process.env.USER_SERVICE_URL || "http://localhost:8081",
    CART_URL: process.env.CART_SERVICE_URL || "http://localhost:8082",
  },
};
