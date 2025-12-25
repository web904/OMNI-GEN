
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  LIVE = 'LIVE'
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface GeneratedAsset {
  id: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  prompt: string;
  timestamp: number;
}
