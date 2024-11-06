import { SignedIn, auth } from '@clerk/nextjs'
import Image from 'next/image'
import { redirect } from 'next/navigation'

import { Button } from '@/components/ui/button'
import Checkout from '@/components/shared/checkout'
import Header from '@/components/shared/header'
import { plans } from '@/constants'
import { getUserByClerkId } from '@/lib/actions/user.actions'

const CreditPage = async () => {
  const { userId } = auth()
  if (!userId) redirect('/sign-in')

  const user = await getUserByClerkId(userId)
  if (!user) redirect('/sign-in')

  return (
    <>
      <Header title="Buy Credits" subtitle="Choose a credit package that suits your needs!" />
      <section>
        <ul className="credits-list">
          {plans.map((plan) => (
            <li key={plan.name} className="credits-item">
              <div className="flex-center flex-col gap-3">
                <Image src={plan.icon} alt={plan.name} width={50} height={50} />
                <p className="p-20-semibold mt-2 text-purple-500">{plan.name}</p>
                <p className="h1-semibold text-dark-600">${plan.price}</p>
                <p className="p-16-regular">{plan.credits} Credits</p>
              </div>

              <ul className="flex flex-col gap-5 py-9">
                {plan.inclusions.map((inclusion) => (
                  <li key={plan.name + inclusion.label} className="flex items-center gap-4">
                    <Image
                      src={`/assets/icons/${inclusion.isIncluded ? 'check.svg' : 'cross.svg'}`}
                      alt={`${inclusion.isIncluded ? 'Check' : 'Cross'}`}
                      width={24}
                      height={24}
                    />
                    <p className="p-16-regular">{inclusion.label}</p>
                  </li>
                ))}
              </ul>

              {plan.name === 'Free' ? (
                <Button variant="outline" className="credits-btn">
                  Free Consumable
                </Button>
              ) : (
                <SignedIn>
                  <Checkout
                    plan={plan.name}
                    amount={plan.price}
                    credits={plan.credits}
                    buyerId={user._id as string}
                  />
                </SignedIn>
              )}
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

export default CreditPage
