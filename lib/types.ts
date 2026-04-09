export type FileStatus = 'idle' | 'ready' | 'error'
export type ItemStatus = 'ok' | 'missing' | 'ambig' | 'diff' | 'nocomp'
export type InsightType = 'ok' | 'warn' | 'danger' | 'info'

export interface UploadedFile {
  id: string
  file: File
  name: string
  provider: string
}

export interface ComparisonInsight {
  tipo: InsightType
  texto: string
}

export interface ComparisonRow {
  concepto: string
  categoria: string
  precios: Record<string, string | null>
  estado: ItemStatus
  nota?: string
}

export interface SuggestedQuestion {
  pregunta: string
  dirigida_a: string
  razon: string
}

export interface ComparisonResult {
  resumen: {
    total_items: number
    items_con_diferencias: number
    items_faltantes: number
    items_ambiguos: number
  }
  insights: ComparisonInsight[]
  tabla: ComparisonRow[]
  preguntas: SuggestedQuestion[]
}
