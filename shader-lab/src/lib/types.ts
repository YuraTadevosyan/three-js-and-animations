import type { ComponentType } from 'react';

export type RangeControl = {
  type: 'range';
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
  unit?: string;
};

export type ToggleControl = {
  type: 'toggle';
  key: string;
  label: string;
  default: boolean;
};

export type ColorControl = {
  type: 'color';
  key: string;
  label: string;
  default: string;
};

export type ControlSpec = RangeControl | ToggleControl | ColorControl;

export type ParamValue = number | boolean | string;
export type Params = Record<string, ParamValue>;

export interface DemoComponentProps {
  params: Params;
  opacityRef: { current: number };
}

export interface DemoDef {
  id: string;
  name: string;
  tagline: string;
  accent: string;
  controls: ControlSpec[];
  Component: ComponentType<DemoComponentProps>;
  /** If true, uses orthographic full-screen rendering (2D fragment demos). */
  fullscreen?: boolean;
}
