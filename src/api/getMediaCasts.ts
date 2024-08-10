import Redis from 'ioredis';
import axios from 'axios';
import { API_URL, NEYNAR_API_KEY, REDIS_URL } from '../config';

const redisUrl = REDIS_URL || 'redis://localhost:6379';
const redis = new Redis(redisUrl + '?family=0');

// Function to mark a cast as replied
export async function markCastAsReplied(castId: string, expirationInSeconds: number = 86400) {
  try {
    await redis.setex(`replied:${castId}`, expirationInSeconds, '1');
    console.log(`Marked cast ${castId} as replied`);
  } catch (error) {
    console.error('Error marking cast as replied:', error);
  }
}

// Function to check if a cast has been replied to
async function hasRepliedToCast(castId: string): Promise<boolean> {
  try {
    if (!redis) throw new Error('Redis client not initialized');
    const result = await redis.get(`replied:${castId}`);
    return result === '1';
  } catch (error) {
    console.error('Error checking if cast has been replied to:', error);
    return false;
  }
}

export async function getMediaCasts(limit: number, parentUrls: string[]) {
    let castArray: any = [];
    try {
        const response = await axios({
            url: `${API_URL}/feed/parent_urls?parent_urls=${parentUrls}&with_recasts=false&with_replies=false&limit=${limit}`,
            method: 'get',
            headers: {
                accept: 'application/json',
                api_key: NEYNAR_API_KEY
            }
        });

        const casts = await response.data;
        
        // Check if casts is an array, if not, look for an array property
        const castsArray = Array.isArray(casts) ? casts : casts.casts || casts.result || casts.data;

        if (!Array.isArray(castsArray)) {
            console.error('Unexpected response structure:', casts);
            return castArray;
        }

        castsArray.forEach( async (cast: any) => {
            if (cast.embeds && cast.embeds[0]?.metadata?.content_type?.includes('image/jpeg' || 'image/png' || 'image/gif')) {
                if (cast.reactions.likes_count > 10) {
                    const hasReplied = await hasRepliedToCast(cast.hash);
                    if (!hasReplied) {
                        castArray.push({ hash: cast.hash, author: cast.author.username, fid: cast.author.fid, image: cast.embeds[0].url});
                    } else {
                        console.log(`Cast ${cast.hash} has already been replied to. Searching for new casts...`);
                    }
                }
            }
        });

    } catch (error) {
        console.error('Error fetching media casts:', error);
    }

    return castArray;
}





