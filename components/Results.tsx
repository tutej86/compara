'use client'

import { ComparisonResult, ItemStatus, InsightType } from '@/lib/types'
import styles from './Results.module.css'

interface Props {
  result: ComparisonResult
  providers: string[]
  onReset: () => void
}

const STATUS_CONFIG: Record<ItemStatus, { label: string; className: string }> = {
  ok:      { label: 'Ok',           className: 'tagOk' },
  diff:    { label: 'Dif. precio',  className: 'tagDiff' },
  missing: { label: 'Faltante',     className: 'tagMissing' },
  ambig:   { label: 'Ambiguo',      className: 'tagAmbig' },
  nocomp:  { label: 'No comparable',className: 'tagNocomp' },
}

const INSIGHT_CONFIG: Record<InsightType, { icon: string; className: string }> = {
  ok:     { icon: '✓', className: 'insightOk' },
  info:   { icon: 'i', className: 'insightInfo' },
  warn:   { icon: '!', className: 'insightWarn' },
  danger: { icon: '⚠', className: 'insightDanger' },
}

export default function Results({ result, providers, onReset }: Props) {
  const { resumen, insights, tabla, preguntas } = result

  const statCards = [
    { label: 'Ítems totales',       value: resumen.total_items,           mod: '' },
    { label: 'Con diferencias',     value: resumen.items_con_diferencias,  mod: 'warn' },
    { label: 'Faltantes',           value: resumen.items_faltantes,        mod: 'danger' },
    { label: 'Ambiguos',            value: resumen.items_ambiguos,         mod: 'warn' },
  ]

  return (
    <div className={styles.container}>
      {/* Summary cards */}
      <div className={styles.statsGrid}>
        {statCards.map(s => (
          <div key={s.label} className={styles.statCard}>
            <span className={styles.statLabel}>{s.label}</span>
            <span className={`${styles.statValue} ${s.mod ? styles[s.mod] : ''}`}>
              {s.value}
            </span>
          </div>
        ))}
      </div>

      {/* Insights */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>◎</span> Análisis general
        </h2>
        <div className={styles.insightsList}>
          {insights.map((ins, i) => {
            const cfg = INSIGHT_CONFIG[ins.tipo]
            return (
              <div key={i} className={`${styles.insightItem} ${styles[cfg.className]}`}>
                <span className={styles.insightIcon}>{cfg.icon}</span>
                <p className={styles.insightText}>{ins.texto}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Comparison table */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>≡</span> Tabla comparativa
        </h2>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.thConcept}>Concepto</th>
                <th className={styles.thCat}>Categoría</th>
                {providers.map(p => (
                  <th key={p} className={styles.thProvider}>{p}</th>
                ))}
                <th className={styles.thStatus}>Estado</th>
                <th className={styles.thNote}>Nota</th>
              </tr>
            </thead>
            <tbody>
              {tabla.map((row, i) => {
                const cfg = STATUS_CONFIG[row.estado]
                return (
                  <tr key={i} className={row.estado === 'missing' ? styles.rowMissing : ''}>
                    <td className={styles.tdConcept}>{row.concepto}</td>
                    <td className={styles.tdCat}>{row.categoria}</td>
                    {providers.map(p => {
                      const val = row.precios[p]
                      return (
                        <td key={p} className={val ? styles.tdPrice : styles.tdEmpty}>
                          {val || '—'}
                        </td>
                      )
                    })}
                    <td>
                      <span className={`${styles.tag} ${styles[cfg.className]}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className={styles.tdNote}>{row.nota || ''}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Suggested questions */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>?</span> Preguntas sugeridas
        </h2>
        <div className={styles.questionsList}>
          {preguntas.map((q, i) => (
            <div key={i} className={styles.questionItem}>
              <div className={styles.questionMain}>
                <p className={styles.questionText}>"{q.pregunta}"</p>
                <span className={styles.questionTo}>Para: {q.dirigida_a}</span>
              </div>
              <p className={styles.questionRazon}>{q.razon}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Reset */}
      <div className={styles.resetArea}>
        <button className={styles.resetBtn} onClick={onReset}>
          ← Comparar otros presupuestos
        </button>
        <p className={styles.resetNote}>Los archivos no fueron guardados en ningún servidor</p>
      </div>
    </div>
  )
}
