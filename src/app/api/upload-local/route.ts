import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;
    const propertyId = form.get('propertyId') as string | null;

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    if (!propertyId) return NextResponse.json({ error: 'No propertyId provided' }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const ext = (file.name?.split('.').pop() || 'bin').toLowerCase();
    const fileName = `${uuidv4()}.${ext}`;
    
    // Create directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'properties', propertyId);
    await mkdir(uploadDir, { recursive: true });
    
    // Save file
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, Buffer.from(bytes));
    
    // Return public URL
    const publicUrl = `/uploads/properties/${propertyId}/${fileName}`;
    
    return NextResponse.json({ url: publicUrl, path: `uploads/properties/${propertyId}/${fileName}` });
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
