import { NoiseLevelsData, TeamMember } from './firebase';

export interface FormtattedDataBaseType {
  'team-communication': FormattedDataBase<TeamMember[]>;
  'noise-levels': FormattedDataBase<NoiseLevelsData>;
}

export interface FormattedDataBase<T> {
  title: string;
  description: string;
  sensors: FormattedSensorBase<T>[];
}

export interface FormattedSensorBase<T> {
  title: string;
  value: T;
}
