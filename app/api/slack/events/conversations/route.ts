import { initializeFirebase } from '@/server/firebase/server';
import { getFirebaseUser } from '@/server/firebase/utils';
import { verifySlackRequest } from '@/server/security';
import { newError } from '@/utils/error-handling';
import admin from 'firebase-admin';
import { NextRequest, NextResponse } from 'next/server';
import * as emoji from 'node-emoji';

export const POST = async (req: NextRequest) => {
  try {
    const rawBody = await req.text();

    if (!verifySlackRequest(rawBody, req)) {
      return NextResponse.json(
        { error: 'Invalid Slack signature' },
        { status: 400 }
      );
    }

    const body = JSON.parse(rawBody);
    const { type, challenge, event } = body;

    // URL verification for Slack API
    if (type === 'url_verification') {
      return NextResponse.json({ challenge });
    }

    initializeFirebase();
    const db = admin.database();

    // Handle Slack reaction events
    if (type === 'event_callback' && event?.type === 'reaction_added') {
      console.log(event);
      const userRef = db.ref(
        `data/team-communication/sensor-1/value/${event.user}`
      );

      // Fetch existing user data
      const snapshot = await userRef.once('value');
      const userData = snapshot.val();

      if (userData) {
        // Update the last reaction timestamp
        const reactionEmoji = emoji.get(event.reaction) || '❌';
        await userRef.update({
          ...userData,
          reactions: userData.reactions ? userData.reactions + 1 : 1,
          lastReaction: reactionEmoji,
        });
      }

      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Ensure that event.user and event.channel are valid
    if (
      !event?.user ||
      !event?.channel ||
      typeof event.user !== 'string' ||
      typeof event.channel !== 'string'
    ) {
      return NextResponse.json(
        { error: 'Invalid user or channel information' },
        { status: 400 }
      );
    }

    // Handle Slack message events
    if (type === 'event_callback' && event?.type === 'message') {
      const user = await getFirebaseUser(event.user);
      const userRef = db.ref(
        `data/team-communication/sensor-1/value/${event.user}`
      );

      // Fetch existing user data
      const snapshot = await userRef.once('value');
      const userData = snapshot.val();

      if (userData) {
        // Update the existing user data
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
    }

    return new Response(
      JSON.stringify({
        success: true,
      }),
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      const errObj = newError({
        title: error.name,
        message: error.message,
      });

      console.log(errObj);

      return new Response(JSON.stringify({ success: false, errObj }), {
        status: 400,
      });
    }
  }
};
