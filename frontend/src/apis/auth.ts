export async function handleLocalLogin(privatekey: string) {
    try {
      // Construct the request object matching the Go struct LocalAuthRequest
      const request = {
        privatekey: privatekey
      };
      console.log("Request:", request);
  
      // Call the Go method via the Wails bridge
    //   const response = await window.go.App.LocalAuth(request);
  
      // response will contain the string returned by the Go function
    //   console.log("Local Auth Response:", response);
    //   // Handle successful login based on the response string
    //   if (response.startsWith("Local authentication successful")) {
    //     // ... navigate user, store token, etc.
    //   } else {
    //     // ... show error message
    //   }
  
    } catch (error) {
      console.error("Error calling LocalAuth:", error);
      // Handle errors (e.g., Go backend error, network issue)
    }
  }