export interface SlackEvent {
  reaction_added: ReactionAddedEvent;
  message: MessageEvent;
}

export interface SlackEventBody {
  type: 'event_callback';
  token: string;
  team_id: string;
  api_app_id: string;
  event: SlackEvent[keyof SlackEvent];
  event_context: string;
  event_id: string;
  event_time: string;
  authorizations: [
    {
      enterprise_id: string;
      team_id: string;
      user_id: string;
      is_bot: boolean;
      is_enterprise_install: boolean;
    }
  ];
  is_ext_shared_channel: boolean;
  context_team_id: string;
  context_enterprise_id: null | string;
}

export interface ReactionAddedEvent {
  type: 'reaction_added';
  user: string;
  reaction: string;
  item_user: string;
  item: {
    type: 'message';
    channel: string;
    ts: string;
  };
  event_ts: string;
}

export interface MessageEvent {
  type: 'message';
  channel: string;
  user: string;
  text: string;
  ts: string;
}
