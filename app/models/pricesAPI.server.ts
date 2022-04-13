
export const getPrice = async (id: string) => {
    const baseURL = `https://api.coingecko.com/api/v3/simple/price?ids=${id}%2C%20?&vs_currencies=usd`;
    const response = await fetch(baseURL);

   // check for error response
   if (!response.ok) {
       return { usd: 1 }
   }
    return response.json();
  }
