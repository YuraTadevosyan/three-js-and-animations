import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CopyCodeButton, SourceCode } from '@/components/SourceCode'

interface AnimationPageProps {
  title: string
  description: string
  tags: string[]
  sourceCode?: string
  filename?: string
  children: ReactNode
}

export function AnimationPage({
  title,
  description,
  tags,
  sourceCode,
  filename,
  children,
}: AnimationPageProps) {
  return (
    <div className="container py-8 sm:py-12">
      <div className="mb-8 flex flex-col gap-4">
        <Link
          to="/animations"
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'sm' }),
            'self-start',
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          All animations
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full border bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {title}
            </h1>
            <p className="max-w-2xl text-muted-foreground">{description}</p>
          </div>
          {sourceCode && (
            <div className="shrink-0">
              <CopyCodeButton code={sourceCode} label="Copy source" />
            </div>
          )}
        </div>
      </div>

      {children}

      {sourceCode && <SourceCode code={sourceCode} filename={filename} />}
    </div>
  )
}
