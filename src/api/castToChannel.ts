import axios from 'axios';
import { API_URL, NEYNAR_API_KEY, SIGNER_UUID } from '../config';
import { randomUUID } from 'crypto';

export async function castToChannel(
    channel: string,
    hash: string,
    fid: number
) {
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
                signer_uuid: SIGNER_UUID,
                idem: randomUUID(),
            }),
        });
        console.log(`Cast published to ${channel}`);
    } catch (error) {
        console.error('Error publishing cast:', error);
    }
}
