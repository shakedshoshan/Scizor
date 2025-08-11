import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const base = process.env.NODE_ENV === 'production' ? process.env.PROD_URL : process.env.DEV_URL;
    const url = base || 'http://localhost:5000';

    const response = await fetch(`${url}/auth/create-user-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // Attempt to parse backend response as JSON regardless of status
    const data = await response
      .json()
      .catch(() => ({ success: false, message: 'Unexpected backend response', data: null }));

    // Normalize response to consistent shape and preserve status
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error forwarding create-user-token:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create user token',
        data: null,
      },
      { status: 500 }
    );
  }
}
