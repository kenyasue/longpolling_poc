import axios, { AxiosResponse } from "axios";

class NotificationClient {

    initialized: boolean = false;
    channelId: string | null = null;
    stopListening: boolean = false;
    listener: Function | null = null;
    serverUrl: string = "";

    constructor() {
        console.log("NotificationClient initialized");
    }

    wait(sec: number) {
        return new Promise<void>((res, rej) => {
            setTimeout(() => {
                res();
            }, sec * 1000);
        })
    }

    setUrl(url: string) {
        this.serverUrl = url;
    }

    async join(channelId: string, deviceId: string, callBack: any) {

        const evtSource: EventSource = new EventSource(`${this.serverUrl}/${channelId}`);
        //const evtSource: EventSource = new EventSource(`${this.serverUrl}`);

        evtSource.onmessage = function (event) {
            console.log("got server sent event", event.data);
            if (callBack && event.data) callBack(event.data);
        }

        return;
    }

    setListener(func: Function) {
        this.listener = func;
    }

    removeListener() {
        this.listener = null;
    }


}

// singleton
export default new NotificationClient();