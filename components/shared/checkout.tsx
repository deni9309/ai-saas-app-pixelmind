'use client'

import { useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { BadgeDollarSign } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { checkoutCredits } from '@/lib/actions/transaction.actions'

const Checkout = ({
  plan,
  amount,
  credits,
  buyerId,
}: {
  plan: string
  amount: number
  credits: number
  buyerId: string
}) => {
  const { toast } = useToast()

  useEffect(() => {
    loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }, [])

  useEffect(() => {
    // Check whether this is a redirect back from Checkout
    const query = new URLSearchParams(window.location.search)

    if (query.get('success')) {
      toast({
        title: 'Order placed! 🎉',
        description: 'You will receive an email confirmation shortly.',
        duration: 5000,
        className: 'success-toast',
      })
    }

    if (query.get('canceled')) {
      toast({
        title: 'Order canceled!',
        description: "Continue shopping and place an order anytime you're ready.",
        duration: 5000,
        className: 'error-toast',
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onCheckout = async () => {
    const transaction = { plan, amount, credits, buyerId }

    await checkoutCredits(transaction)
  }

  return (
    <form action={onCheckout} method="POST">
      <section>
        <Button
          type="submit"
          role="link"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-purple-500 transition-colors hover:bg-purple-600"
        >
          <BadgeDollarSign width={24} height={24} />
          Buy Credits
        </Button>
      </section>
    </form>
  )
}

export default Checkout
