/**
 * Probe whether the browser can actually create a WebGL context. Returns false
 * when hardware acceleration is off, the GPU is blocklisted, or WebGL is
 * disabled — letting us render a 2D fallback instead of crashing.
 */
export function isWebGLAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    return Boolean(gl);
  } catch {
    return false;
  }
}
