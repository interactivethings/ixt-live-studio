//Team Communication
export interface TeamCommunicationData {
    [key: string]: TeamMember;
  }
  
  export interface TeamMember {
    id: string;
    characters: number;
    messages: number;
    name: string;
    color: string;
    lastMessage: number;
    lastReaction: string;
    reactions: number;
    connections: {
      [key: string]: {
        messages: number;
        characters: number;
      };
    };
  }

  export type TeamCommunicationRecordTypes = 'most-messages-characters' | 'most-reactions' | 'least-messages-characters' | 'least-reactions' | 'most-connections' 
  export type TeamCommunicationRecord = {
    type: TeamCommunicationRecordTypes;
  } & TeamMember
