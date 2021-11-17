import type { NextPage } from 'next'
import React, { useState, useEffect } from "react";
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import notifierClient from '../lib/notifierClient'
import axios, { AxiosResponse } from "axios";

const Home: NextPage = () => {

  const [userId, setUserId] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [messageList, setMessageList] = useState<Array<string>>(["test"]);

  useEffect(() => {

    (async () => {

      notifierClient.setListener((payload: any) => {
        console.log("notification received", payload);

        payload.notifications.map((row: any) => {
          messageList.push(`${row.message}`);
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
                return <div key={index}>{message}</div>
              })}
            </div>
          </div>
          <div className={styles.controllsContainer}>
            UserID: <input type="text" onChange={(e) => {
              setUserId(e.target.value)
            }} value={userId} /><br />
            Message: <input type="text" onChange={(e) => {
              setMessage(e.target.value)
            }} value={message} /><br />
            <button onClick={async (e) => {

              const response = await axios({
                method: 'post',
                url: '/api/message',
                data: {
                  userId: userId,
                  message: message
                }
              });

              setMessage("");
              setUserId("");
            }}>send</button>
          </div>

        </div>
      </main >

    </div >
  )
}

export default Home
