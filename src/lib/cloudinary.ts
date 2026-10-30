import { v2 as cloudinary } from 'cloudinary';

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY || '899787571845291';
const API_SECRET = process.env.CLOUDINARY_API_SECRET || 'oBNd08uOqtgtiMoNcu_OcZN5UKs';

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_URL ||
    (CLOUD_NAME && API_KEY && API_SECRET)
  );
}

export function getCloudinary() {
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config();
  } else {
    cloudinary.config({
      cloud_name: CLOUD_NAME,
      api_key: API_KEY,
      api_secret: API_SECRET,
      secure: true,
    });
  }
  return cloudinary;
}

export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string = 'escortvilla'
): Promise<{ url: string; public_id: string }> {
  const c = getCloudinary();

  return new Promise((resolve, reject) => {
    const uploadStream = c.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error('Cloudinary upload failed'));
        } else {
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
          });
        }
      }
    );
    uploadStream.end(buffer);
  });
}
