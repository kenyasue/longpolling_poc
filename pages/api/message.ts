// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import notifierServer from '../../lib/notifierServer';
import { setDevice, getDevices } from '../../lib/userdevice';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {

    console.log("req.headers", req.headers);

    if (req.method !== "POST")
        res.status(405).send("method not allowed");

    try {

        const userId = req.body.userId;
        if (!userId) return res.status(402).send("invalid parameter");

        const devices = await getDevices(userId);

        if (devices)
            await Promise.all(devices.map(async (deviceId) => {
                await notifierServer.send(deviceId, {
                    fromUserId: req.headers.userid,
                    userId: userId,
                    message: req.body.message
                });
            }))

        res.status(200).send("sent");

    } catch (e) {
        console.error(e);
        res.status(500).send("server error");
    }

}
