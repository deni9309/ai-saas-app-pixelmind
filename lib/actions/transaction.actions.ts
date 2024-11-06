'use server'

import Stripe from 'stripe'
import { redirect } from 'next/navigation'

import { updateCredits } from '@/lib/actions/user.actions'
import Transaction, { ITransaction } from '@/lib/database/models/transaction.model'
import { connectToDatabase } from '@/lib/database/mongoose'
import { handleError } from '@/lib/utils'

export async function checkoutCredits(transaction: CheckoutTransactionParams) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

  const amount = Number(transaction.amount) * 100

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: amount,
          product_data: {
            name: transaction.plan,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      plan: transaction.plan,
      credits: transaction.credits,
      buyerId: transaction.buyerId,
    },
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/profile`,
    cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/`,
  })

  redirect(session.url!)
}

/**
 * Creates a new transaction in the database.
 *
 * @param {CreateTransactionParams} transaction - The transaction to create with its respective properties.
 *
 * @returns {Promise<ITransaction | undefined>} A promise that resolves to the newly created transaction, or undefined if there was an error.
 */
export async function createTransaction(
  transaction: CreateTransactionParams,
): Promise<ITransaction | undefined> {
  try {
    await connectToDatabase()

    // Create a new transaction with a buyerId
    const newTransaction: ITransaction | null = await Transaction.create({
      ...transaction,
      buyer: transaction.buyerId,
    })

    if (!newTransaction) throw new Error('Failed to create transaction')

    // Update the user's credits
    await updateCredits(transaction.buyerId, transaction.credits)

    return JSON.parse(JSON.stringify(newTransaction))
  } catch (error) {
    handleError(error)
  }
}
