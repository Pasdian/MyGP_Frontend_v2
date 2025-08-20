export const customs = [
  { name: "Mazanillo", key: "160", code: "M" },
  { name: "Nuevo Laredo", key: "240", code: "L" },
  { name: "Veracruz", key: "430", code: "V" },
  { name: "AICM", key: "470", code: "A" },
  { name: "Toluca", key: "650", code: "T" },
  { name: "AIFA", key: "850", code: "F" },
];

export function getCustomKeyByRef(reference: string) {
  // Extraemos el segundo carácter
  const secondChar = reference.charAt(1);

  // Buscamos en customs el que coincida con el code
  const custom = customs.find((c) => c.code === secondChar);

  return custom ? custom.key : null;
}
