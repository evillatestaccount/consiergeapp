import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { requireAuth } from '@/lib/auth';
import { isObjectStorageConfigured, uploadToObjectStorage } from '@/lib/storage';

export async function POST(request: NextRequest) {
  const authCheck = requireAuth(request, ['SUPER_ADMIN', 'EDITOR']);
  if ('errorResponse' in authCheck) return authCheck.errorResponse;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const urlInput = formData.get('url') as string | null;

    if (urlInput) {
      return NextResponse.json({ success: true, url: urlInput });
    }

    if (!file) {
      return NextResponse.json({ error: 'No file or image URL provided' }, { status: 400 });
    }

    // Verify it's an image
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are permitted' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `avatar-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    // Prefer Neon S3 Object Storage when configured
    if (isObjectStorageConfigured()) {
      const { url } = await uploadToObjectStorage(filename, buffer, file.type);
      return NextResponse.json({ success: true, url, storage: 'neon-s3' });
    }

    // Fallback to local filesystem
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;
    return NextResponse.json({ success: true, url: publicUrl, storage: 'local' });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
