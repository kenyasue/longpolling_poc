import type { NextPage } from 'next'
import React, { useState, useEffect } from "react";
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import notifierClientLP from '../lib/notifierClientLongPolling'
import notifierClientSSE from '../lib/notifierClientSSE' // server side events
import axios, { AxiosResponse } from "axios";
import { useRouter } from 'next/router'

// switch here to use another logic
//const notifierClient = notifierClientLP;
const notifierClient = notifierClientSSE;

const Home: NextPage = () => {

  const router = useRouter();

  let userId: string;
  let deviceId: string;

  const [sendUserId, setSendUserId] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [messageList, setMessageList] = useState<Array<{
    userId: string,
    fromUserId: string,
    message: string
  }>>([]);
  const [burstTimer, setBurstTimer] = useState<number>(0);
  const [sentCount, setSentCount] = useState<number>(0);
  const [receivedCount, setReceivedCount] = useState<number>(0);

  useEffect(() => {

    // switch here to use another logic
    //notifierClient.setUrl("/api/notifier/longpolling");
    notifierClient.setUrl("/api/notifier/sse");

    const userId: string = localStorage.getItem(`userId`) as string;
    const deviceId: string = localStorage.getItem(`deviceId_${userId}`) as string;

    (async () => {

      if (!userId || !deviceId) {
        alert("No userid and deviceid in localstorage. Please login again");
        router.push("/");
      }

      // individual message
      notifierClient.join(deviceId, deviceId, (payload: any) => {

        if (!payload || !payload.notifications) return;

        payload.notifications.map((row: any) => {
          messageList.push(row);
          setMessageList([...messageList])
        });

      });

      // broadcast channel
      notifierClient.join("broadcast", deviceId, (payload: any) => {

        if (!payload || !payload.notifications) return;

        payload.notifications.map((row: any) => {
          messageList.push(row);
          setMessageList([...messageList])
        });

      });

      // burstmode channel
      let received: number = 0;
      notifierClient.join("burst", deviceId, (payload: any) => {

        if (!payload || !payload.notifications) return;

        //console.log("burstmode payload", payload);
        setReceivedCount(received += payload.notifications.length);
      });

    })();

    return function cleanup() {
      notifierClient.removeListener();
    };

  }, []);

  const startBurst = async () => {

    let sent: number = 0;
    const timer: number = window.setInterval(async () => {

      const response = await axios({
        method: 'post',
        url: '/api/message',
        headers: {
          userid: userId, // from user
          deviceid: deviceId // from device
        },
        data: {
          userId: "burst", // to user
          message: "burst"
        }
      });

      setSentCount(sent++);

    }, 10);

    setBurstTimer(timer);
  }

  const stopBurst = () => {
    clearInterval(burstTimer);
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.chatContainer}>
          <div className={styles.messagesContainer}>
            <h2>Messages</h2>
            <div>
              {messageList.map((message, index) => {
                return <div key={index}>{message.message} from {message.fromUserId}</div>
              })}
            </div>
          </div>
          <div className={styles.controllsContainer1}>
            <h3>Send a message</h3>
            UserID: <input type="text" onChange={(e) => {
              setSendUserId(e.target.value)
            }} value={sendUserId} /><br />
            Message: <input type="text" onChange={(e) => {
              setMessage(e.target.value)
            }} value={message} /><br />
            <button onClick={async (e) => {

              const userId: string = localStorage.getItem(`userId`) as string;
              const deviceId: string = localStorage.getItem(`deviceId_${userId}`) as string;

              const response = await axios({
                method: 'post',
                url: '/api/message',
                headers: {
                  userid: userId, // from user
                  deviceid: deviceId // from device
                },
                data: {
                  userId: sendUserId, // to user
                  message: message
                }
              });

              setMessage("");
              setSendUserId("");
            }}>send</button>

            <button onClick={async (e) => {

              const userId: string = localStorage.getItem(`userId`) as string;
              const deviceId: string = localStorage.getItem(`deviceId_${userId}`) as string;

              const response = await axios({
                method: 'post',
                url: '/api/message',
                headers: {
                  userid: userId, // from user
                  deviceid: deviceId // from device
                },
                data: {
                  userId: "broadcast", // to user
                  message: message
                }
              });

              setSendUserId("");
            }}>Broadcast</button>

          </div>
          <div className={styles.controllsContainer2}>
            <h3>Burst Mode</h3>
            <button onClick={e => startBurst()}>Start</button>
            <button onClick={e => stopBurst()}>Stop</button><br />
            received {receivedCount} / sent {sentCount}
          </div>
        </div>
      </main >

    </div >
  )
}

export default Home
