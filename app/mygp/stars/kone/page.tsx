"use client";

import * as React from "react";
import { FileController } from "@/components/expediente-digital-cliente/form-controllers/FileController";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod/v4";
import { GPClient } from "@/lib/axiosUtils/axios-instance";
import MyGPButtonSubmit from "@/components/MyGPUI/Buttons/MyGPButtonSubmit";

const MAX_FILES = 20;
const MAX_FILE_SIZE_MB = 25;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

const LAYOUTA_COLUMNS = [
  "Item",
  "Description",
  "Width",
  "Length",
  "Height",
  "Net Weight",
  "Gross Weight",
  "Volume",
];

const LAYOUTB_COLUMNS = [
  "Pos",
  "Package Nr",
  "Description",
  "Length",
  "Width",
  "Height",
  "Net Weight",
  "Gross Weight",
  "Volume",
  "Material_ID",
  "Material Description",
  "Quantity",
  "U.M",
  "Order",
  "Item",
];

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
type LayoutChoice = "A" | "B";

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

function ColumnsPreview({
  columns,
  max = 6,
}: {
  columns: string[];
  max?: number;
}) {
  const shown = columns.slice(0, max);
  const remaining = Math.max(0, columns.length - shown.length);

  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {shown.map((c) => (
        <span
          key={c}
          className="rounded-md border px-2 py-0.5 text-xs text-muted-foreground"
        >
          {c}
        </span>
      ))}

      {remaining > 0 && (
        <span className="rounded-md border px-2 py-0.5 text-xs text-muted-foreground">
          +{remaining} more
        </span>
      )}
    </div>
  );
}

function LayoutOption({
  id,
  title,
  columns,
  selected,
  onSelect,
}: {
  id: LayoutChoice;
  title: string;
  columns: string[];
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className={[
        "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition",
        selected ? "border-primary/50 bg-muted/40" : "hover:bg-muted/30",
      ].join(" ")}
    >
      <input
        type="radio"
        name="layout"
        value={id}
        checked={selected}
        onChange={onSelect}
        className="mt-1"
      />

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <div className="font-medium">{title}</div>
          {selected && (
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary">
              Seleccionado
            </span>
          )}
        </div>

        <div className="mt-0.5 text-xs text-muted-foreground">
          Columnas: {columns.length}
        </div>

        <ColumnsPreview columns={columns} max={6} />

        <details className="mt-2">
          <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
            Ver todas las columnas
          </summary>
          <ul className="mt-2 grid list-disc grid-cols-2 gap-x-6 gap-y-1 pl-5 text-xs text-muted-foreground">
            {columns.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </details>
      </div>
    </label>
  );
}

export default function KONE() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { pdf_files: [] },
    mode: "onChange",
  });

  const [layout, setLayout] = React.useState<LayoutChoice>("A");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  async function extractErrorMessage(error: any): Promise<string> {
    // Axios with responseType: "blob" returns error bodies as Blob too
    if (error?.response?.data instanceof Blob) {
      const text = await error.response.data.text();
      try {
        const json = JSON.parse(text);
        return json?.detail ?? "Error al procesar";
      } catch {
        return text || "Error al procesar";
      }
    }

    return (
      error?.response?.data?.detail ||
      error?.message ||
      "Error al procesar"
    );
  }

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const formData = new FormData();

      for (const file of values.pdf_files) {
        formData.append("pdf_files", file, file.name);
      }

      const endpoint =
        layout === "A" ? "/stars/kone/layoutA" : "/stars/kone/layoutB";

      const response = await GPClient.post(endpoint, formData, {
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
      const msg = await extractErrorMessage(error);
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="grid gap-4">
      <div className="text-lg font-semibold">Kone</div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <div className="grid gap-2">
          <div className="text-sm font-medium">Selecciona Formato</div>

          <div className="grid gap-3 md:grid-cols-2">
            <LayoutOption
              id="A"
              title="Formato A"
              columns={LAYOUTA_COLUMNS}
              selected={layout === "A"}
              onSelect={() => setLayout("A")}
            />

            <LayoutOption
              id="B"
              title="Formato B"
              columns={LAYOUTB_COLUMNS}
              selected={layout === "B"}
              onSelect={() => setLayout("B")}
            />
          </div>

          <div className="text-xs text-muted-foreground">
            Tip: elige el layout que coincide con los encabezados/columnas del PDF.
          </div>
        </div>

        <FileController
          form={form}
          fieldLabel="Selecciona pdf(s)"
          controllerName="pdf_files"
          accept="application/pdf"
          buttonText="Selecciona pdf(s)"
          multiple
        />

        {serverError && <div className="text-sm text-red-600">{serverError}</div>}
        <div>

          <MyGPButtonSubmit isSubmitting={isSubmitting}>
            Subir archivo(s)
          </MyGPButtonSubmit>
        </div>
      </form>
    </div>
  );
}