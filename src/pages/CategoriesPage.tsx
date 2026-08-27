import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'

import { AppLayout } from '@/components/layout/AppLayout'
import { Button, Card, CardHead, ConfirmDialog, EmptyState, SkeletonRows } from '@/components/ui'
import { CategoryCard, type CategoryUsage } from '@/features/categories/CategoryCard'
import { CategoryForm } from '@/features/categories/CategoryForm'
import { useIsLoading } from '@/hooks/useAppData'
import { useCategoriesStore } from '@/store/useCategoriesStore'
import { toMessage, toast } from '@/store/useToastStore'
import { useTransactionsStore } from '@/store/useTransactionsStore'
import type { Category } from '@/types'

export function CategoriesPage() {
  const categories = useCategoriesStore((state) => state.items)
  const reorder = useCategoriesStore((state) => state.reorder)
  const removeCategory = useCategoriesStore((state) => state.remove)
  const transactions = useTransactionsStore((state) => state.items)
  const invalidateTransactions = useTransactionsStore((state) => state.invalidate)
  const loading = useIsLoading()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)

  /** Transaction count and total per category, for the card subtitle. */
  const usage = useMemo(() => {
    const map = new Map<string, CategoryUsage>()
    for (const transaction of transactions) {
      const current = map.get(transaction.categoryId) ?? { count: 0, total: 0 }
      current.count += 1
      current.total += transaction.amount
      map.set(transaction.categoryId, current)
    }
    return map
  }, [transactions])

  const commitOrder = async (orderedIds: string[]) => {
    try {
      await reorder(orderedIds)
    } catch (error) {
      toast.error(toMessage(error, 'Could not save the new order.'))
    }
  }

  const handleDragEnter = (targetId: string) => {
    if (!draggingId || draggingId === targetId) return
    setOverId(targetId)
  }

  const handleDragEnd = () => {
    if (draggingId && overId && draggingId !== overId) {
      const ids = categories.map((category) => category.id)
      const from = ids.indexOf(draggingId)
      const to = ids.indexOf(overId)
      ids.splice(to, 0, ...ids.splice(from, 1))
      void commitOrder(ids)
    }
    setDraggingId(null)
    setOverId(null)
  }

  const handleMove = (category: Category, direction: -1 | 1) => {
    const ids = categories.map((entry) => entry.id)
    const index = ids.indexOf(category.id)
    const target = index + direction
    if (target < 0 || target >= ids.length) return
    ;[ids[index], ids[target]] = [ids[target]!, ids[index]!]
    void commitOrder(ids)
  }

  const handleDelete = async () => {
    const target = pendingDelete
    if (!target) return

    try {
      const moved = await removeCategory(target.id)
      await invalidateTransactions()
      setPendingDelete(null)
      toast.success(`${target.name} deleted`, {
        description:
          moved > 0
            ? `${moved} transaction${moved === 1 ? '' : 's'} moved to Uncategorized.`
            : undefined,
      })
    } catch (error) {
      toast.error(toMessage(error, 'Could not delete the category.'))
    }
  }

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (category: Category) => {
    setEditing(category)
    setFormOpen(true)
  }

  return (
    <AppLayout
      title="Categories"
      actions={
        <Button variant="primary" icon={<Plus className="size-4" />} onClick={openCreate}>
          New
        </Button>
      }
    >
      {loading ? (
        <Card>
          <SkeletonRows rows={8} />
        </Card>
      ) : categories.length === 0 ? (
        <Card>
          <EmptyState
            title="No categories"
            description="Categories are how your spending is grouped and coloured."
            action={
              <Button variant="primary" onClick={openCreate}>
                Create a category
              </Button>
            }
          />
        </Card>
      ) : (
        <Card className="animate-in flex flex-col gap-3">
          <CardHead
            title="All categories"
            meta={`${categories.length} total`}
          />
          <p className="text-[13px] leading-snug text-fg-muted">
            Drag to reorder, or use the arrows — they work on touch, where dragging does not.
            Deleting a category moves its transactions to{' '}
            <strong className="font-bold text-fg">Uncategorized</strong>.
          </p>

          <ul className="flex flex-col">
            {categories.map((category, index) => (
              <CategoryCard
                key={category.id}
                category={category}
                usage={usage.get(category.id) ?? { count: 0, total: 0 }}
                dragging={draggingId === category.id}
                dropTarget={overId === category.id}
                onEdit={openEdit}
                onDelete={setPendingDelete}
                onMove={handleMove}
                canMoveUp={index > 0}
                canMoveDown={index < categories.length - 1}
                dragHandlers={{
                  onDragStart: () => setDraggingId(category.id),
                  onDragEnter: () => handleDragEnter(category.id),
                  onDragEnd: handleDragEnd,
                }}
              />
            ))}
          </ul>
        </Card>
      )}

      <CategoryForm open={formOpen} category={editing} onClose={() => setFormOpen(false)} />

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`Delete ${pendingDelete?.name ?? ''}?`}
        message={
          pendingDelete ? (
            (usage.get(pendingDelete.id)?.count ?? 0) > 0 ? (
              <>
                {usage.get(pendingDelete.id)?.count} transaction
                {usage.get(pendingDelete.id)?.count === 1 ? '' : 's'} will be moved to{' '}
                <strong className="font-bold text-fg">Uncategorized</strong>. This cannot be undone.
              </>
            ) : (
              'This category has no transactions. It will be removed permanently.'
            )
          ) : null
        }
        confirmLabel="Delete category"
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </AppLayout>
  )
}
