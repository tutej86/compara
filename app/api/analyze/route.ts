import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `Sos un experto en análisis y comparación de presupuestos comerciales argentinos e internacionales.
Tu tarea es analizar múltiples presupuestos y devolver un JSON estructurado.

Responde SOLO con JSON válido. Sin markdown, sin backticks, sin texto adicional antes o después.

Estructura exacta requerida:
{
  "resumen": {
    "total_items": number,
    "items_con_diferencias": number,
    "items_faltantes": number,
    "items_ambiguos": number
  },
  "insights": [
    { "tipo": "ok"|"warn"|"danger"|"info", "texto": "string" }
  ],
  "tabla": [
    {
      "concepto": "nombre del ítem",
      "categoria": "categoría",
      "precios": { "NombreProveedor": "valor con moneda o null" },
      "estado": "ok"|"missing"|"ambig"|"diff"|"nocomp",
      "nota": "observación opcional"
    }
  ],
  "preguntas": [
    { "pregunta": "texto", "dirigida_a": "Proveedor X o Todos", "razon": "por qué importa" }
  ]
}

Reglas de estado:
- "ok": todos incluyen el ítem con precio similar (menos de 20% de diferencia)
- "diff": diferencia de precio mayor al 20% entre proveedores
- "missing": al menos un proveedor no incluye el ítem
- "ambig": el ítem existe pero la descripción es vaga, incompleta o confusa
- "nocomp": los presupuestos son tan distintos en alcance que no son comparables directamente

Instrucciones adicionales:
- Mencioná los proveedores por nombre en los insights
- Detectá si el IVA está o no incluido y marcalo
- Detectá ítems como traslado, instalación, operador, garantía, plazo de entrega
- Generá mínimo 5 insights y 6 preguntas sugeridas
- Si hay monedas mixtas (ARS/USD), indicalo
- Sé concreto y accionable, no genérico`

export async function POST(req: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'API key no configurada' }, { status: 500 })
    }

    const formData = await req.formData()
    const count = parseInt(formData.get('count') as string)

    if (count < 2) {
      return NextResponse.json({ error: 'Se necesitan al menos 2 presupuestos' }, { status: 400 })
    }

    const contentParts: any[] = []
    contentParts.push({
      type: 'text',
      text: `Analizá estos ${count} presupuestos y compáralos. Devolvé el JSON de análisis.\n\n`
    })

    for (let i = 0; i < count; i++) {
      const file = formData.get(`file_${i}`) as File
      const provider = formData.get(`provider_${i}`) as string || `Proveedor ${i + 1}`

      if (!file) continue

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64 = buffer.toString('base64')
      const ext = file.name.split('.').pop()?.toLowerCase()

      contentParts.push({
        type: 'text',
        text: `\n=== PRESUPUESTO ${i + 1}: ${provider} (${file.name}) ===\n`
      })

      if (ext === 'pdf') {
        contentParts.push({
          type: 'document',
          source: { type: 'base64', media_type: 'application/pdf', data: base64 }
        })
      } else if (['jpg', 'jpeg', 'png', 'webp'].includes(ext || '')) {
        const mediaType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg'
        contentParts.push({
          type: 'image',
          source: { type: 'base64', media_type: mediaType, data: base64 }
        })
      } else if (['xlsx', 'xls', 'csv'].includes(ext || '')) {
        // Para Excel/CSV, convertimos a texto
        let text = ''
        if (ext === 'csv') {
          text = buffer.toString('utf-8')
        } else {
          // xlsx: intentamos extraer como texto básico
          text = `[Archivo Excel: ${file.name}]\n`
          try {
            const XLSX = await import('xlsx')
            const wb = XLSX.read(bytes, { type: 'array' })
            wb.SheetNames.forEach((sheetName: string) => {
              const ws = wb.Sheets[sheetName]
              text += `\nHoja: ${sheetName}\n`
              text += XLSX.utils.sheet_to_csv(ws)
            })
          } catch {
            text += '(No se pudo leer el archivo Excel)'
          }
        }
        contentParts.push({ type: 'text', text })
      }
    }

    contentParts.push({
      type: 'text',
      text: '\nDevolvé únicamente el JSON de análisis comparativo, sin ningún texto adicional.'
    })

    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: contentParts }]
    })

    const raw = response.content
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text)
      .join('')

    const clean = raw.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    return NextResponse.json(parsed)
  } catch (err: any) {
    console.error('Error en /api/analyze:', err)
    return NextResponse.json(
      { error: err.message || 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export const config = {
  api: { bodyParser: false },
  maxDuration: 120,
}
