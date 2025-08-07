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