import axios from 'axios';
import { API_URL, NEYNAR_API_KEY, SIGNER_UUID } from '../config';
import { randomUUID } from 'crypto';

export async function castToChannel(
    channel: string,
    hash: string,
    author: string,
    fid: number
) {
    const messageOptions = [
        `Congrats, @${author}, this piece has made the cut for our gallery. It captures the essence we\'re after—excited to see it on our walls.`,
        `Good work, @${author}. This selection fits perfectly with the narrative we\'re building. Looking forward to unveiling it.`,
        `Kudos, @${author}. This image will be a standout in our upcoming exhibition. It\'s exactly what we need to tie the collection together.`,
        `Well done, @${author}. Your keen eye has added another gem to our gallery. This work will resonate deeply with our audience.`,
        `Nice pick, @${author}. This image aligns beautifully with our vision. It\'s going to make quite the impact.`,
        `Excellent choice, @${author}. This piece has that intangible quality we\'ve been searching for. Thrilled to see it in the gallery.`,
        `Spot on, @${author}. This work adds just the right touch to our collection. Can't wait to see it displayed.`,
        `Fantastic selection, @${author}. This image is a perfect fit for our show. It\'ll bring a fresh perspective to our narrative.`,
    ];
    try {
        await axios({
            url: `${API_URL}/cast`,
            method: 'post',
            headers: {
                accept: 'application/json',
                api_key: NEYNAR_API_KEY,
                'content-type': 'application/json',
            },
            data: JSON.stringify({
                embeds: [
                    {
                        cast_id: { hash: hash, fid: fid },
                    },
                ],
                channel_id: channel,
                text: messageOptions[
                    Math.floor(Math.random() * messageOptions.length)
                ], // Randomly select a message
                signer_uuid: SIGNER_UUID,
                parent: hash,
                parent_author_fid: fid,
                idem: randomUUID(),
            }),
        });
        console.log(`Cast published to ${channel}`);
    } catch (error) {
        console.error('Error publishing cast:', error);
    }
}
