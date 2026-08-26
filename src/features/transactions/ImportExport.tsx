import { Download, Upload } from 'lucide-react'
import { useRef, useState } from 'react'

import { Button } from '@/components/ui'
import { useCategoriesStore } from '@/store/useCategoriesStore'
import { toMessage, toast } from '@/store/useToastStore'
import { useTransactionsStore } from '@/store/useTransactionsStore'
import type { Transaction } from '@/types'
import { downloadFile, fromCSV, toCSV } from '@/utils/csv'
import { toDateKey } from '@/utils/dates'

interface ImportExportProps {
  /**
   * The rows currently on screen. Export writes exactly these — an export
   * button that quietly ignores the filters above it is a lie.
   */
  rows: Transaction[]
  scopeLabel: string
}

export function ImportExport({ rows, scopeLabel }: ImportExportProps) {
  const addMany = useTransactionsStore((state) => state.addMany)
  const categories = useCategoriesStore((state) => state.items)
  const inputRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)

  const handleExport = () => {
    if (rows.length === 0) {
      toast.info('Nothing to export', { description: 'No entries match the current view.' })
      return
    }
    downloadFile(`budget-tracker-${toDateKey(new Date())}.csv`, toCSV(rows, categories))
    toast.success(`Exported ${rows.length} ${rows.length === 1 ? 'entry' : 'entries'}`, {
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
      toast.success(`Imported ${created.length} ${created.length === 1 ? 'entry' : 'entries'}`, {
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
    <div className="flex items-center gap-1.5">
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
        icon={<Upload className="size-3" />}
        loading={importing}
        onClick={() => inputRef.current?.click()}
      >
        Import
      </Button>
      <Button
        variant="secondary"
        size="sm"
        icon={<Download className="size-3" />}
        onClick={handleExport}
      >
        Export
      </Button>
    </div>
  )
}
