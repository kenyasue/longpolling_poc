

import express, { Request, Response } from "express";
import next from "next";
import notificationServer from './lib/notificationServer';
import faker from 'faker';

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const port = process.env.PORT || 3000;

(async () => {
    try {
        await app.prepare();
        const server = express();

        server.all("*", (req: Request, res: Response) => {

            if (/^\/api\/notifier\/sse\/.+$/.test(req.url)) {

                const channelId = req.url.replace("/api/notifier/sse/", "");
                if (channelId === '') return res.end();

                res.writeHead(200, {
                    Connection: 'keep-alive',
                    'Cache-Control': 'no-cache',
                    'Content-Type': 'text/event-stream',
                });

                notificationServer.subscribe(channelId as string, (data: any) => {

                    console.log("notification received", data);
                    res.write(`id:${faker.datatype.hexaDecimal(40)}\ndata:${JSON.stringify({ notifications: data })}\n\n`);

                });

            } else {
                return handle(req, res);
            }

        });
        server.listen(port, (err?: any) => {
            if (err) throw err;
            console.log(`> Ready on localhost:${port} - env ${process.env.NODE_ENV}`);
        });

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();

/*
require('dotenv').config();
const app = require('express')();
const server = require('http').Server(app);
const next = require('next');
const dev = false;

const nextApp = next({ dev });
const nextHandler = nextApp.getRequestHandler();
const notificationServer = require('./lib/notificationServer');

nextApp.prepare().then(() => {
    app.all('*', (req, res) => {

        // here comes the server side logic when the server sent mode
        if (/^\/api\/notifier\/\sse\/.+$/.test(req.url)) {

            const channel = req.url.replace("/api/notifier/sse/", "");
            if (channel === '') return res.end();

            res.writeHead(200, {
                Connection: 'keep-alive',
                'Cache-Control': 'no-cache',
                'Content-Type': 'text/event-stream',
            });

            notificationServer.listen(channelId, (data) => {

                res.write(JSON.stringify({
                    notifications: data
                }));

            });

        } else {
            return nextHandler(req, res);
        }
    });

    const port = 3000;
    server.listen(port, err => {
        if (err) throw err;
        console.log('> Ready on http://localhost:' + port);
    });
});
*/