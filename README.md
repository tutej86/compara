# Compara — Comparador inteligente de presupuestos

## ¿Qué hace?
Subís 2 a 5 presupuestos (PDF, foto o Excel), la IA los lee, agrupa los ítems, detecta diferencias, faltantes y ambigüedades, y sugiere preguntas para clarificar.

---

## Cómo publicar en Vercel (sin instalar nada)

### 1. Subir a GitHub
1. Entrá a github.com y creá un repo nuevo llamado `compara`
2. Subí todos estos archivos a ese repositorio

### 2. Conectar con Vercel
1. Entrá a vercel.com y logueate con tu cuenta de GitHub
2. Click en "Add New Project"
3. Seleccioná el repositorio `compara`
4. Click en "Deploy"

### 3. Configurar la API key
1. En Vercel, andá a tu proyecto → Settings → Environment Variables
2. Agregá una variable:
   - Name: `ANTHROPIC_API_KEY`
   - Value: tu API key (la que empieza con `sk-ant-...`)
3. Click en "Save"
4. Volvé a Deployments y hacé "Redeploy"

¡Listo! Tu app va a estar en `compara.vercel.app` (o similar).

---

## Estructura del proyecto

```
compara/
├── app/
│   ├── layout.tsx          # Layout raíz con fuentes
│   ├── globals.css         # Estilos globales
│   ├── page.tsx            # Página principal
│   ├── page.module.css
│   └── api/
│       └── analyze/
│           └── route.ts    # API que llama a Anthropic
├── components/
│   ├── Uploader.tsx        # Drag & drop de archivos
│   ├── Uploader.module.css
│   ├── Results.tsx         # Tabla + insights + preguntas
│   └── Results.module.css
├── lib/
│   └── types.ts            # Tipos TypeScript
├── package.json
├── next.config.js
└── tsconfig.json
```

---

## Tecnologías usadas
- **Next.js 14** — framework web
- **Anthropic Claude** — IA que lee y compara presupuestos
- **react-dropzone** — drag & drop de archivos
- **xlsx** — lectura de archivos Excel

## Costos
- Vercel: gratuito (plan hobby)
- GitHub: gratuito
- Anthropic: ~$0.01–0.05 por análisis (según tamaño de archivos)
