// Colores oficiales de la marca Tinta según el manual 2025
export const tintaColors = {
  // Colores principales
  verdeUva: "#143F3B",
  paper: "#EBEBEB",
  gris: "#2E2E2E",
  
  // Colores secundarios
  rosaVino: "#DDBBC0",
  amarilloAlegria: "#E2E369",
  ocreCorteza: "#AE8928",
} as const

export type TintaColor = keyof typeof tintaColors

// Mapa de colores para usar en el selector
export const tintaColorOptions = [
  { value: "verdeUva", label: "Verde Uva", color: tintaColors.verdeUva },
  { value: "rosaVino", label: "Rosa Vino", color: tintaColors.rosaVino },
  { value: "amarilloAlegria", label: "Amarillo Alegría", color: tintaColors.amarilloAlegria },
  { value: "ocreCorteza", label: "Ocre Corteza", color: tintaColors.ocreCorteza },
] as const

// Función helper para obtener el color hex
export function getTintaColor(colorKey: string | null | undefined): string | undefined {
  if (!colorKey) return undefined
  return tintaColors[colorKey as TintaColor]
}