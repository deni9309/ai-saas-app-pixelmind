import Image from 'next/image'
import Link from 'next/link'

import { Collection } from '@/components/shared/collection'
import { navLinks } from '@/constants'
import { getAllImages } from '@/lib/actions/image.actions'

const Home = async ({ searchParams }: SearchParamProps) => {
  const page = Number(searchParams?.page) || 1
  const searchQuery = (searchParams?.query as string) || ''

  const images = await getAllImages({ page, searchQuery })

  return (
    <>
      <section className="home">
        <h1 className="home-heading">Unlock limitless creativity with PixelMind</h1>
        <p className="home-heading_p">AI-powered image generation for visionary minds</p>

        <ul className="flex-center w-full gap-20">
          {navLinks.slice(1, 5).map((link) => (
            <Link
              key={link.route}
              href={link.route}
              prefetch={true}
              className="flex-center flex-col gap-1"
            >
              <li className="flex-center rounded-full bg-white p-3">
                <Image src={link.icon} alt={link.label} width={24} height={24} />
              </li>
              <p className="p-14-medium text-center text-white">{link.label}</p>
            </Link>
          ))}
        </ul>
      </section>

      <section className="sm:mt-12">
        <Collection
          hasSearch
          images={images?.data ?? []}
          totalPages={images?.totalPages}
          page={page}
        />
      </section>
    </>
  )
}

export default Home
