import axios, { AxiosResponse } from "axios";

class NotificationClient {

    initialized: boolean = false;
    userId: String | null = null;
    deviceId: String | null = null;
    stopListening: boolean = false;
    listener: Function | null = null;

    constructor() {
        console.log("NotificationClient initialized");
        this.startLitening();
    }

    wait(sec: number) {
        return new Promise<void>((res, rej) => {
            setTimeout(() => {
                res();
            }, sec * 1000);
        })
    }

    async login(userId: String, deviceId: String) {

        this.initialized = true;
        this.userId = userId;
        this.deviceId = deviceId;
    }

    async startLitening() {

        if (!this.userId || !this.deviceId) {
            await this.wait(1);
            this.startLitening();
            return;
        }

        const response = await axios({
            method: 'post',
            url: '/api/notifier',
            data: {
                userId: this.userId,
                deviceId: this.deviceId
            }
        });

        if (this.listener && response.data.notifications.length > 0) this.listener(response.data);

        this.startLitening();
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