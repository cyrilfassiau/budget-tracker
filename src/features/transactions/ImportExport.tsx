import { Download, MoreHorizontal, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui'
import { useCategoriesStore } from '@/store/useCategoriesStore'
import { toMessage, toast } from '@/store/useToastStore'
import { useTransactionsStore } from '@/store/useTransactionsStore'
import type { Transaction } from '@/types'
import { downloadFile, fromCSV, toCSV } from '@/utils/csv'
import { toDateKey } from '@/utils/dates'

interface ImportExportProps {
  rows: Transaction[]
  scopeLabel: string
}

export function ImportExport({ rows, scopeLabel }: ImportExportProps) {
  const addMany = useTransactionsStore((state) => state.addMany)
  const categories = useCategoriesStore((state) => state.items)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [importing, setImporting] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const handleExport = () => {
    if (rows.length === 0) {
      toast.info('Nothing to export', { description: 'Nothing matches the current view.' })
      return
    }
    downloadFile(`budget-tracker-${toDateKey(new Date())}.csv`, toCSV(rows, categories))
    toast.success(`Exported ${rows.length} transaction${rows.length === 1 ? '' : 's'}`, {
      description: scopeLabel,
    })
  }

  const handleImport = async (file: File) => {
    setImporting(true)
    try {
      const { transactions: parsed, errors } = fromCSV(await file.text(), categories)

      if (parsed.length === 0) {
        toast.error('Nothing could be imported', {
          description: errors[0] ?? 'The file had no usable rows.',
        })
        return
      }

      const created = await addMany(parsed)
      toast.success(`Imported ${created.length} transaction${created.length === 1 ? '' : 's'}`, {
        description:
          errors.length > 0
            ? `${errors.length} ${errors.length === 1 ? 'row was' : 'rows were'} skipped: ${errors[0]}`
            : undefined,
      })
    } catch (error) {
      toast.error(toMessage(error, 'Could not read that file.'))
    } finally {
      setImporting(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div ref={containerRef} className="relative flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void handleImport(file)
        }}
      />
      <Button
        variant="secondary"
        size="sm"
        className="px-0 max-sm:size-11 sm:hidden"
        aria-label="Import or export"
        aria-haspopup="menu"
        aria-expanded={open}
        loading={importing}
        onClick={() => setOpen((value) => !value)}
      >
        {importing ? null : <MoreHorizontal className="size-4" />}
      </Button>
      <Button
        variant="secondary"
        size="sm"
        className="hidden sm:inline-flex"
        icon={<Upload className="size-4" />}
        loading={importing}
        onClick={() => inputRef.current?.click()}
      >
        Import
      </Button>
      <Button
        variant="secondary"
        size="sm"
        className="hidden sm:inline-flex"
        icon={<Download className="size-4" />}
        onClick={handleExport}
      >
        Export
      </Button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-1 w-44 animate-in overflow-hidden rounded-[16px] bg-raised p-1 shadow-[0_10px_30px_-8px_rgb(var(--scrim)/0.35)] sm:hidden"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              inputRef.current?.click()
            }}
            className="flex w-full items-center gap-2.5 rounded-[12px] px-3 py-2.5 text-[14px] font-semibold text-fg transition-colors hover:bg-surface-2"
          >
            <Upload className="size-4" />
            Import CSV
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              handleExport()
            }}
            className="flex w-full items-center gap-2.5 rounded-[12px] px-3 py-2.5 text-[14px] font-semibold text-fg transition-colors hover:bg-surface-2"
          >
            <Download className="size-4" />
            Export CSV
          </button>
        </div>
      ) : null}
    </div>
  )
}
