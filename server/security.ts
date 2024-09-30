import { createError } from '@/utils/error-handling';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export const verifySlackRequest = (
  rawBody: string,
  req: NextRequest
): boolean => {
  const slackSigningSecret = process.env.SLACK_SIGNITURE_SECRET;
  const timestamp = req.headers.get('x-slack-request-timestamp');
  const slackSignature = req.headers.get('x-slack-signature');

  const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 60 * 5;
  if (!timestamp || parseInt(timestamp) < fiveMinutesAgo) return false;

  const sigBaseString = `v0:${timestamp}:${rawBody}`;
  const hmac = crypto.createHmac('sha256', slackSigningSecret || '');
  const calculatedSignature = `v0=${hmac.update(sigBaseString).digest('hex')}`;

  return !!(
    slackSignature &&
    crypto.timingSafeEqual(
      Buffer.from(calculatedSignature, 'utf8'),
      Buffer.from(slackSignature, 'utf8')
    )
  );
};

export const validateWebhookEntry = async (req: NextRequest) => {
  const rawBody = await req.text();

  if (!verifySlackRequest(rawBody, req)) {
    throw createError({
      title: 'Invalid Slack signature',
      message: 'The request signature is invalid',
    });
  }

  const body = JSON.parse(rawBody);
  const { type, challenge } = body;

  // URL verification for Slack API
  if (type === 'url_verification') {
    return NextResponse.json({ challenge });
  }
};
