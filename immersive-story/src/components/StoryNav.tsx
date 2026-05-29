export function StoryNav({
  onAboutClick,
}: {
  onAboutClick: () => void;
}) {
  return (
    <header className="story-nav">
      <div>
        <span className="dot" /> Live · Camp Nou
      </div>
      <nav className="flex items-center gap-5">
        <button
          type="button"
          onClick={onAboutClick}
          className="hover:text-bone transition-colors"
          aria-label="Open about — technologies"
        >
          About
        </button>
        <a
          href="https://github.com/YuraTadevosyan/three-js-and-animations"
          target="_blank"
          rel="noopener noreferrer"
        >
          Source ↗
        </a>
      </nav>
    </header>
  );
}
