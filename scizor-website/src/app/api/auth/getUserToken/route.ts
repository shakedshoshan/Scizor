import { NextRequest, NextResponse } from 'next/server';

// Reusable API function that can be imported and used in components
export const getUserData = async (userId: string) => {
  try {
    const baseUrl = process.env.BACKEND_BASE_URL || 'http://localhost:5000';
    const response = await fetch(`${baseUrl}/auth/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const responseData = await response.json();

    
    // Extract the data property from the backend response
    const userData = responseData.data || responseData;
    
    return { success: true, data: userData };
  } catch (error) {
    console.error('Error fetching user data:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch user data' 
    };
  }
};

// Next.js API route handler
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const result = await getUserData(userId);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
    
    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}
