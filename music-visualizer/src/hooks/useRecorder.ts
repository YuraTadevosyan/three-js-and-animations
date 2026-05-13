import { useCallback, useEffect, useRef, useState } from 'react';

const MIME_CANDIDATES = [
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm',
  'video/mp4',
];

function pickMimeType(): string {
  if (typeof MediaRecorder === 'undefined') return '';
  for (const mt of MIME_CANDIDATES) {
    if (MediaRecorder.isTypeSupported(mt)) return mt;
  }
  return '';
}

function extensionFor(mime: string): string {
  return mime.includes('mp4') ? 'mp4' : 'webm';
}

interface UseRecorder {
  isRecording: boolean;
  elapsedMs: number;
  supported: boolean;
  start: (canvas: HTMLCanvasElement, audioStream: MediaStream | null) => void;
  stop: () => void;
}

export function useRecorder(): UseRecorder {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef(0);
  const tickRef = useRef<number | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [supported] = useState(() => pickMimeType() !== '');

  const stop = useCallback(() => {
    const rec = recorderRef.current;
    if (!rec) return;
    if (rec.state !== 'inactive') rec.stop();
  }, []);

  const start = useCallback(
    (canvas: HTMLCanvasElement, audioStream: MediaStream | null) => {
      const mimeType = pickMimeType();
      if (!mimeType) return;

      const canvasStream = canvas.captureStream(60);
      const tracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];
      if (audioStream) tracks.push(...audioStream.getAudioTracks());
      const combined = new MediaStream(tracks);

      const recorder = new MediaRecorder(combined, {
        mimeType,
        videoBitsPerSecond: 6_000_000,
      });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        chunksRef.current = [];
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `visualizer-${Date.now()}.${extensionFor(mimeType)}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);

        recorderRef.current = null;
        setIsRecording(false);
        setElapsedMs(0);
        if (tickRef.current !== null) {
          window.clearInterval(tickRef.current);
          tickRef.current = null;
        }
      };

      recorder.start(250);
      recorderRef.current = recorder;
      startTimeRef.current = performance.now();
      setIsRecording(true);
      setElapsedMs(0);
      tickRef.current = window.setInterval(() => {
        setElapsedMs(performance.now() - startTimeRef.current);
      }, 200);
    },
    [],
  );

  useEffect(() => {
    return () => {
      if (tickRef.current !== null) window.clearInterval(tickRef.current);
      const rec = recorderRef.current;
      if (rec && rec.state !== 'inactive') rec.stop();
    };
  }, []);

  return { isRecording, elapsedMs, supported, start, stop };
}
