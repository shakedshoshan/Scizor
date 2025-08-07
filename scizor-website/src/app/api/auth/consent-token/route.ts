import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = process.env.NODE_ENV === 'production' ? process.env.PROD_URL : process.env.DEV_URL;
    
    // Forward the request to the backend
    const response = await fetch(`${url}/auth/consent-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error generating consent token:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to generate consent token',
        data: null 
      },
      { status: 500 }
    );
  }
} 