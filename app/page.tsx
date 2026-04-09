'use client'

import { useState } from 'react'
import Uploader from '@/components/Uploader'
import Results from '@/components/Results'
import { ComparisonResult, UploadedFile } from '@/lib/types'
import styles from './page.module.css'

export default function Home() {
  const [result, setResult] = useState<ComparisonResult | null>(null)
  const [providers, setProviders] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState('')

  const handleAnalyze = async (files: UploadedFile[]) => {
    setLoading(true)
    setResult(null)

    const steps = [
      'Leyendo los archivos...',
      'Extrayendo ítems y precios...',
      'Agrupando conceptos similares...',
      'Detectando diferencias y ambigüedades...',
      'Generando análisis...',
    ]

    let i = 0
    setLoadingStep(steps[0])
    const stepInterval = setInterval(() => {
      i = Math.min(i + 1, steps.length - 1)
      setLoadingStep(steps[i])
    }, 1800)

    try {
      const formData = new FormData()
      files.forEach((f, idx) => {
        formData.append(`file_${idx}`, f.file)
        formData.append(`provider_${idx}`, f.provider || `Proveedor ${idx + 1}`)
      })
      formData.append('count', String(files.length))

      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al analizar')
      }

      const data = await res.json()
      setProviders(files.map((f, i) => f.provider || `Proveedor ${i + 1}`))
      setResult(data)
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      clearInterval(stepInterval)
      setLoading(false)
      setLoadingStep('')
    }
  }

  const handleReset = () => {
    setResult(null)
    setProviders([])
  }

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>⇄</span>
          <span className={styles.logoText}>Compara</span>
        </div>
        <p className={styles.tagline}>Comparador inteligente de presupuestos</p>
      </header>

      {!result && !loading && (
        <Uploader onAnalyze={handleAnalyze} />
      )}

      {loading && (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p className={styles.loadingStep}>{loadingStep}</p>
          <p className={styles.loadingHint}>Esto puede tardar unos segundos según el tamaño de los archivos</p>
        </div>
      )}

      {result && (
        <Results result={result} providers={providers} onReset={handleReset} />
      )}

      <footer className={styles.footer}>
        <p>Compara · Beta · Los archivos no se guardan</p>
      </footer>
    </main>
  )
}
