import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';

const BUCKET_NAME = process.env.NEON_OBJECT_STORAGE_BUCKET || 'assets';
const ENDPOINT = process.env.AWS_ENDPOINT_URL_S3;
const REGION = process.env.AWS_REGION || 'us-east-2';
const ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

export function isObjectStorageConfigured(): boolean {
  return Boolean(ENDPOINT && ACCESS_KEY_ID && SECRET_ACCESS_KEY);
}

let s3ClientInstance: S3Client | null = null;

export function getS3Client(): S3Client {
  if (!s3ClientInstance) {
    if (!isObjectStorageConfigured()) {
      throw new Error('Neon Object Storage environment variables are not configured.');
    }
    s3ClientInstance = new S3Client({
      endpoint: ENDPOINT,
      region: REGION,
      credentials: {
        accessKeyId: ACCESS_KEY_ID!,
        secretAccessKey: SECRET_ACCESS_KEY!,
      },
      forcePathStyle: true,
    });
  }
  return s3ClientInstance;
}

export async function uploadToObjectStorage(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string
): Promise<{ key: string; url: string }> {
  const client = getS3Client();

  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  // Return the API proxy URL which streams directly from the Neon bucket
  const url = `/api/storage/${key}`;
  return { key, url };
}

export async function getFromObjectStorage(key: string) {
  const client = getS3Client();
  return client.send(
    new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
  );
}
