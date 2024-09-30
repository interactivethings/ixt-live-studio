import {
  updateSlackMessage,
  updateSlackReaction,
  validateMessageSlackEvent,
  validateReactionSlackEvent,
} from '@/server/slack/syncs';
import { initializeFirebase } from '@/server/firebase/server';
import { validateWebhookEntry } from '@/server/security';
import { NextRequest } from 'next/server';

export const POST = async (req: NextRequest) => {
  try {
    await validateWebhookEntry(req);

    const rawBody = await req.text();

    const body = JSON.parse(rawBody);
    const { type, event } = body;

    initializeFirebase();

    // Handle Slack reaction events
    if (type === 'event_callback' && event?.type === 'reaction_added') {
      validateReactionSlackEvent(event);
      await updateSlackReaction(event);
    }

    if (type === 'event_callback' && event?.type === 'message') {
      validateMessageSlackEvent(event);
      await updateSlackMessage(event);
    }

    return new Response(
      JSON.stringify({
        success: true,
      }),
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      return new Response(JSON.stringify({ success: false, error }), {
        status: 400,
      });
    }
  }
};
