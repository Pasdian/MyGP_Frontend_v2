import axios from "axios";

export const GPClient = axios.create({
  withCredentials: true,
  headers: {
    "Cache-Control": "no-cache", // Avoid static routes by default
  },
});

export const GPClientDEA = axios.create({
  baseURL: process.env.NEXT_PUBLIC_DEA_URL,
  withCredentials: true,
  headers: {
    "X-API-Key": process.env.DEA_API_KEY,
  },
});

export const GPServer = axios.create({
  baseURL: process.env.BACKEND_URL,
  withCredentials: true,
});

export const axiosFetcher = (url: string) =>
  GPClient.get(url).then((res) => res.data);

export const axiosBlobFetcher = (url: string) =>
  GPClient.get(url, { responseType: "blob" }).then((res) => {
    // Create a new Blob instance from the response data and avoid caching
    return new Blob([res.data], { type: res.data.type });
  });

export const axiosImageFetcher = async (url: string): Promise<string> => {
  const res = await GPClient.get(url, { responseType: "blob" });
  return URL.createObjectURL(res.data);
};
