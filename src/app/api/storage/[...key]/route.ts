import { NextRequest, NextResponse } from 'next/server';
import { getFromObjectStorage, isObjectStorageConfigured } from '@/lib/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: { key: string[] } }
) {
  if (!isObjectStorageConfigured()) {
    return NextResponse.json(
      { error: 'Object storage is not configured' },
      { status: 503 }
    );
  }

  const key = Array.isArray(params.key) ? params.key.join('/') : params.key;

  try {
    const s3Response = await getFromObjectStorage(key);

    if (!s3Response.Body) {
      return NextResponse.json({ error: 'Object not found' }, { status: 404 });
    }

    const contentType = s3Response.ContentType || 'application/octet-stream';
    const bodyBytes = await s3Response.Body.transformToByteArray();

    return new NextResponse(Buffer.from(bodyBytes), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    if (error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
      return NextResponse.json({ error: 'Object not found' }, { status: 404 });
    }
    console.error('Storage retrieve error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve object' },
      { status: 500 }
    );
  }
}
