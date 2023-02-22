import { getToken } from "./token";

export const apiFetch = async (data) => {
  try{
    const response = await fetch(`/api/getData`, {
      method: 'POST',
      headers: {
      'Content-Type': 'application/json',
      authorization: getToken(),
      },
      body: JSON.stringify({user: data})
    })
  return await response.json();
  } catch(error){
    return await {error: true, msg: error};
  }
    
}

