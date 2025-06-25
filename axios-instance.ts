import axios from 'axios';

export const GPClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true, // Send cookies to server in every request
  headers: {
    'Cache-Control': 'no-cache', // Avoid static routes by default
  },
});

export const GPServer = axios.create({
  baseURL: process.env.BACKEND_URL,
  withCredentials: true, // Send cookies to server in every request
});

export const axiosFetcher = (url: string) => GPClient.get(url).then((res) => res.data);
