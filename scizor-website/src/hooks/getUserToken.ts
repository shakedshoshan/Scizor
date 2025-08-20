export const getUserData = async (userId: string) => {
    try {
      const url = process.env.NEXT_PUBLIC_NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_PROD_URL : process.env.NEXT_PUBLIC_DEV_URL;
      const response = await fetch(`${url}/auth/user/${userId}`, {
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