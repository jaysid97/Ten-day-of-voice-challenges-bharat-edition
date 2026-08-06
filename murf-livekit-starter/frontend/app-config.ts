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
  companyName: 'IndicVox AI',
  pageTitle: 'IndicVox AI — Bharat Voice AI Edition',
  pageDescription: 'Next-Gen Voice Intelligence for Bharat — Powered by Gemini 3.5 & Murf Falcon TTS',

  supportsChatInput: true,
  supportsVideoInput: true,
  supportsScreenShare: true,
  isPreConnectBufferEnabled: true,

  logo: '/murf-logo.svg',
  accent: '#FF9933',
  logoDark: '/murf-logo-dark.svg',
  accentDark: '#00E5FF',
  startButtonText: 'Start IndicVox AI',

  // Audio visualization setup: Glowing Aura with Cyber Saffron/Cyan
  audioVisualizerType: 'aura',
  audioVisualizerColor: '#FF9933',
  audioVisualizerColorDark: '#00E5FF',
  audioVisualizerColorShift: 0.4,

  // agent dispatch configuration
  agentName: process.env.AGENT_NAME ?? 'IndicVox',

  // LiveKit Cloud Sandbox configuration
  sandboxId: undefined,
};
