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
    console.log('📤 Starting file upload...');
    
    // التحقق من متغيرات البيئة
    if (!projectId || !bucketName || !clientEmail || !privateKey) {
      console.error('❌ Missing environment variables:', {
        projectId: !!projectId,
        bucketName: !!bucketName,
        clientEmail: !!clientEmail,
        privateKey: !!privateKey
      });
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const form = await req.formData();
    const file = form.get('file') as File | null;
    const propertyId = form.get('propertyId') as string | null;

    if (!file) {
      console.error('❌ No file provided');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (!propertyId) {
      console.error('❌ No propertyId provided');
      return NextResponse.json({ error: 'No propertyId provided' }, { status: 400 });
    }

    console.log('📁 File info:', {
      name: file.name,
      size: file.size,
      type: file.type,
      propertyId
    });

    const bytes = Buffer.from(await file.arrayBuffer());
    const ext = (file.name?.split('.').pop() || 'bin').toLowerCase();
    const fileName = `${uuidv4()}.${ext}`;
    const filePath = `properties/${propertyId}/${fileName}`;

    console.log('🗂️ File path:', filePath);

    const bucket = storage.bucket(bucketName);
    const blob = bucket.file(filePath);

    console.log('⬆️ Uploading to Google Cloud Storage...');
    await blob.save(bytes, {
      contentType: file.type || 'application/octet-stream',
      metadata: { cacheControl: 'public, max-age=31536000' },
      resumable: false, // أسرع لملفات صغيرة/متوسطة
    });

    console.log('🌐 Making file public...');
    // جعل الملف عاماً للوصول المباشر
    await blob.makePublic();
    
    // رابط عام مباشر
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${filePath}`;
    console.log('✅ Upload successful:', publicUrl);

    return NextResponse.json({ url: publicUrl, path: filePath });
  } catch (e: any) {
    console.error('❌ Upload error:', {
      message: e?.message,
      code: e?.code,
      details: e?.details,
      stack: e?.stack
    });
    return NextResponse.json(
      {
        error: 'Failed to upload file',
        details: e?.message || 'Unknown error',
        code: e?.code || 'UNKNOWN_ERROR'
      },
      { status: 500 }
    );
  }
}
