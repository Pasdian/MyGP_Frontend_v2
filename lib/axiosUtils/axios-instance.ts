import axios from "axios";

const isServer = typeof window === "undefined";

const APP_URL = isServer ? process.env.APP_URL_INTERNAL : undefined;

export const GPClient = axios.create({
  baseURL: APP_URL,
  withCredentials: true,
  headers: {
    "Cache-Control": "no-cache",
  },
});

export const axiosFetcher = (url: string) =>
  GPClient.get(url).then((res) => res.data);

export const axiosImageFetcher = async (url: string): Promise<string> => {
  const res = await GPClient.get(url, { responseType: "blob" });
  return URL.createObjectURL(res.data);
};
