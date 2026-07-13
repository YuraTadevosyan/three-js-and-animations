// KUTE.js entry for the lab.
//
// The prebuilt default bundle (`kute.js`) ships only the CSS/core components — the
// SVG plugins we want (path morph, stroke draw, SVG transform) live in the "extra"
// source entry. We import that directly; it registers the SVG components on the
// shared KUTE instance. The deep entry has no bundled type declarations, hence the
// single suppression + the minimal typing below.
//
// Note: KUTE 2.2.x imports *named* exports from svg-path-commander, which 2.2.x
// dropped — package.json pins that dep to 2.1.11 via `overrides` so the ESM build
// resolves. If morph/draw ever breaks after an install, check that pin first.
// @ts-expect-error - KUTE ships no types for the src/index-extra entry point
import KUTE from 'kute.js/src/index-extra.js'

export interface KuteTween {
  start: (time?: number) => KuteTween
  stop: () => KuteTween
  pause: () => KuteTween
  resume: () => KuteTween
}

type Target = Element | string
/** The `all*` methods build one tween per element (a TweenCollection). */
type Targets = ArrayLike<Element> | string
type Props = Record<string, unknown>
type Options = Record<string, unknown>

export interface KuteStatic {
  fromTo: (el: Target, from: Props, to: Props, options?: Options) => KuteTween
  to: (el: Target, to: Props, options?: Options) => KuteTween
  allFromTo: (els: Targets, from: Props, to: Props, options?: Options) => KuteTween
  allTo: (els: Targets, to: Props, options?: Options) => KuteTween
}

export default KUTE as KuteStatic
