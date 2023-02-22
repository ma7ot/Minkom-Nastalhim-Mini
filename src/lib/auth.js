import { getToken } from "./token";

export const loginUser = async (username, password, isQrlix) => {
  const res = await fetch("/api/login", {
    body: JSON.stringify({ username, password, isQrlix }),
    method: "POST",
  });
  const data = await res.json();
  return data;
};

// ------------------------------------------------------------*
export const whoAmI = async () => {
  const res = await fetch("/api/profile", {
    headers: {
      authorization: getToken(),
    },
    method: "GET",
  });
  const data = await res.json();
  return data;
};


export const RegisterUser = async (data) => {
  const response = await fetch(`/api/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: getToken(),
        },
      body: JSON.stringify({user: data})
    })
  return await response.json();
}

export const VerifyUser = async (data) => {
  const response = await fetch(`/api/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        },
      body: JSON.stringify({user: data})
    })
  return await response.json();
}

export const VerifyBizzUsername = async (data) => {
  const response = await fetch(`/api/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        },
      body: JSON.stringify({user: data})
    })
  return await response.json();
}