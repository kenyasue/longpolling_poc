import { NetConnectOpts } from 'net';
import type { NextApiRequest, NextApiResponse } from 'next'
import faker from 'faker';
import { timeStamp } from 'console';
import amqp from "amqplib";
import os from "os";
import { ifError } from 'assert';

interface connectionInitializer {
    channelId: string,
    onRelease: Function
}

class Connection {
    channelId: string | null = null;
    connectionId: string = "";
    onReleaseCallback: Function | undefined;
    released: boolean = false;

    constructor(params: connectionInitializer) {
        this.channelId = params.channelId;
        this.connectionId = faker.datatype.hexaDecimal(40);
        this.onReleaseCallback = params.onRelease;

        setTimeout(() => {
            this.releaseConnection();
        }, 5 * 1000);
    }

    async releaseConnection() {
        if (this.onReleaseCallback && !this.released)
            this.onReleaseCallback(null, this);
    }
}

class NotificationServer {

    // this is rabbitgMQ channel to produce & consume
    exchangeName: string = "notification";
    connections: { [k: string]: Connection } = {};
    publishChannel: amqp.Channel | null = null;
    pid: number = process.pid;
    random: string = faker.datatype.string(12);

    constructor() {

        (async () => {

            const rabbitMQConnetion = await amqp.connect("amqp://myuser:mypassword@localhost");
            process.once('SIGINT', function () { rabbitMQConnetion.close(); });

            // setup consumer
            const rabbitMQConsumeChannel: amqp.Channel = await rabbitMQConnetion.createChannel();
            await rabbitMQConsumeChannel.assertExchange(this.exchangeName, 'direct', {
                durable: true
            });

            const queue: amqp.Replies.AssertQueue = await rabbitMQConsumeChannel.assertQueue(`${process.pid}_${os.hostname}`, {
                exclusive: false
            });
            await rabbitMQConsumeChannel.bindQueue(queue.queue, this.exchangeName, '');

            rabbitMQConsumeChannel.consume(queue.queue, (msg) => {

                const payload = JSON.parse(msg?.content.toString() as string);
                const channelId = payload.channelId;
                const data = payload.data;


                this.notify(channelId, data);

            }, { noAck: false });

            // setup publisher
            const rabbitMQPublishChannel: amqp.Channel = await rabbitMQConnetion.createChannel();
            await rabbitMQPublishChannel.assertExchange(this.exchangeName, 'direct', {
                durable: true
            });
            this.publishChannel = rabbitMQPublishChannel;

        })();

    }

    async join(channelId: string, callback: Function) {

        const connection: Connection = new Connection({
            channelId, onRelease: (data: any, connection: Connection) => {

                // remove from pool
                delete this.connections[connection.connectionId];
                connection.released = true;
                if (callback) callback(data)
            }

        });

        this.connections[connection.connectionId] = connection;

    }

    async notify(channelId: string, data: any) {

        const connectionsToNotify: Array<Connection> = [];
        Object.keys(this.connections).map(connectionId => {
            const connection: Connection = this.connections[connectionId];
            if (connection.channelId === channelId) connectionsToNotify.push(connection);
        })

        if (connectionsToNotify.length === 0) return;

        connectionsToNotify.map(connection => {
            if (connection.onReleaseCallback)
                connection.onReleaseCallback([data], connection);
        });
    }

    async send(channelId: string, data: any) {

        if (!this.publishChannel) return console.log("Channel is not ready");

        const jsonData = JSON.stringify({
            channelId: channelId,
            data: data
        });

        this.publishChannel.publish(this.exchangeName, '', Buffer.from(jsonData));
    }

}

export default new NotificationServer();