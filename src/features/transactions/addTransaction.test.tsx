import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import { TransactionsPage } from '@/pages/TransactionsPage'
import { renderWithRouter, resetApp } from '@/test/renderApp'
import { makeTransaction } from '@/test/factories'
import { useTransactionsStore } from '@/store/useTransactionsStore'

describe('recording an entry', () => {
  beforeEach(() => {
    resetApp()
  })

  async function openDialog(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole('button', { name: /add transaction/i }))
    return screen.findByRole('dialog')
  }

  it('adds a transaction and shows it in the list', async () => {
    const user = userEvent.setup()
    renderWithRouter(<TransactionsPage />)

    await screen.findByText(/no transactions yet/i)

    const dialog = await openDialog(user)
    await user.type(within(dialog).getByLabelText(/amount/i), '32.90')
    await user.selectOptions(within(dialog).getByLabelText(/category/i), 'cat-groceries')
    await user.type(within(dialog).getByLabelText(/note/i), 'Market run')
    await user.click(within(dialog).getByRole('button', { name: /^add$/i }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

    const row = (await screen.findByText('Market run')).closest('li')!

    expect(within(row).getAllByText(/32\.90/)).toHaveLength(2)
    expect(row).toHaveTextContent('Groceries')
    expect(screen.getByText(/transaction added/i)).toBeInTheDocument()
  })

  it('persists the new transaction through the service layer', async () => {
    const user = userEvent.setup()
    renderWithRouter(<TransactionsPage />)
    await screen.findByText(/no transactions yet/i)

    const dialog = await openDialog(user)
    await user.type(within(dialog).getByLabelText(/amount/i), '10')
    await user.selectOptions(within(dialog).getByLabelText(/category/i), 'cat-rent')
    await user.click(within(dialog).getByRole('button', { name: /^add$/i }))

    await waitFor(() => {
      expect(useTransactionsStore.getState().items).toHaveLength(1)
    })
    expect(useTransactionsStore.getState().items[0]).toMatchObject({
      amount: 10,
      categoryId: 'cat-rent',
      type: 'expense',
    })
  })

  it('blocks submission and explains why when the form is invalid', async () => {
    const user = userEvent.setup()
    renderWithRouter(<TransactionsPage />)
    await screen.findByText(/no transactions yet/i)

    const dialog = await openDialog(user)
    await user.click(within(dialog).getByRole('button', { name: /^add$/i }))

    expect(await within(dialog).findByText(/enter an amount/i)).toBeInTheDocument()
    expect(within(dialog).getByText(/pick a category/i)).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(useTransactionsStore.getState().items).toHaveLength(0)
  })

  it('rejects a zero amount', async () => {
    const user = userEvent.setup()
    renderWithRouter(<TransactionsPage />)
    await screen.findByText(/no transactions yet/i)

    const dialog = await openDialog(user)
    await user.type(within(dialog).getByLabelText(/amount/i), '0')
    await user.selectOptions(within(dialog).getByLabelText(/category/i), 'cat-groceries')
    await user.click(within(dialog).getByRole('button', { name: /^add$/i }))

    expect(await within(dialog).findByText(/greater than zero/i)).toBeInTheDocument()
  })

  it('offers only income categories once the type is switched', async () => {
    const user = userEvent.setup()
    renderWithRouter(<TransactionsPage />)
    await screen.findByText(/no transactions yet/i)

    const dialog = await openDialog(user)
    await user.click(within(dialog).getByRole('radio', { name: /received/i }))

    const options = within(within(dialog).getByLabelText(/category/i)).getAllByRole('option')
    const labels = options.map((option) => option.textContent)

    expect(labels).toContain('Salary')
    expect(labels).not.toContain('Rent')
  })

  it('closes on Escape without saving', async () => {
    const user = userEvent.setup()
    renderWithRouter(<TransactionsPage />)
    await screen.findByText(/no transactions yet/i)

    const dialog = await openDialog(user)
    await user.type(within(dialog).getByLabelText(/amount/i), '15')
    await user.keyboard('{Escape}')

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(useTransactionsStore.getState().items).toHaveLength(0)
  })
})

describe('editing and deleting a transaction', () => {
  beforeEach(() => {
    resetApp({
      transactions: [
        makeTransaction({ id: 'txn-edit', note: 'Weekly shop', amount: 45, date: '2026-03-02' }),
      ],
    })
  })

  it('edits an existing transaction', async () => {
    const user = userEvent.setup()
    renderWithRouter(<TransactionsPage />)

    await screen.findByText('Weekly shop')
    await user.click(screen.getByRole('button', { name: /actions for weekly shop/i }))
    await user.click(screen.getByRole('menuitem', { name: /edit/i }))

    const dialog = await screen.findByRole('dialog')
    const noteField = within(dialog).getByLabelText(/note/i)
    await user.clear(noteField)
    await user.type(noteField, 'Big shop')
    await user.click(within(dialog).getByRole('button', { name: /^save$/i }))

    expect(await screen.findByText('Big shop')).toBeInTheDocument()
    expect(screen.queryByText('Weekly shop')).not.toBeInTheDocument()
  })

  it('asks for confirmation before deleting', async () => {
    const user = userEvent.setup()
    renderWithRouter(<TransactionsPage />)

    await screen.findByText('Weekly shop')
    await user.click(screen.getByRole('button', { name: /actions for weekly shop/i }))
    await user.click(screen.getByRole('menuitem', { name: /delete/i }))

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText(/delete this transaction\?/i)).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: /^cancel$/i }))
    expect(useTransactionsStore.getState().items).toHaveLength(1)
  })

  it('deletes after confirming', async () => {
    const user = userEvent.setup()
    renderWithRouter(<TransactionsPage />)

    await screen.findByText('Weekly shop')
    await user.click(screen.getByRole('button', { name: /actions for weekly shop/i }))
    await user.click(screen.getByRole('menuitem', { name: /delete/i }))

    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: /^delete$/i }))

    await waitFor(() => expect(useTransactionsStore.getState().items).toHaveLength(0))
    expect(await screen.findByText(/transaction deleted/i)).toBeInTheDocument()
  })
})
