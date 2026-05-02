import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function NotFound() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-5xl font-bold tracking-tight">404</h1>
      <p className="text-muted-foreground">
        That page didn't make it past the timeline.
      </p>
      <Link to="/" className={cn(buttonVariants())}>
        Back home
      </Link>
    </div>
  )
}
