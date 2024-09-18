export type DisplayType = 'noice' | 'team-communication' | 'luminance';

export type MetricTypes = {
  'team-communication': {
    name: string;
    characters: number;
    messages: number;
    lastMessage: number;
    color: string;
    connections: {
      [key: string]: {
        messages: number;
        characters: number;
      };
    };
  };
};

export type MetricForDisplayType<T extends keyof MetricTypes> = MetricTypes[T];
