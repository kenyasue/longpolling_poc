// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import notificationServer from '../../../lib/notificationServer';
import { setDevice, getDevices } from '../../../lib/userdevice';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {

  if (req.method !== "POST")
    res.status(405).send("method not allowed");

  try {

    const channelId = req.body.channelId;

    if (!channelId) return res.status(402).send("invalid parameter");

    const connectionId: string = await notificationServer.subscribe(channelId, (data: any) => {

      // called when timeout or notifications received
      if (data) res.status(200).json({
        notifications: data
      });

      else res.status(200).json({
        notifications: []
      });

      notificationServer.unsubscribe(connectionId);

    });

  } catch (e) {
    console.error(e);
    res.status(500).send("server error");
  }

}
