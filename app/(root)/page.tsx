import { UserButton } from '@clerk/nextjs'

const Home = () => {
  return (
    <div className="text-2xl text-purple-500">
      <p>Home</p>

      <UserButton afterSignOutUrl='/' />
    </div>
  )
}

export default Home
