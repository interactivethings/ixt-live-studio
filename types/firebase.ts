import { DisplayType } from "./display-types"
export type ConfigType = 'ANALOG' | 'DIGITAL';

export interface Metric {
    id: DisplayType;
    config: Config
}

export interface Config {
    type: ConfigType
}