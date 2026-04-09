'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadedFile } from '@/lib/types'
import styles from './Uploader.module.css'

interface Props {
  onAnalyze: (files: UploadedFile[]) => void
}

const ACCEPTED = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls'],
  'text/csv': ['.csv'],
}

function fileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return '📄'
  if (['jpg', 'jpeg', 'png'].includes(ext || '')) return '🖼️'
  if (['xlsx', 'xls', 'csv'].includes(ext || '')) return '📊'
  return '📎'
}

function fileTag(name: string): { label: string; color: string } {
  const ext = name.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return { label: 'PDF', color: '#e11d48' }
  if (['jpg', 'jpeg', 'png'].includes(ext || '')) return { label: 'Imagen', color: '#7c3aed' }
  if (['xlsx', 'xls'].includes(ext || '')) return { label: 'Excel', color: '#059669' }
  if (ext === 'csv') return { label: 'CSV', color: '#0284c7' }
  return { label: ext?.toUpperCase() || 'Archivo', color: '#6b7280' }
}

export default function Uploader({ onAnalyze }: Props) {
  const [files, setFiles] = useState<UploadedFile[]>([])

  const onDrop = useCallback((accepted: File[]) => {
    setFiles(prev => {
      const remaining = 5 - prev.length
      const newFiles: UploadedFile[] = accepted.slice(0, remaining).map(f => ({
        id: Math.random().toString(36).slice(2),
        file: f,
        name: f.name,
        provider: '',
      }))
      return [...prev, ...newFiles]
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxFiles: 5,
    disabled: files.length >= 5,
  })

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const updateProvider = (id: string, value: string) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, provider: value } : f))
  }

  const handleAnalyze = () => {
    const withNames = files.map((f, i) => ({
      ...f,
      provider: f.provider.trim() || `Proveedor ${i + 1}`
    }))
    onAnalyze(withNames)
  }

  const canAnalyze = files.length >= 2

  return (
    <div className={styles.container}>
      {/* Hero text */}
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>
          Comparás presupuestos.<br />
          <span className={styles.heroAccent}>Nosotros encontramos las diferencias.</span>
        </h1>
        <p className={styles.heroSub}>
          Subí 2 a 5 presupuestos en PDF, foto o Excel. La IA extrae los ítems, los agrupa y te muestra qué falta, qué es ambiguo y dónde están las diferencias reales.
        </p>
      </div>

      {/* Drop zone */}
      {files.length < 5 && (
        <div
          {...getRootProps()}
          className={`${styles.dropzone} ${isDragActive ? styles.active : ''}`}
        >
          <input {...getInputProps()} />
          <div className={styles.dropIcon}>⤓</div>
          <p className={styles.dropTitle}>
            {isDragActive ? 'Soltá los archivos acá' : 'Arrastrá tus presupuestos acá'}
          </p>
          <p className={styles.dropSub}>
            o <span className={styles.dropLink}>hacé click para seleccionar</span>
          </p>
          <p className={styles.dropFormats}>PDF · JPG · PNG · Excel · CSV · hasta 5 archivos</p>
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className={styles.fileList}>
          <p className={styles.fileListTitle}>
            {files.length} archivo{files.length > 1 ? 's' : ''} · Escribí el nombre del proveedor en cada uno
          </p>
          {files.map((f, i) => {
            const tag = fileTag(f.name)
            return (
              <div key={f.id} className={styles.fileItem}>
                <span className={styles.fileNum}>{i + 1}</span>
                <span className={styles.fileIcon}>{fileIcon(f.name)}</span>
                <div className={styles.fileMeta}>
                  <span className={styles.fileName}>{f.name}</span>
                  <span
                    className={styles.fileTag}
                    style={{ background: tag.color + '18', color: tag.color }}
                  >
                    {tag.label}
                  </span>
                </div>
                <input
                  className={styles.providerInput}
                  placeholder={`Proveedor ${i + 1}`}
                  value={f.provider}
                  onChange={e => updateProvider(f.id, e.target.value)}
                />
                <button className={styles.removeBtn} onClick={() => removeFile(f.id)}>×</button>
              </div>
            )
          })}
        </div>
      )}

      {/* CTA */}
      {files.length >= 2 && (
        <button className={styles.analyzeBtn} onClick={handleAnalyze}>
          Comparar {files.length} presupuestos →
        </button>
      )}

      {files.length === 1 && (
        <p className={styles.hint}>Agregá al menos un presupuesto más para poder comparar</p>
      )}

      {/* Feature pills */}
      {files.length === 0 && (
        <div className={styles.features}>
          {['Detecta ítems faltantes', 'Agrupa conceptos similares', 'Marca ambigüedades', 'Sugiere preguntas', 'Diferencias de precio'].map(f => (
            <span key={f} className={styles.featurePill}>{f}</span>
          ))}
        </div>
      )}
    </div>
  )
}
