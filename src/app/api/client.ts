const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:4000"; 
// use 10.0.2.2 for Android emulator, localhost:4000 for iOS simulator

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    let message = text;
    try {
      const data = JSON.parse(text);
      message = data.message || text;
    } catch {}
    throw new Error(message);
  }

  return res.json();
}

export const api = {
  get: (path: string) => request(path),
  post: (path: string, body?: any) =>
    request(path, { method: "POST", body: JSON.stringify(body) }),
};
