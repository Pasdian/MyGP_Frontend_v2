import { GPClient } from "../axiosUtils/axios-instance";

export type ClientsMap = Record<string, string>;

let clientsMapCache: ClientsMap | null = null;

export const getClientsMap = async (): Promise<ClientsMap> => {
  if (clientsMapCache) return clientsMapCache;

  const { data } = await GPClient.get<ClientsMap>("/api/casa/getClientsMap");
  clientsMapCache = data;
  return data;
};
