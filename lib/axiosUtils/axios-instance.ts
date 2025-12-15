import axios from "axios";

const isServer = typeof window === "undefined";

const APP_URL = isServer
  ? process.env.APP_URL_INTERNAL
  : process.env.NEXT_PUBLIC_APP_URL;

export const GPClient = axios.create({
  baseURL: APP_URL,
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
