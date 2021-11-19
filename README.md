## Long polling PoC

### How to build

```
$ git clone https://github.com/kenyasue/longpolling_poc.git
$ cd longpolling_poc
$ sudo docker-compose up -d
$ npm install
$ npm run build
$ npm run start

```

### How to use
1. Open this url http://localhost:3000
2. Enter the userid
3. You can open several browsers with in incognito mode with different userid.
4. To send individual message, enter userid to send and message.
5. You can send broadcast message to all users to.

### How to use the library

#### Client side

```

    import notifierClient from '../lib/notifierClient'

    notifierClient.setUrl("/api/notifier");

    notifierClient.join("channel", (payload: any) => {
        console.log("Got payload",payload);
    });


```
Check the working source code example.
https://github.com/kenyasue/longpolling_poc/blob/master/pages/chat.tsx


#### Server side

```

    import notifierServer from '../../../lib/notifierServer';


    ## in the URL post event
    const channelId = req.body.channelId;

    if (!channelId) return res.status(402).send("invalid parameter");

    //await setDevice(userId, deviceId);

    notifierServer.listen(channelId, (data: any) => {

      // called when timeout or notifications received
      if (data) res.status(200).json(data);

      else res.status(200).json({});

    });

```
Check the working source code example.
https://github.com/kenyasue/longpolling_poc/blob/master/pages/api/message.ts
