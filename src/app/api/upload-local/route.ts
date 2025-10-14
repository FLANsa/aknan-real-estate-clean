import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    console.log('📤 Starting local file upload...');
    
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
    
    // إنشاء مجلد العقار إذا لم يكن موجوداً
    const uploadDir = join(process.cwd(), 'public', 'uploads', propertyId);
    await mkdir(uploadDir, { recursive: true });
    
    const filePath = join(uploadDir, fileName);
    const relativePath = `uploads/${propertyId}/${fileName}`;
    
    console.log('🗂️ File path:', filePath);
    console.log('📁 Relative path:', relativePath);

    // حفظ الملف محلياً
    await writeFile(filePath, bytes);
    
    // رابط عام مباشر
    const publicUrl = `/uploads/${propertyId}/${fileName}`;
    console.log('✅ Local upload successful:', publicUrl);

    return NextResponse.json({ 
      url: publicUrl, 
      path: relativePath,
      method: 'local'
    });
  } catch (e: any) {
    console.error('❌ Local upload error:', {
      message: e?.message,
      code: e?.code,
      details: e?.details,
      stack: e?.stack
    });
    return NextResponse.json(
      {
        error: 'Failed to upload file locally',
        details: e?.message || 'Unknown error',
        code: e?.code || 'UNKNOWN_ERROR'
      },
      { status: 500 }
    );
  }
}