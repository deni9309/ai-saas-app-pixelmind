import { auth } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'

import Header from '@/components/shared/header'
import TransformedImage from '@/components/shared/transformed-image'
import { Button } from '@/components/ui/button'
import { getImageById } from '@/lib/actions/image.actions'
import { getImageSize } from '@/lib/utils'
import { redirect } from 'next/navigation'
import DeleteConfirmation from '@/components/shared/delete-confirmation'

const ImageDetailsPage = async ({ params: { id } }: SearchParamProps) => {
  const { userId } = auth()

  const image = await getImageById(id)
  if (!image) redirect('/')

  return (
    <>
      <Header title={image.title} />
      <section className="mt-5 flex flex-wrap gap-4">
        <div className="p-14-medium md:p-16-medium flex gap-2">
          <p className="text-dark-600">Transformation:</p>
          <p className="capitalize text-purple-400">{image.transformationType}</p>
        </div>

        {image.prompt && (
          <>
            <p className="hidden text-dark-400/50 md:block">&#x25CF;</p>
            <div className="p-14-medium md:p-16-medium flex gap-2">
              <p className="text-dark-600">Prompt:</p>
              <p className="capitalize text-purple-400">{image.prompt}</p>
            </div>
          </>
        )}

        {image.color && (
          <>
            <p className="hidden text-dark-400/50 md:block">&#x25CF;</p>
            <div className="p-14-medium md:p-16-medium flex gap-2">
              <p className="text-dark-600">Color:</p>
              <p className="capitalize text-purple-400">{image.color}</p>
            </div>
          </>
        )}

        {image.aspectRatio && (
          <>
            <p className="hidden text-dark-400/50 md:block">&#x25CF;</p>
            <div className="p-14-medium md:p-16-medium flex gap-2">
              <p className="text-dark-600">Aspect Ratio:</p>
              <p className="capitalize text-purple-400">{image.aspectRatio}</p>
            </div>
          </>
        )}
      </section>

      <section className="mt-10 border-t border-dark-400/25">
        <div className="transformation-grid">
          {/* Media Uploader */}
          <div className="flex flex-col gap-4">
            <h3 className="h3-bold text-dark-600">Original</h3>
            <Image
              width={getImageSize(image.transformationType, image, 'width')}
              height={getImageSize(image.transformationType, image, 'height')}
              src={image.secureUrl}
              alt={image.title}
              className="transformation-original_image"
            />
          </div>

          {/* Transformed Image */}
          <TransformedImage
            image={image}
            type={image.transformationType}
            title={image.title}
            transformationConfig={image.config ?? null}
            hasDownload={true}
            isTransforming={false}
          />
        </div>

        {userId && userId === image.author.clerkId && (
          <div className="mt-4 space-y-4">
            <Button asChild type="button" className="submit-button capitalize">
              <Link prefetch={true} href={`/transformations/${image._id}/update`}>
                Edit Image
              </Link>
            </Button>

            <DeleteConfirmation imageId={image._id as string} />
          </div>
        )}
      </section>
    </>
  )
}

export default ImageDetailsPage
