import { TeamCommunicationData } from './team-activity';

//General Modular Types across all visualizations
export type ConfigType = 'ANALOG' | 'DIGITAL';
export type DisplayType = keyof DisplayDataType;

export interface Metric<T extends keyof Views> {
  id: keyof DisplayDataType;
  config: Config;
  views: Views[T];
  settings: Settings;
}

export interface Settings {
  view_time: number;
}

export interface Views {
  'team-communication': View[];
  'noise-levels': View[];
}

export interface View {
  view: string;
  icon: string;
}
export interface Config {
  type: ConfigType;
  defaults: {
    [key: string]: number | [number, number];
  };
}

export interface User {
  name: string;
  color: string;
}

export interface DisplayDataType {
  'team-communication': DisplayDataBase<TeamCommunicationData>;
  'noise-levels': DisplayDataBase<NoiseLevelsData>;
}

export interface DisplayDataBase<T> {
  title: string;
  description: string;
  sensors: {
    [key: `sensor-${number}`]: {
      title: string;
      value: T;
    };
  };
}

//noise-levels
export interface NoiseLevelsData {
  db: number;
}
