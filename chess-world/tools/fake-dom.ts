/** The smallest DOM the engine, the board texture and the input layer need. */
export function makeCanvas(): HTMLCanvasElement {
  const canvas = {
    width: 1280,
    height: 720,
    clientWidth: 1280,
    clientHeight: 720,
    style: {} as CSSStyleDeclaration,
    parentElement: { clientWidth: 1280, clientHeight: 720 },
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720, right: 1280, bottom: 720 }),
    getContext: () => make2d(),
    addEventListener: () => {},
    removeEventListener: () => {},
    setPointerCapture: () => {},
    releasePointerCapture: () => {},
    hasPointerCapture: () => false,
  }
  return canvas as unknown as HTMLCanvasElement
}

function make2d(): CanvasRenderingContext2D {
  const noop = () => {}
  return {
    fillRect: noop, strokeRect: noop, beginPath: noop, moveTo: noop, lineTo: noop, stroke: noop,
    fill: noop, arc: noop, save: noop, restore: noop, translate: noop, scale: noop, rotate: noop,
    clearRect: noop, drawImage: noop, putImageData: noop,
    createRadialGradient: () => ({ addColorStop: noop }),
    createLinearGradient: () => ({ addColorStop: noop }),
    getImageData: () => ({ data: new Uint8ClampedArray(4) }),
    canvas: { width: 512, height: 512 },
    fillStyle: '', strokeStyle: '', lineWidth: 1, globalCompositeOperation: 'source-over',
  } as unknown as CanvasRenderingContext2D
}

export function installFakeDom(): void {
  const globals = globalThis as Record<string, unknown>
  globals.window = {
    devicePixelRatio: 1,
    innerWidth: 1280,
    innerHeight: 720,
    addEventListener: () => {},
    removeEventListener: () => {},
    AudioContext: undefined,
  }
  globals.document = { createElement: () => makeCanvas(), addEventListener: () => {}, removeEventListener: () => {} }
  globals.ResizeObserver = class {
    observe(): void {}
    disconnect(): void {}
  }
  globals.requestAnimationFrame = () => 0
  globals.cancelAnimationFrame = () => {}
}
