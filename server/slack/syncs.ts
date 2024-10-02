import { getFirebaseUser } from '@/server/firebase/utils';
import { MessageEvent, ReactionAddedEvent } from '@/types/event';
import { createError } from '@/utils/error-handling';
import admin from 'firebase-admin';
import * as emoji from 'node-emoji';

export const validateMessageSlackEvent = (event: MessageEvent) => {
  if (
    !event?.user ||
    !event?.channel ||
    event?.type !== 'message' ||
    typeof event.user !== 'string' ||
    typeof event.channel !== 'string' ||
    typeof event.text !== 'string'
  ) {
    console.log(event);
    throw createError({
      title: 'Invalid Slack event',
      message: 'Event user or channel is invalid',
      cause: 'Slack',
    });
  }
};

export const validateReactionSlackEvent = (event: ReactionAddedEvent) => {
  if (
    !event?.user ||
    !event?.reaction ||
    !event?.item?.channel ||
    event?.type !== 'reaction_added' ||
    typeof event.user !== 'string' ||
    typeof event.reaction !== 'string' ||
    typeof event.item.channel !== 'string'
  ) {
    console.log(event);
    throw createError({
      title: 'Invalid Slack event',
      message: 'Event user, reaction, or channel is invalid',
      cause: 'Slack',
    });
  }
};

export const updateSlackReaction = async (event: ReactionAddedEvent) => {
  const db = admin.database();
  const userRef = db.ref(
    `data/team-communication/sensors/slack/value/${event.user}`
  );

  const snapshot = await userRef.once('value');
  const userData = snapshot.val();

  if (userData) {
    const reactionEmoji = emoji.get(event.reaction) || '❌';
    await userRef.update({
      ...userData,
      reactions: userData.reactions ? userData.reactions + 1 : 1,
      lastReaction: reactionEmoji,
    });
  }
};

export const updateSlackMessage = async (event: MessageEvent) => {
  const user = await getFirebaseUser(event.user);
  const db = admin.database();
  const userRef = db.ref(
    `data/team-communication/sensors/slack/value/${event.user}`
  );

  const snapshot = await userRef.once('value');
  const userData = snapshot.val();

  if (userData) {
    await userRef.update({
      ...userData,
      color: user.color,
      messages: userData.messages + 1,
      characters: userData.characters + event.text.length,
      lastMessage: Date.now(),
    });

    const connectionRef = userRef.child('connections');
    const existingConnection = userData.connections?.[event.channel];

    if (existingConnection) {
      await connectionRef.child(event.channel).update({
        messages: existingConnection.messages + 1,
        characters: existingConnection.characters + event.text.length,
      });
    } else {
      await connectionRef.child(event.channel).set({
        messages: 1,
        characters: event.text.length,
      });
    }
  } else {
    if (user) {
      await userRef.set({
        ...user,
        messages: 1,
        characters: event.text.length,
        lastMessage: Date.now(),
        connections: {
          [event.channel]: {
            messages: 1,
            characters: event.text.length,
          },
        },
      });
    }
  }
};
