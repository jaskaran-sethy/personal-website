import Head from 'next/head';
import Image from 'next/image';
import Layout, { Metadata, NavBar, Footer, BackgroundImage } from '../components/layout';
import style from './index.module.css';
import useSWR from 'swr';
import {useState} from "react";

export default function HomePage() {
    const [mousePosition, setMousePosition] = useState({x: 0, y: 0});
    function handleMouseMove(event) {
        setMousePosition({x: event.clientX, y: event.clientY});
    }

    return (
        <div onMouseMove={(event) => {handleMouseMove(event)}}>
            <div className={style.cursorAura} style={{position: "fixed", top: `${mousePosition.y}px`, left: `${mousePosition.x}px`}}></div>
            <Layout className="noScrollx noScrolly">
                <Head>
                    <Metadata />
                </Head>
                <NavBar />
                <BackgroundImage />
                <div className={style.homeContainer}>
                    <div className={style.homeText}>
                        Hey! I'm Jaskaran!
                        <br />
                        ML Engineer

                    </div>
                </div>
                <Footer/>
            </Layout>
        </div>
    );
}


