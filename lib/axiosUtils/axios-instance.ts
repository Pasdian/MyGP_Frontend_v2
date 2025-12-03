import axios from "axios";

const isServer = typeof window === "undefined";

// Must be something like "http://localhost:3000" in dev or "https://mygp.pascal.com.mx" in prod
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

export const GPClient = axios.create({
  baseURL: isServer ? APP_URL : undefined,
  withCredentials: true,
  headers: {
    "Cache-Control": "no-cache",
    "X-API-KEY": process.env.NEXT_PUBLIC_PYTHON_API_KEY || "",
  },
});

export const axiosFetcher = (url: string) =>
  GPClient.get(url).then((res) => res.data);

export const axiosBlobFetcher = (url: string) =>
  GPClient.get(url, { responseType: "blob" }).then((res) => {
    return new Blob([res.data], { type: res.data.type });
  });

export const axiosImageFetcher = async (url: string): Promise<string> => {
  const res = await GPClient.get(url, { responseType: "blob" });
  return URL.createObjectURL(res.data);
};
