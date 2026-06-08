import { Lightbulb, Rotate3d, Shuffle } from 'lucide-react';

import { useConfig } from '@/state/configStore';
import { IconButton } from './IconButton';

export function Toolbar() {
  const { headlightsOn, toggleHeadlights, autoSpin, toggleAutoSpin, randomize } =
    useConfig();

  return (
    <div data-ui-enter="toolbar" className="flex items-center gap-2">
      <IconButton
        icon={<Lightbulb size={18} strokeWidth={2} />}
        label="Toggle headlights"
        active={headlightsOn}
        onClick={toggleHeadlights}
      />
      <IconButton
        icon={<Rotate3d size={18} strokeWidth={2} />}
        label="Toggle turntable"
        active={autoSpin}
        onClick={toggleAutoSpin}
      />
      <IconButton
        icon={<Shuffle size={18} strokeWidth={2} />}
        label="Randomize build"
        onClick={randomize}
      />
    </div>
  );
}
