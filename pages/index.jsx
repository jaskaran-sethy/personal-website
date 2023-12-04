import Head from 'next/head';
import Image from 'next/image';
import ResponsiveImage from "../components/responsiveImage";
import Layout, { Metadata, NavBar, Footer, BackgroundImage } from '../components/layout';
import {nextLogo, reactLogo, blank, k8sLogo, dockerLogo, hfLogo, pandasLogo, vllmLogo} from '/lib/logoLoader';
import style from './index.module.css';
import useSWR from 'swr';
import {useState} from "react";

export default function HomePage() {
    const [mousePosition, setMousePosition] = useState({x: 0, y: 0});
    function handleMouseMove(event) {
        setMousePosition({x: event.clientX, y: event.clientY});
    }
    const radius = "20"; // in viewport width units
    let iconList = [nextLogo, reactLogo, k8sLogo, dockerLogo, hfLogo, pandasLogo, vllmLogo]
    if (iconList.length % 2 === 1) iconList.push(blank)
    iconList.unshift(blank);
    iconList.push(blank);
    iconList = iconList.map((src, index, array) => {
        const angle = index / array.length * 2 * Math.PI;
        let [newX, newY] = [Math.round(Math.sin(angle) * radius), Math.round(Math.cos(angle) * radius)]
        if (newX < 0) newX -= 20;
        else if (newX > 0) newX += 20;
        return <Image
        src={src} alt="logo"
        style={{"--relativeChangeX": `${newX}vw`, "--relativeChangeY": `${newY}vw`}}
        className={style.icons}/>});



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
                        AI Engineer
                        {iconList}
                    </div>
                </div>
                <Footer/>
            </Layout>
        </div>
    );
}


