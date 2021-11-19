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

    async join(channelId: string, callBack: any) {

        const response = await axios({
            method: 'post',
            url: this.serverUrl,
            data: {
                channelId: channelId,
            }
        });

        if (callBack && response.data) callBack(response.data);

        // to avoid overlow calling stack
        setTimeout(() => {
            this.join(channelId, callBack);
        }, 10)

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