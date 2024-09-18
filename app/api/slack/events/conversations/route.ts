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

    // URL verification for Slack API
    if (type === 'url_verification') {
      return NextResponse.json({ challenge });
    }

    // Handle Slack message events
    if (type === 'event_callback' && event?.type === 'message') {
      //   const user = await getFirebaseUser(event.user);

      //   const db = admin.database();
      //   const ref = db.ref('data/team-communication/sensor-1/value');

      //   const snapshot = await ref.child(event.user).once('value');
      //   if (snapshot.exists()) {

      //     const data = snapshot.val();

      //     await ref.child(event.user).update({
      //       ...data,
      //       messages: data.messages + 1,
      //       characters: data.characters + event.text.length,
      //       lastMessage: Date.now(),
      //       connections: {

      //       }
      //     });
      //   } else {
      //     await ref.child(event.user).set({
      //       ...user,
      //       characters: event.text.length,
      //       messages: 1,
      //       lastMessage: Date.now(),
      //       connections: {

      //       }
      //     });
      //   }
      console.log(body);
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
