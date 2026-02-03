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
  docKeys: readonly string[];
  setProgressMap: (updater: (prev: any) => any) => void;
  recomputeFolderProgress: (
    folderKey: string,
    docKeys: readonly string[],
  ) => void;
}) {
  const res = await GPClient.post(
    `/expediente-digital-cliente/folders/${opts.folderKey}/submit`,
    opts.formData,
  );

  const progress = res.data?.progress as ProgressResponse | undefined;
  const byDoc = progress?.byDocKey ?? {};

  opts.setProgressMap((prev: any) => {
    const next = { ...prev };
    for (const k of opts.docKeys) {
      next[k] = byDoc[k]?.progress ?? next[k] ?? 0;
    }
    return next;
  });

  opts.recomputeFolderProgress(opts.folderKey, opts.docKeys);

  const failedKeys = res.data?.failed ? Object.keys(res.data.failed) : [];
  const clientId = String(opts.formData.get("client_id") ?? "");

  if (clientId) {
    const successKeys = opts.docKeys.filter((k) => !failedKeys.includes(k));
    await Promise.all(
      successKeys.map((k) => mutate(["file-exists", clientId, k] as const)),
    );
  }

  return { failed: failedKeys };
}
