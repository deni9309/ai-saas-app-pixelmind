import { Circle } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center gap-4 text-dark-400">
      Loading
      <Circle size={5} className="animate-ping text-purple-400/50 duration-700" />
      <Circle size={10} className="animate-ping text-purple-500/50 duration-700" />
      <Circle size={20} className="animate-ping text-purple-600/50 duration-700" />
    </div>
  )
}
