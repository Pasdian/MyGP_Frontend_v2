import * as z from 'zod/v4';

const isAllowedImage = (f: File) => {
  const mimeOk = ['image/png', 'image/jpeg', 'image/jpg'].includes(f.type);
  const extOk = /\.(png|jpe?g)$/i.test(f.name);
  return mimeOk || extOk;
};

export const createImagesSchema = (maxSize: number, maxFiles: number) =>
  z
    .array(
      z
        .file({
          message: 'Por favor ingresa una imagen en PNG o JPEG',
        })
        .min(10_000, 'El archivo debe de ser de mínimo 10 KB')
        .max(maxSize, `El archivo debe de ser de máximo ${maxSize / 1_000_000} MB`)
        .refine(isAllowedImage, { message: 'Solo se aceptan archivos PNG o JPEG' })
    )
    .min(1, 'Debes subir al menos un archivo')
    .max(maxFiles, `Puedes subir máximo ${maxFiles} fotos`);
