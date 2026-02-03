import type { AxiosInstance } from "axios";
import { GPClient } from "../axiosUtils/axios-instance";

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

    // write docKey progress
    for (const k of opts.docKeys) {
      next[k] = byDoc[k]?.progress ?? next[k] ?? 0;
    }

    return next;
  });

  // compute folder from docKeys
  opts.recomputeFolderProgress(opts.folderKey, opts.docKeys);

  const failed = res.data?.failed ? Object.keys(res.data.failed) : [];
  return { failed };
}
