import Head from 'next/head';
import Image from 'next/image';
import Layout, { Metadata, NavBar, Footer, BackgroundImage, DownArrow, TextSpill } from '../components/layout';
import style from './index.module.css';
import useSWR from 'swr';
import {useEffect, useRef, useState} from "react";
import {useSpring, animated} from "@react-spring/web";


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
                <Section1>
                </Section1>
                <div className={style.downArrowContainer}>
                    <p style={{color: "white", textAlign: "center"}}><TextSpill text="About"/><TextSpill text="Me!"/></p>
                    <DownArrow/>
                </div>
                <div className="separator" style={{position: "relative", bottom: 0}}></div>
                <Section2>
                </Section2>
                <Footer/>
            </Layout>
        </div>
    );
}

const introText = "Hey! I'm Jaskaran!";
const jobText1 = "ML";
const jobText2 = "Engineering";
const jobText3 = "Software";
const jobText4 = "Development";

function Section1() {
    const fadeInProps = useSpring({
        from: { opacity: 0 },
        to: { opacity: 1 }
    })
    const springProps = useSpring(
        {
            from: { scale: 1 },
            to: { scale: 2 },
        })


    return (
        <section id="section1" className={style.section1}>
            <div style={springProps} className={style.section1Text}>
                <animated.div style={springProps}>
                    <TextSpill text={introText}></TextSpill>
                </animated.div>
                <br />
                <div className={style.jobText}>
                    <animated.div style={{borderRight: "1px solid white", ...fadeInProps}}><TextSpill text={jobText1} /><TextSpill text={jobText2}/></animated.div>
                    <animated.div style={{borderLeft: "1px solid white", ...fadeInProps}}><TextSpill text={jobText3}/><TextSpill text={jobText4}/></animated.div>
                </div>
            </div>
            <TextSpill/>
        </section>
    );
}

const aboutMePara1 = "I've been working as a Data Scientist at Sprinklr since July 2022. I love working with AI, especially LLMs and NLP. I graduated with the Department Gold Medal from IIT Roorkee in 2022, majoring in Biotechnology (B. Tech.). Working with technology is a dream come true, and I've had the opportunity to gain experience in both FrontEnd and BackEnd development. I'm also working on building my foundations in Computer Science.\n"
const aboutMePara2 = "Apart from that, I become deeply interested in almost everything under the sun. If something piques my interest, I tend to become obsessed with it and conduct extensive research. I have a strong passion for Fitness and Gaming, and I like to engage in Content Creation, Reading, Music, and occasional Partying!! Additionally, my interests tend to change frequently, so you'll likely find a variety of topics covered in my blog."
const aboutMePara3 = "I hope you enjoy visiting my site! If you'd like to get in touch, you can find my LinkedIn and Instagram links in the footer."


function Section2() {
    return (
        <section id="section2" className={style.section2}>
            <h2>About Me</h2>
            <div className={style.aboutContent}>
                <div className={style.aboutImage}>
                    <Image src="/mountainMe.jpg" alt="Jaskaran on a snowy mountain, in trekking gear"
                           width={0}
                           height={0}
                           sizes="100vw"
                           style={{ width: '100%', height: 'auto' }}

                    />
                </div>

                <div className={style.aboutText}>
                    {aboutMePara1}
                    <br/><br/>
                    {aboutMePara2}
                    <br/><br/>
                    {aboutMePara3}
                </div>
            </div>
        </section>
    )
}
