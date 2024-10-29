import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

import Header from '@/components/shared/header'
import TransformationForm from '@/components/shared/transformation-form'
import { transformationTypes } from '@/constants'
import { getUserByClerkId } from '@/lib/actions/user.actions'

const AddTransformationTypePage = async ({ params: { type } }: SearchParamProps) => {
  const { userId } = auth()
  const transformation = transformationTypes[type]

  if (!userId) redirect('/sign-in')

  const user = await getUserByClerkId(userId)

  if (!user) redirect('/sign-in')

  return (
    <>
      <Header title={transformation.title} subtitle={transformation.subtitle} />

      <section className="mt-10">
        <TransformationForm
          action="Add"
          userId={user._id as string}
          type={transformation.type as TransformationTypeKey}
          creditBalance={user.creditBalance}
        />
      </section>
    </>
  )
}

export default AddTransformationTypePage
