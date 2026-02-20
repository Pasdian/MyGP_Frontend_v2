import { GPClient } from "../axiosUtils/axios-instance";
import { mutate } from "swr";

type ProgressResponse = {
  client_id: string;
  overall: { scannedFiles: number; requiredFiles: number; progress: number };
  byDocKey: Record<
    string,
    { scannedFiles: number; requiredFiles: number; progress: number }
  >;
};

export async function submitFolderAndUpdateProgress(opts: {
  folderKey: string;
  formData: FormData;
  docKeys: readonly string[]; // keep this only for SWR mutate keys + optional safety
  updateProgressFromSubmitResponse: (
    folderKey: string,
    progress: ProgressResponse,
  ) => void;
}) {
  const res = await GPClient.post(
    `/expediente-digital-cliente/folders/${opts.folderKey}/submit`,
    opts.formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );

  const progress = res.data?.progress as ProgressResponse | undefined;
  if (progress) {
    // single local update: updates docKey progress + recomputes folder progress locally
    opts.updateProgressFromSubmitResponse(opts.folderKey, progress);
  }

  const failedKeys = res.data?.failed ? Object.keys(res.data.failed) : [];
  const clientId = String(opts.formData.get("client_rfc") ?? "");

  if (clientId) {
    const successKeys = opts.docKeys.filter((k) => !failedKeys.includes(k));
    await Promise.all(
      successKeys.map((k) => mutate(["file-exists", clientId, k] as const)),
    );
  }

  return { failed: failedKeys, progress: progress ?? null };
}
