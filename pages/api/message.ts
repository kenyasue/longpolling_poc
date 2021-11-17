// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import notifierServer from '../../lib/notifierServer';
import { setDevice, getDevices } from '../../lib/userdevice';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {

    if (req.method !== "POST")
        res.status(405).send("method not allowed");

    try {

        console.log(`send message server random ${notifierServer.random}`);
        console.log(`send message server connections`, notifierServer.connections);

        const userId = req.body.userId;
        if (!userId) return res.status(402).send("invalid parameter");

        const devices = await getDevices(userId);

        if (devices)
            await Promise.all(devices.map(async (deviceId) => {
                await notifierServer.send(deviceId, {
                    userId: userId,
                    messaage: req.body.message
                });
            }))

        res.status(200).send("sent");

    } catch (e) {
        console.error(e);
        res.status(500).send("server error");
    }

}
