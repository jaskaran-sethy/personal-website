import Head from 'next/head';
import Image from 'next/image';
import Layout, { Metadata, NavBar, Footer, BackgroundImage, DownArrow, TextSpill } from '../components/layout';
import style from './index.module.css';
import useSWR from 'swr';
import {useEffect, useState} from "react";
import {useSpring, animated} from "@react-spring/web";
import Link from "next/link";


export default function HomePage() {
    const [mousePosition, setMousePosition] = useState({x: 0, y: 0});
    const [isScrolled, setIsScrolled] = useState(false);
    useEffect(() => {
        function handleScroll() {
            if (document.documentElement.scrollTop !== 0) setIsScrolled(true);
            else setIsScrolled(false);
        }
        document.addEventListener("scroll", handleScroll);
        return () => document.removeEventListener("scroll", handleScroll);
    }, [])
    function handleMouseMove(event) {
        setMousePosition({x: event.clientX, y: event.clientY});
    }


    return (
        <div className={style.wrapper} onMouseMove={(event) => {handleMouseMove(event)}}>
            <div className={style.cursorAura} style={{position: "fixed", top: `${mousePosition.y}px`, left: `${mousePosition.x}px`}}></div>
            <Layout style={{position: "relative"}} className="noScrollx noScrolly">
                <Head>
                    <Metadata />
                </Head>
                <NavBar />
                <BackgroundImage />
                <Section1>
                </Section1>
                {!isScrolled ? (<div className={style.downArrowContainer} style={{color: "white", textAlign: "center"}}>
                    <TextSpill text="About"></TextSpill><TextSpill text="Me!"></TextSpill>
                    <DownArrow/>
                </div>) : null}
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
const jobText2 = "Engineer";
const jobText3 = "Software";
const jobText4 = "Developer";

function Section1() {
    const fadeInProps = useSpring({
        from: { opacity: 0 },
        to: { opacity: 1 }
    })
    const springProps = useSpring(
        {
            from: { fontSize: "1em" },
            to: { fontSize: "1.3em" },
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
            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 6fr 1fr 1fr"}}>
                <div></div>
                <div style={{width: "5vw", paddingTop: "5vh"}}><Link href="/"><UpArrow /></Link></div>
                <h2>About Me</h2>

                <div></div>
                <div></div>
            </div>
            <div className={style.aboutContent}>
                <div className={style.aboutImage}>
                    <img src="/mountainMe.jpg" alt="Jaskaran on a snowy mountain, in trekking gear"
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

function UpArrow() {
    return (
        <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
             viewBox="0 0 512 512"
             preserveAspectRatio="xMidYMid meet">

            <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
               fill="#ffffff" stroke="none">
                <path d="M2605 5111 c-33 -14 -47 -36 -188 -306 -151 -289 -243 -483 -340
-715 -116 -280 -237 -647 -237 -718 0 -63 68 -122 124 -108 59 15 276 209 404
361 l75 89 -7 -194 c-4 -107 -16 -366 -26 -575 -35 -680 -42 -979 -37 -1415 5
-450 17 -633 63 -960 32 -226 88 -505 109 -536 19 -29 55 -39 92 -27 42 14 54
47 43 123 -18 133 -40 404 -56 700 -21 387 -15 1115 15 1985 12 336 24 688 27
782 5 136 9 171 19 165 7 -4 97 -83 200 -177 232 -210 251 -225 289 -225 42 0
94 34 102 66 13 52 -34 336 -96 574 -84 324 -204 626 -382 958 -51 96 -79 137
-99 148 -31 15 -63 17 -94 5z m217 -721 c71 -178 142 -407 173 -558 9 -46 15
-85 13 -87 -2 -2 -76 64 -165 146 -89 82 -169 149 -178 149 -9 0 -28 9 -42 20
-18 14 -41 20 -73 20 -58 0 -94 -31 -104 -88 -5 -31 -28 -60 -156 -187 -82
-82 -150 -147 -150 -143 0 4 21 62 46 130 78 211 190 467 326 740 l130 263 55
-115 c30 -63 86 -194 125 -290z"/>
            </g>
        </svg>
    )
}