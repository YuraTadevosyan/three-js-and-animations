import { SplitText } from '@/components/SplitText';
import { SQUAD } from '@/data/squad';

export function SquadIntro() {
  return (
    <section
      className="chapter relative px-[6vw] py-[18vh] min-h-screen flex flex-col justify-center"
      data-chapter="1"
      aria-label="Squad intro"
    >
      <div className="stripe max-w-[120px] mb-10" />
      <span className="eyebrow block mb-6">01 — The Squad</span>
      <SplitText
        as="h2"
        splitBy="lines"
        stagger={0.1}
        duration={1.0}
        start="top 80%"
        className="display text-bone text-[clamp(3rem,8.5vw,9rem)] leading-[0.9] max-w-[18ch]"
        text={`THE\nFIRST\nTEAM.`}
      />
      <p className="mt-10 max-w-xl text-bone/70 leading-relaxed text-[1.05rem]">
        Scroll down. The {SQUAD.length}-man roster takes over the viewport one
        player at a time — photo on the left, name and notes on the right.
        Each card holds the screen for one scroll-length before the next
        slides in. Names and bios sourced from Wikipedia at the time of fetch.
      </p>
      <div className="mt-10 caption">
        {SQUAD.length} cards · scroll to advance
      </div>
    </section>
  );
}
