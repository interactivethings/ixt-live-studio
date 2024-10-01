import { initializeFirebase } from '@/server/firebase/server';
import { verifySlackRequest } from '@/server/security';
import {
  updateSlackMessage,
  updateSlackReaction,
  validateMessageSlackEvent,
  validateReactionSlackEvent,
} from '@/server/slack/syncs';
import { createError } from '@/utils/error-handling';
import { NextRequest, NextResponse } from 'next/server';

export const POST = async (req: NextRequest) => {
  try {
    const rawBody = await req.text();

    if (!verifySlackRequest(rawBody, req)) {
      throw createError({
        title: 'Invalid Slack signature',
        message: 'The request signature is invalid',
      });
    }

    const body = JSON.parse(rawBody);
    const { type, challenge, event } = body;

    // URL verification for Slack API
    if (type === 'url_verification') {
      return NextResponse.json({ challenge });
    }

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
      console.log(error.message);

      return new Response(JSON.stringify({ success: false, error }), {
        status: 400,
      });
    }
  }
};
