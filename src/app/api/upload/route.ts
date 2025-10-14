import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs'; // مهم لاستخدام Buffer/Streams

const projectId = process.env.GOOGLE_CLOUD_PROJECT!;
const bucketName = process.env.GCS_BUCKET!;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL!;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')!;

const storage = new Storage({
  projectId,
  credentials: { client_email: clientEmail, private_key: privateKey },
});

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;
    const propertyId = form.get('propertyId') as string | null;

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    if (!propertyId) return NextResponse.json({ error: 'No propertyId provided' }, { status: 400 });

    const bytes = Buffer.from(await file.arrayBuffer());
    const ext = (file.name?.split('.').pop() || 'bin').toLowerCase();
    const fileName = `${uuidv4()}.${ext}`;
    const filePath = `properties/${propertyId}/${fileName}`;

    const bucket = storage.bucket(bucketName);
    const blob = bucket.file(filePath);

    await blob.save(bytes, {
      contentType: file.type || 'application/octet-stream',
      metadata: { cacheControl: 'public, max-age=31536000' },
      resumable: false, // أسرع لملفات صغيرة/متوسطة
    });

    // رابط موقّع لمدة ساعة (خيار آمن ولا يحتاج جعل الملف عامًا):
    const [signedUrl] = await blob.getSignedUrl({
      action: 'read',
      expires: Date.now() + 60 * 60 * 1000, // 1 ساعة
      version: 'v4',
    });

    return NextResponse.json({ url: signedUrl, path: filePath });
  } catch (e: any) {
    console.error('Upload error:', e?.message || e);
    return NextResponse.json(
      {
        error: 'Failed to upload file',
        details: e?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
