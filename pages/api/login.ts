// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import notifierServer from '../../lib/notificationServer';
import { setDevice, getDevices } from '../../lib/userdevice';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {

    if (req.method !== "POST")
        res.status(405).send("method not allowed");

    try {

        const userId = req.body.userId;
        if (!userId) return res.status(402).send("invalid parameter");

        const deviceId = req.body.deviceId;
        if (!deviceId) return res.status(402).send("invalid parameter");

        setDevice(userId, deviceId);
        res.status(200).send("ok");

    } catch (e) {
        console.error(e);
        res.status(500).send("server error");
    }

}
