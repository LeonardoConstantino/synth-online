import * as Tone from 'tone';

let isReady = false;

/**
 * Ensures Tone.js AudioContext is resumed after a user gesture.
 * Sets lookAhead to 0.01 (10ms) for low-latency performance as specified.
 */
export async function startAudioContext(): Promise<boolean> {
  if (isReady && Tone.getContext().state === 'running') {
    return true;
  }

  try {
    await Tone.start();
    // Low lookahead for tight responsive keyboard latency
    Tone.getContext().lookAhead = 0.01;
    isReady = Tone.getContext().state === 'running';
    return isReady;
  } catch (err) {
    console.error('Failed to start AudioContext:', err);
    return false;
  }
}

export function isAudioReady(): boolean {
  return Tone.getContext().state === 'running';
}

export function getAudioContextState(): AudioContextState {
  return Tone.getContext().state;
}
