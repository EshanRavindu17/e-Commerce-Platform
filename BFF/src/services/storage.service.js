import AWS from "aws-sdk";
import config from "../config/index.js";
import { AppError } from "../utils/appError.js";

const s3 = new AWS.S3({
  region: config.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const sanitizeFileName = (fileName = "product-image") =>
  fileName
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, "-")
    .replace(/-+/g, "-");

const extractExtension = (contentType = "") => {
  const mapped = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };

  return mapped[contentType.toLowerCase()] || "bin";
};

export const createProductImageUploadUrl = async ({
  fileName,
  contentType,
  user,
}) => {
  if (!config.AWS_S3_BUCKET) {
    throw new AppError(
      "S3 upload is not configured. Set AWS_S3_BUCKET in BFF environment.",
      config.CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }

  if (!contentType || !contentType.startsWith("image/")) {
    throw new AppError(
      "Invalid image content type.",
      config.CONSTANTS.HTTP_STATUS.BAD_REQUEST,
    );
  }

  const ext = extractExtension(contentType);
  const safeName = sanitizeFileName(fileName || `upload.${ext}`);
  const ownerId = user.userId || user.cognitoId || "anonymous";
  const objectKey = `${config.AWS_S3_PRODUCT_IMAGE_PREFIX}/${ownerId}/${Date.now()}-${safeName}`;

  const uploadUrl = await s3.getSignedUrlPromise("putObject", {
    Bucket: config.AWS_S3_BUCKET,
    Key: objectKey,
    ContentType: contentType,
    Expires: 300,
  });

  const publicBase = process.env.AWS_S3_PUBLIC_BASE_URL;
  const fileUrl = publicBase
    ? `${publicBase.replace(/\/$/, "")}/${objectKey}`
    : `https://${config.AWS_S3_BUCKET}.s3.${config.AWS_REGION}.amazonaws.com/${objectKey}`;

  return {
    uploadUrl,
    fileUrl,
    objectKey,
    expiresInSeconds: 300,
  };
};
