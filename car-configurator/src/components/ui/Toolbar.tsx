import { Lightbulb, LightbulbOff, Rotate3d, Shuffle } from 'lucide-react';

import { beamSetting } from '@/lib/config';
import { useConfig } from '@/state/configStore';
import { IconButton } from './IconButton';

export function Toolbar() {
  const { beamMode, cycleBeam, autoSpin, toggleAutoSpin, randomize } = useConfig();
  const beam = beamSetting(beamMode);
  const beamOn = beamMode !== 'off';

  return (
    <div data-ui-enter="toolbar" className="flex items-center gap-2">
      <IconButton
        icon={beamOn ? <Lightbulb size={18} strokeWidth={2} /> : <LightbulbOff size={18} strokeWidth={2} />}
        label={`Headlights: ${beam.full}`}
        active={beamOn}
        onClick={cycleBeam}
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
