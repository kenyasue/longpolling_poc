import axios, { AxiosResponse } from "axios";

class NotificationClient {

    initialized: boolean = false;
    channelId: String | null = null;
    stopListening: boolean = false;
    listener: Function | null = null;

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

    async join(channelId: string, callBack: any) {

        const response = await axios({
            method: 'post',
            url: '/api/notifier',
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