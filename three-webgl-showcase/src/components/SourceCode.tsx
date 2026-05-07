import { useState } from 'react';
import { Check, ChevronDown, Code2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SourceCodeProps {
  code: string;
  filename?: string;
}

export function CopyCodeButton({
  code,
  className,
  label = 'Copy',
}: {
  code: string;
  className?: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        const ta = document.createElement('textarea');
        ta.value = code;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignored
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onCopy}
      className={cn('gap-1.5', className)}
      aria-live="polite"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-emerald-500" />
          Copied
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          {label}
        </>
      )}
    </Button>
  );
}

export function SourceCode({ code, filename }: SourceCodeProps) {
  const [open, setOpen] = useState(false);

  return (
    <section className="mt-8 rounded-xl border bg-card">
      <header className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          aria-expanded={open}
        >
          <Code2 className="h-4 w-4" />
          <span>{filename ?? 'Source code'}</span>
          <ChevronDown
            className={cn('h-4 w-4 transition-transform', open && 'rotate-180')}
          />
        </button>
        <CopyCodeButton code={code} label="Copy code" />
      </header>
      {open && (
        <div className="max-h-[60vh] overflow-auto">
          <pre className="m-0 p-4 text-xs leading-relaxed">
            <code className="font-mono text-foreground/90">{code}</code>
          </pre>
        </div>
      )}
    </section>
  );
}
