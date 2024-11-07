import { auth } from '@clerk/nextjs'
import Image from 'next/image'
import { redirect } from 'next/navigation'

import { Collection } from '@/components/shared/collection'
import Header from '@/components/shared/header'
import { getUserImages } from '@/lib/actions/image.actions'
import { getUserByClerkId } from '@/lib/actions/user.actions'

const ProfilePage = async ({ searchParams }: SearchParamProps) => {
  const page = Number(searchParams?.page) || 1

  const { userId } = auth()
  if (!userId) redirect('/sign-in')

  const user = await getUserByClerkId(userId)
  if (!user) redirect('/sign-in')

  const images = await getUserImages({
    page,
    userId: user._id as string,
  })

  return (
    <>
      <Header title="Profile" />
      <section className="profile">
        <div className="profile-balance">
          <p className="p-14-medium md:p-16-medium uppercase">Credits Available</p>
          <div className="mt-4 flex items-center gap-4">
            <Image
              src="/assets/icons/coins.svg"
              alt="coins"
              width={50}
              height={50}
              className="size-9 md:size-12"
            />
            <h2 className="h2-bold text-dark-600">{user.creditBalance}</h2>
          </div>
        </div>

        <div className="profile-image-manipulation">
          <p className="p-14-medium md:p-16-medium uppercase">Image Manipulation Done</p>
          <div className="mt-4 flex items-center gap-4">
            <Image
              src="/assets/icons/photo.svg"
              alt="photo"
              width={50}
              height={50}
              className="size-9 md:size-12"
            />
            {images && images.data?.length > 0 ? (
              <h2 className="h2-bold text-dark-600">{images.data.length}</h2>
            ) : (
              <p className="p-14-medium text-dark-600">No images found</p>
            )}
          </div>
        </div>
      </section>

      {images && images.data?.length > 0 && (
        <section className="mt-8 md:mt-14">
          <Collection images={images.data} totalPages={images.totalPages} page={page} />
        </section>
      )}
    </>
  )
}

export default ProfilePage
