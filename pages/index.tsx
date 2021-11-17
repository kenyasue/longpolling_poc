import type { NextPage } from 'next'
import React, { useState, useEffect } from "react";
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useRouter } from 'next/router'
import notifierClient from '../lib/notifierClient'
import faker from 'faker';

const Home: NextPage = () => {

  const [userId, setUserId] = useState<string>("");
  const router = useRouter();

  useEffect(() => {

  }, []);

  const onLogin = async () => {

    if (!/^[a-zA-Z0-9]{3,}$/.test(userId)) return alert("invalid username");

    // generate device name if not exists
    const deviceId: string = localStorage.getItem(`deviceId_${userId}`) || faker.datatype.hexaDecimal(40);
    localStorage.setItem(`deviceId_${userId}`, deviceId);
    console.log(`deviceId is ${deviceId}`);

    await notifierClient.login(userId, deviceId);
    router.push("/chat")

  };

  return (
    <div className={styles.container}>

      <main className={styles.main}>

        <input type="text" onChange={(e) => {
          setUserId(e.target.value)
        }} value={userId} />

        <button onClick={() => {
          onLogin();
        }}>login</button>

      </main>

    </div>
  )
}

export default Home
