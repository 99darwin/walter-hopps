import cron from "node-cron";
import neynarClient from "./neynarClient";
import {
  SIGNER_UUID,
  NEYNAR_API_KEY,
} from "./config";
import { isApiErrorResponse } from "@neynar/nodejs-sdk";
import { getMediaCasts, castToChannel } from './api';
import { ReactionType } from "@neynar/nodejs-sdk/build/neynar-api/neynar-v2-api";

const channels = [
  'https://warpcast.com/~/channel/art', 
  'https://warpcast.com/~/channel/ai-art',
  'https://warpcast.com/~/channel/cryptoart',
]

// Validating necessary environment variables or configurations.
if (!SIGNER_UUID) {
  throw new Error("SIGNER_UUID is not defined");
}

if (!NEYNAR_API_KEY) {
  throw new Error("NEYNAR_API_KEY is not defined");
}

const replyToCast = async (castId: string, author: string, fid: number) => {
  const messageOptions = [
    `Congrats, @${author}, this piece has made the cut for our gallery. It captures the essence we\'re after—excited to see it on our walls.`,
    `Good work, @${author}. This selection fits perfectly with the narrative we\'re building. Looking forward to unveiling it.`,
    `Kudos, @${author}. This image will be a standout in our upcoming exhibition. It\'s exactly what we need to tie the collection together.`,
    `Well done, @${author}. Your keen eye has added another gem to our gallery. This work will resonate deeply with our audience.`,
    `Nice pick, @${author}. This image aligns beautifully with our vision. It\'s going to make quite the impact.`,
    `Excellent choice, @${author}. This piece has that intangible quality we\'ve been searching for. Thrilled to see it in the gallery.`,
    `Spot on, @${author}. This work adds just the right touch to our collection. Can't wait to see it displayed.`,
    `Fantastic selection, @${author}. This image is a perfect fit for our show. It\'ll bring a fresh perspective to our narrative.`
]
  try {
    await neynarClient.reactToCast(SIGNER_UUID, ReactionType.Like, castId);
    console.log(`Liked cast ${castId}`);
    await castToChannel('shelf', castId, author, fid)
    console.log(`Recasted cast ${castId}`);
    await neynarClient.publishCast(SIGNER_UUID, `${messageOptions[Math.floor(Math.random() * messageOptions.length)]} Check it out at /shelf.`, { replyTo: castId });
    console.log(`Replied to cast ${castId}`);
  } catch (err) {
    if (isApiErrorResponse(err)) {
      console.log(err.response.data);
    } else console.log(err);
  }
}

const checkCasts = async () => {
  const casts = await getMediaCasts(100, channels);
  await casts.forEach(async (cast: any) => {
    try {
      await replyToCast(cast.hash, cast.author, cast.fid);
    } catch (error) {
      console.error('Error replying to cast:', error);
    }
  });
}
// schedule cron job to check for new casts every 5 minutes
cron.schedule('*/5 * * * *', function() {
  checkCasts();
});