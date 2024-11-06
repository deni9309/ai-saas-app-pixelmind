import { NextResponse } from 'next/server'
import stripe from 'stripe'

import { createTransaction } from '@/lib/actions/transaction.actions'

export async function POST(request: Request) {
  const body = await request.text()

  const signature = request.headers.get('stripe-signature')
  const secret = process.env.STRIPE_WEBHOOK_SECRET!

  let event: stripe.Event

  try {
    if (!signature) throw new Error('Missing Stripe signature')

    event = stripe.webhooks.constructEvent(body, signature, secret)
  } catch (err) {
    return NextResponse.json({ message: 'Stripe Webhook error', error: err })
  }

  const eventType = event.type

  // Handle event checkout.session.completed
  if (eventType === 'checkout.session.completed') {
    const { id, amount_total: amountTotal, metadata } = event.data.object

    const transaction: CreateTransactionParams = {
      stripeId: id,
      amount: amountTotal ? amountTotal / 100 : 0,
      plan: metadata?.plan || '',
      credits: Number(metadata?.credits) || 0,
      buyerId: metadata?.buyerId || '',
      createdAt: new Date(),
    }

    const newTransaction = await createTransaction(transaction)

    if (!newTransaction) {
      return NextResponse.json({ message: 'Failed to create transaction', transaction: null })
    }

    return NextResponse.json({ message: 'OK', transaction: newTransaction })
  }

  return new Response('', { status: 200 })
}
