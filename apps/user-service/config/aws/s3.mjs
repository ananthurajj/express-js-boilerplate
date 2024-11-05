import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const s3 = new S3Client({
  region: process.env.AWS_S3_REGION,
  endpoint: process.env.AWS_S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY,
    secretAccessKey: process.env.AWS_S3_SECRET_KEY,
  },
});

export async function getObjectUrl(Key) {
  return getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: String(process.env.AWS_S3_BUCKET),
      Key,
    }),
    { expiresIn: 900 }
  );
}

export async function putObjectUrl(Key, ContentType) {
  return getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: String(process.env.AWS_S3_BUCKET),
      Key,
      ContentType,
    }),
    { expiresIn: 900 }
  );
}

export async function deleteObject(Key) {
  return s3.send(new DeleteObjectCommand({ Bucket: String(process.env.AWS_S3_BUCKET), Key }));
}

export async function getObject(Key) {
  return s3.send(new GetObjectCommand({ Bucket: process.env.AWS_S3_BUCKET, Key }));
}
