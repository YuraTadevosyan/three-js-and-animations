export function Footer() {
  return (
    <footer className="border-t border-border/40 py-6 text-sm text-muted-foreground">
      <div className="container flex flex-col items-center justify-between gap-2 md:flex-row">
        <p>
          Built with React, Three.js, TanStack Router/Query, Tailwind, and
          shadcn/ui.
        </p>
        <p>© {new Date().getFullYear()} three-webgl-showcase</p>
      </div>
    </footer>
  );
}
