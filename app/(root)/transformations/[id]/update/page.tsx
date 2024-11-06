import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

import Header from '@/components/shared/header'
import TransformationForm from '@/components/shared/transformation-form'
import { transformationTypes } from '@/constants'
import { getUserByClerkId } from '@/lib/actions/user.actions'
import { getImageById } from '@/lib/actions/image.actions'

const UpdateImagePage = async ({ params: { id } }: SearchParamProps) => {
  const { userId } = auth()
  if (!userId) redirect('/sign-in')

  const user = await getUserByClerkId(userId)
  if (!user) redirect('/sign-in')

  const image = await getImageById(id)
  if (!image) redirect('/error')

  const transformation = transformationTypes[image.transformationType as TransformationTypeKey]

  return (
    <>
      <Header title={transformation.title} subtitle={transformation.subtitle} />

      <section className="mt-10">
        <TransformationForm
          action="Update"
          userId={user._id as string}
          type={transformation.type as TransformationTypeKey}
          creditBalance={user.creditBalance}
          config={image.config}
          data={image}
        />
      </section>
    </>
  )
}

export default UpdateImagePage
