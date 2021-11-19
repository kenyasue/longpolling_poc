import type { NextPage } from 'next'
import React, { useState, useEffect } from "react";
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import notifierClient from '../lib/notifierClient'
import axios, { AxiosResponse } from "axios";
import { useRouter } from 'next/router'

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

  useEffect(() => {

    const userId: string = localStorage.getItem(`userId`) as string;
    const deviceId: string = localStorage.getItem(`deviceId_${userId}`) as string;

    (async () => {

      if (!userId || !deviceId) {
        alert("No userid and deviceid in localstorage. Please login again");
        router.push("/");
      }

      // individual message
      notifierClient.join(deviceId, (payload: any) => {

        payload.notifications.map((row: any) => {
          messageList.push(row);
          setMessageList([...messageList])
        });

      });

      // broadcast channel
      notifierClient.join("broadcast", (payload: any) => {

        payload.notifications.map((row: any) => {
          messageList.push(row);
          setMessageList([...messageList])
        });

      });

    })();

    return function cleanup() {
      notifierClient.removeListener();
    };

  }, []);

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
          <div className={styles.controllsContainer}>
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

              setMessage("");
              setSendUserId("");
            }}>Broadcast</button>

          </div>

        </div>
      </main >

    </div >
  )
}

export default Home
