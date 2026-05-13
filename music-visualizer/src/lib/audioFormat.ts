// Minimal AudioBuffer → 16-bit PCM WAV encoder. No deps.
export function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const samples = buffer.length;
  const byteLength = 44 + samples * numChannels * 2;
  const ab = new ArrayBuffer(byteLength);
  const view = new DataView(ab);

  let pos = 0;
  const writeStr = (s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(pos++, s.charCodeAt(i));
  };
  const writeUint32 = (v: number) => {
    view.setUint32(pos, v, true);
    pos += 4;
  };
  const writeUint16 = (v: number) => {
    view.setUint16(pos, v, true);
    pos += 2;
  };

  writeStr('RIFF');
  writeUint32(byteLength - 8);
  writeStr('WAVE');
  writeStr('fmt ');
  writeUint32(16);
  writeUint16(1); // PCM
  writeUint16(numChannels);
  writeUint32(sampleRate);
  writeUint32(sampleRate * numChannels * 2);
  writeUint16(numChannels * 2);
  writeUint16(16);
  writeStr('data');
  writeUint32(samples * numChannels * 2);

  const channels: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) channels.push(buffer.getChannelData(c));

  for (let i = 0; i < samples; i++) {
    for (let c = 0; c < numChannels; c++) {
      let s = Math.max(-1, Math.min(1, channels[c][i]));
      s = s < 0 ? s * 0x8000 : s * 0x7fff;
      view.setInt16(pos, s, true);
      pos += 2;
    }
  }

  return new Blob([ab], { type: 'audio/wav' });
}
