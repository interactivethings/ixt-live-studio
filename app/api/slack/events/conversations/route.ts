import { verifySlackRequest } from '@/server/security';
import { newError } from '@/utils/error-handling';
import { NextRequest, NextResponse } from 'next/server';

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

    if (type === 'url_verification') {
      return NextResponse.json({ challenge });
    }

    if (type === 'url_verification') {
      return NextResponse.json({ challenge });
    }

    if (type === 'event_callback' && event?.type === 'message') {
      console.log('New message:', event.text);

      return NextResponse.json({ status: 'Message stored successfully' });
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
