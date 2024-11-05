import Link from 'next/link'

const NotFound = () => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
      <h1 className="h1-semibold text-dark-500">404 | Not Found</h1>
      <p>Ooops, The Page You are looking for doesn&apos;t exist.</p>
      <Link
        href={'/'}
        prefetch={true}
        className="button bg-purple-100 transition-colors hover:bg-purple-200"
      >
        Return to PixelMind
      </Link>
    </div>
  )
}

export default NotFound
