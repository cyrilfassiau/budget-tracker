import { Download, Upload } from 'lucide-react'
import { useRef, useState } from 'react'

import { Button } from '@/components/ui'
import { useCategoriesStore } from '@/store/useCategoriesStore'
import { toMessage, toast } from '@/store/useToastStore'
import { useTransactionsStore } from '@/store/useTransactionsStore'
import { downloadFile, fromCSV, toCSV } from '@/utils/csv'
import { toDateKey } from '@/utils/dates'

/** CSV round-trip: export what is on screen, import what a spreadsheet made. */
export function ImportExport() {
  const transactions = useTransactionsStore((state) => state.items)
  const addMany = useTransactionsStore((state) => state.addMany)
  const categories = useCategoriesStore((state) => state.items)
  const inputRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)

  const handleExport = () => {
    if (transactions.length === 0) {
      toast.info('There is nothing to export yet.')
      return
    }
    downloadFile(`budget-tracker-${toDateKey(new Date())}.csv`, toCSV(transactions, categories))
    toast.success(`Exported ${transactions.length} transactions`)
  }

  const handleImport = async (file: File) => {
    setImporting(true)
    try {
      const { transactions: parsed, errors } = fromCSV(await file.text(), categories)

      if (parsed.length === 0) {
        toast.error('Nothing could be imported.', {
          description: errors[0] ?? 'The file had no usable rows.',
        })
        return
      }

      await addMany(parsed)
      toast.success(`Imported ${parsed.length} transactions`, {
        description:
          errors.length > 0 ? `${errors.length} row(s) were skipped.` : undefined,
      })
    } catch (error) {
      toast.error(toMessage(error, 'Could not read that file.'))
    } finally {
      setImporting(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void handleImport(file)
        }}
      />

      <Button
        variant="secondary"
        size="sm"
        icon={<Upload className="size-3.5" />}
        loading={importing}
        onClick={() => inputRef.current?.click()}
      >
        Import
      </Button>
      <Button
        variant="secondary"
        size="sm"
        icon={<Download className="size-3.5" />}
        onClick={handleExport}
      >
        Export
      </Button>
    </div>
  )
}
