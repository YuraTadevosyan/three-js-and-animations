import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { CopyCodeButton, SourceCode } from '@/components/SourceCode';
import { SEO } from '@/components/seo/SEO';

interface ExamplePageProps {
  title: string;
  description: string;
  /** Description used for the SEO meta — defaults to `description`. */
  seoDescription?: string;
  path: string;
  tags: string[];
  sourceCode?: string;
  filename?: string;
  children: ReactNode;
}

export function ExamplePage({
  title,
  description,
  seoDescription,
  path,
  tags,
  sourceCode,
  filename,
  children,
}: ExamplePageProps) {
  return (
    <>
      <SEO title={title} description={seoDescription ?? description} path={path} />
      <article className="container py-8 sm:py-12">
        <div className="mb-8 flex flex-col gap-4">
          <Button asChild variant="ghost" size="sm" className="self-start -ml-3">
            <Link to="/examples">
              <ArrowLeft /> All examples
            </Link>
          </Button>

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
      </article>
    </>
  );
}
