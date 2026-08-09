/**
 * AI Warning Label dataset, typed loader over labels.json.
 * Edit labels.json (directly or via /admin CMS); this file only provides types.
 *
 * Geometry/color semantics:
 *   diamond/red    = acute hazard          triangle/yellow = warning
 *   circle/blue    = mandatory safeguard   square/green    = certified safe
 *   placard/orange = deployment risk class
 */
import data from './labels.json';

export type LabelShape = 'diamond' | 'triangle' | 'circle' | 'square' | 'placard';

export interface WarningLabel {
  id: string;
  name: string;
  shape: LabelShape;
  icon: string;
  domain: string;
  hazardClass: string;
  statement: string;
  precaution: string;
  sourceSymbol: string;
}

export interface TransparencyPanel {
  modelClass: string;
  trainingDataDisclosed: string;
  evalCoverage: number;
  humanOversight: string;
  explainability: string;
  biasAudit: string;
}

export interface LabelSet {
  id: string;
  product: string;
  deploymentClass: number;
  trafficLight: string;
  labels: string[];
  panel: TransparencyPanel;
  certs: string[];
}

export const LABELS = data.labels as WarningLabel[];
export const LABEL_SETS = data.labelSets as LabelSet[];
