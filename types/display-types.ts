export type DisplayType = 'noice' | 'team-communication' | 'luminance';

export type MetricTypes = {
  'team-communication': {
    [key: `member-${number}`]: {
      name: string;
      characters: number;
      messages: number;
      lastMessage: number;
      connections: {
        [key: string]: {
          messages: number;
          characters: number;
        };
      };
    };
  };
};

export type MetricForDisplayType<T extends keyof MetricTypes> = MetricTypes[T];
