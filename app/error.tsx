'use client'

import Link from 'next/link'

export default function Error({ error }: { error?: Error }) {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
      <h1 className="h1-semibold text-dark-500">{error?.name ?? 'Oops, Error!'}</h1>
      <p>{error?.message ?? 'No wories, though! Just click the button below and try again.'}</p>
      <Link
        href={'/'}
        prefetch={true}
        className="button bg-purple-100 transition-colors hover:bg-purple-200"
      >
        Back to PixelMind
      </Link>
    </div>
  )
}
