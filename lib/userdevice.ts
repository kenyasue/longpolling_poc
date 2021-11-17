// simulates user-device databasa
import Memcached from 'memcached';
const memcached = new Memcached('localhost', {});

const stringPrefix = "devices_";
const devices: { [k: string]: Array<string> } = {};

const memcachedGet = (key: string): Promise<any> => {
    return new Promise<any>((res, rej) => {
        memcached.get(key, (err, data) => {
            if (err) rej(err)
            res(data);
        });
    })
}

const memcachedSet = (key: string, value: any): Promise<void> => {
    return new Promise<void>((res, rej) => {
        memcached.set(key, value, 60 * 60 * 24 * 30, (err) => {
            if (err) rej(err)
            else res();
        });
    })
}

export async function getDevices(userId: string) {
    const cacheKey = `${stringPrefix}_${userId}`;
    let devices: Array<string> = await memcachedGet(cacheKey);
    if (!devices) devices = [];
    return devices;
}

export async function setDevice(userId: string, deviceId: string) {

    const cacheKey = `${stringPrefix}_${userId}`;
    let devices: Array<string> = await memcachedGet(cacheKey);

    if (!devices) devices = [];

    if (devices.indexOf(deviceId) === -1)
        devices = [deviceId, ...devices];

    await memcachedSet(cacheKey, devices);

}
