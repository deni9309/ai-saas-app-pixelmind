'use client'

import { CldImage } from 'next-cloudinary'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next-nprogress-bar'

import { Button } from '@/components/ui/button'
import {
  Pagination,
  PaginationContent,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { TooltipProvider, TooltipTrigger, Tooltip, TooltipContent } from '@/components/ui/tooltip'
import Search from '@/components/shared/search'
import { transformationTypes } from '@/constants'
import { IImage } from '@/lib/database/models/image.model'
import { formUrlQuery } from '@/lib/utils'

export const Collection = ({
  images,
  totalPages = 1,
  page,
  hasSearch = false,
}: {
  images: IImage[]
  totalPages?: number
  page: number
  hasSearch?: boolean
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const onPageChange = (action: 'prev' | 'next') => {
    const pageValue = action === 'next' ? Number(page) + 1 : Number(page) - 1

    const newUrl = formUrlQuery({
      searchParams: searchParams.toString(),
      key: 'page',
      value: pageValue,
    })

    router.push(newUrl, { scroll: false }, { showProgressBar: true })
  }

  return (
    <>
      <div className="collection-heading">
        <h2 className="h2-bold text-dark-600">Recent Edits</h2>

        {hasSearch && <Search />}
      </div>

      {images.length > 0 ? (
        <ul className="collection-list">
          {images.map((image) => (
            <Card image={image} key={image.publicId} />
          ))}
        </ul>
      ) : (
        <div className="collection-empty">
          <p className="p-20-semibold">No images found.</p>
        </div>
      )}

      {totalPages > 1 && (
        <Pagination className="mt-10">
          <PaginationContent className="flex w-full">
            <Button
              onClick={() => onPageChange('prev')}
              disabled={Number(page) <= 1}
              className="collection-btn"
            >
              <PaginationPrevious className="hover:text-wite hover:bg-transparent" />
            </Button>

            <p className="flex-center p-16-medium w-fit flex-1">
              {page} / {totalPages}
            </p>

            <Button
              onClick={() => onPageChange('next')}
              disabled={Number(page) >= totalPages}
              className="button w-32 bg-purple-gradient bg-cover text-white"
            >
              <PaginationNext className="hover:text-wite hover:bg-transparent" />
            </Button>
          </PaginationContent>
        </Pagination>
      )}
    </>
  )
}

const Card = ({ image }: { image: IImage }) => {
  return (
    <li>
      <Link prefetch={true} href={`/transformations/${image._id}`} className="collection-card">
        <CldImage
          src={image.publicId}
          alt={image.title}
          width={image.width}
          height={image.height}
          {...image.config}
          loading="lazy"
          className="h-52 w-full rounded-[10px] object-cover"
          sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
        />
        <div className="flex-between">
          <p className="p-20-semibold mr-3 line-clamp-1 text-dark-600">{image.title}</p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Image
                  src={`/assets/icons/${transformationTypes[image.transformationType as TransformationTypeKey].icon}`}
                  alt={image.title}
                  width={24}
                  height={24}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm capitalize text-dark-400">
                  {transformationTypes[image.transformationType as TransformationTypeKey].title}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </Link>
    </li>
  )
}
