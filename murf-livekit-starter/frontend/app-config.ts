export interface AppConfig {
  pageTitle: string;
  pageDescription: string;
  companyName: string;

  supportsChatInput: boolean;
  supportsVideoInput: boolean;
  supportsScreenShare: boolean;
  isPreConnectBufferEnabled: boolean;

  logo: string;
  startButtonText: string;
  accent?: string;
  logoDark?: string;
  accentDark?: string;

  audioVisualizerType?: 'bar' | 'wave' | 'grid' | 'radial' | 'aura';
  audioVisualizerColor?: `#${string}`;
  audioVisualizerColorDark?: `#${string}`;
  audioVisualizerColorShift?: number;
  audioVisualizerBarCount?: number;
  audioVisualizerGridRowCount?: number;
  audioVisualizerGridColumnCount?: number;
  audioVisualizerRadialBarCount?: number;
  audioVisualizerRadialRadius?: number;
  audioVisualizerWaveLineWidth?: number;

  // agent dispatch configuration
  agentName?: string;

  // LiveKit Cloud Sandbox configuration
  sandboxId?: string;
}

export const APP_CONFIG_DEFAULTS: AppConfig = {
  companyName: 'Bharat EdTech',
  pageTitle: 'Shiksha AI — Cyber-Bharat Learning & Literacy Companion',
  pageDescription: 'Empowering Indian Students with Ultra-Fast Voice AI & Guardrailed Learning — Powered by Murf Falcon TTS & Gemini',

  supportsChatInput: true,
  supportsVideoInput: true,
  supportsScreenShare: true,
  isPreConnectBufferEnabled: true,

  logo: '/murf-logo.svg',
  accent: '#FF9933',
  logoDark: '/murf-logo-dark.svg',
  accentDark: '#38BDF8',
  startButtonText: 'Start Voice Session with Shiksha AI',

  // Audio visualization setup: Glowing Aura with Saffron & Cyan Cyber Gradients
  audioVisualizerType: 'aura',
  audioVisualizerColor: '#FF9933',
  audioVisualizerColorDark: '#38BDF8',
  audioVisualizerColorShift: 0.4,

  // agent dispatch configuration
  agentName: process.env.AGENT_NAME ?? 'ShikshaAI',

  // LiveKit Cloud Sandbox configuration
  sandboxId: undefined,
};
