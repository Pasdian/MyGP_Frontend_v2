"use client"

import * as React from "react";
import { FileController } from "@/components/expediente-digital-cliente/form-controllers/FileController";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod/v4";
import { GPClient } from "@/lib/axiosUtils/axios-instance";
import { MyGPButtonPrimary } from "@/components/MyGPUI/Buttons/MyGPButtonPrimary";
import MyGPButtonSubmit from "@/components/MyGPUI/Buttons/MyGPButtonSubmit";

const MAX_FILES = 20;
const MAX_FILE_SIZE_MB = 25;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

const formSchema = z.object({
  pdf_files: z
    .array(z.instanceof(File))
    .min(1, "Selecciona al menos 1 PDF")
    .max(MAX_FILES, `Máximo ${MAX_FILES} PDFs`)
    .refine(
      (files) =>
        files.every(
          (f) =>
            f.type === "application/pdf" ||
            f.name.toLowerCase().endsWith(".pdf")
        ),
      "Todos los archivos deben ser PDF"
    )
    .refine(
      (files) => files.every((f) => f.size <= MAX_FILE_SIZE),
      `Cada archivo debe ser <= ${MAX_FILE_SIZE_MB}MB`
    ),
});

type FormValues = z.infer<typeof formSchema>;

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function KONE() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { pdf_files: [] },
    mode: "onChange",
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const formData = new FormData();

      for (const file of values.pdf_files) {
        formData.append("pdf_files", file, file.name);
      }

      const response = await GPClient.post("/stars/kone", formData, {
        responseType: "blob",
      });

      const contentType = response.headers["content-type"] ?? "";
      const disposition = response.headers["content-disposition"] ?? "";

      const filenameMatch = disposition.match(/filename="([^"]+)"/);
      const filename =
        filenameMatch?.[1] ||
        (contentType.includes("zip") ? "kone_csvs.zip" : "kone.csv");

      downloadBlob(response.data, filename);

      form.reset({ pdf_files: [] });
    } catch (error: any) {
      if (error.response?.data instanceof Blob) {
        // Try to read backend error blob
        const text = await error.response.data.text();
        setServerError(text);
      } else {
        setServerError(
          error.response?.data?.detail ||
          error.message ||
          "Error al procesar"
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-4">
      <div className="text-lg font-semibold">Kone</div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
        <FileController
          form={form}
          fieldLabel="Selecciona pdf(s)"
          controllerName="pdf_files"
          accept="application/pdf"
          buttonText="Selecciona pdf(s)"
          multiple
        />

        {serverError ? (
          <div className="text-sm text-red-600">{serverError}</div>
        ) : null}

        <div>

          <MyGPButtonSubmit
            isSubmitting={isSubmitting}
          >
            Subir archivo(s)
          </MyGPButtonSubmit>
        </div>
      </form>
    </div>
  );
}