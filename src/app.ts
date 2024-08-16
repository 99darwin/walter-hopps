import cron from "node-cron";
import neynarClient from "./neynarClient";
import {
  SIGNER_UUID,
  NEYNAR_API_KEY,
} from "./config";
import { isApiErrorResponse } from "@neynar/nodejs-sdk";
import { getMediaCasts, markReplySuccess, castToChannel } from './api';
import { ReactionType } from "@neynar/nodejs-sdk/build/neynar-api/neynar-v2-api";
import { castVibeFrame } from "./api/castVibeFrame";

const channels = [
  'https://warpcast.com/~/channel/art', 
  'https://warpcast.com/~/channel/ai-art',
  'https://warpcast.com/~/channel/cryptoart',
  'https://warpcast.com/~/channel/superrare',
  'https://warpcast.com/~/channel/foundation',
  'https://warpcast.com/~/channel/esoteric',
  'https://warpcast.com/~/channel/hard',
  'https://warpcast.com/~/channel/aesthetic',
  'https://warpcast.com/~/channel/travel',
  'https://warpcast.com/~/channel/mek',
  'https://warpcast.com/~/channel/itookaphoto',
  'https://warpcast.com/~/channel/photography',
  'https://warpcast.com/~/channel/metaliminal',
]

// Validating necessary environment variables or configurations.
if (!SIGNER_UUID) {
  throw new Error("SIGNER_UUID is not defined");
}

if (!NEYNAR_API_KEY) {
  throw new Error("NEYNAR_API_KEY is not defined");
}

const replyToCast = async (castId: string, author: string, fid: number) => {
  try {
    await neynarClient.reactToCast(SIGNER_UUID, ReactionType.Like, castId);
    console.log(`Liked cast ${castId}`);
    await castToChannel('shelf', castId, fid)
    console.log(`Recasted cast ${castId}`);
  } catch (err) {
    if (isApiErrorResponse(err)) {
      console.log(err.response.data);
    } else console.log(err);
  }
}

const checkCasts = async () => {
  const casts = await getMediaCasts(100, channels);
  for (const cast of casts) {
    try {
      await replyToCast(cast.hash, cast.author, cast.fid);
      await markReplySuccess(cast.hash);
    } catch (error) {
      console.error('Error replying to cast:', error);
    }
  }
}

// schedule cron job to check for new casts every 5 minutes
cron.schedule('* * * * *', function() {
  checkCasts();
});

// schedule cron job to post the vibe frame once every 24 hours, starting immediately
cron.schedule('0 23 * * *', function() {
  castVibeFrame('shelf');
});