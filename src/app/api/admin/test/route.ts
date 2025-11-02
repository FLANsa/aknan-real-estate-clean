import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    return NextResponse.json({ 
      message: 'Admin Maps API is working',
      timestamp: new Date().toISOString(),
      status: 'ok'
    });
  } catch (error) {
    console.error('Error in test API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}



