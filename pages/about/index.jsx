import Layout, { Metadata, NavBar, Card, Footer } from '../../components/layout';
import style from './index.module.css';
import Head from "next/head";
import Image from "next/image";

export default function HomePage() {
    return (<Layout>
            <Head>
                <Metadata />
            </Head>
            <NavBar />
            <Card>
                <div style={{textAlign: "center"}}>
                    <div className={style.roundChildImage} >
                        <Image src="/suit_me.png" alt="Jaskaran Sethy in a suit" width={144} height={144} />
                    </div>
                    <div style={{fontSize: "1.1rem", padding: "2rem"}}>
                        <p>
                            Hi!
                            <br/>
                            I've been working as a Data Scientist in Sprinklr since July 2022. I love working with AI (LLMs and NLP in general).
                            I graduated with the Department Gold Medal from IIT Roorkee 2022, having majored in Bachelor's of Technology (B. Tech.) in Biotechnology.
                            Working with tech is a passion come true, and I've been grateful to have exposure to FrontEnd and BackEnd development as well. I'm working on completing my Computer Science foundations too!
                            <br /><br />
                            Other than, I end up being enamored with practically everything under the sun. If something is interesting to me, I end up obsessing over it and doing a lot of research on it. I'm big into Fitness and Gaming, and I like to dabble in Content Creation, Reading, Music, Partying(!!) regularly. Other than that, I often have fleeting interests, so you'll probably find my blog filled with a lot of unrelated stuff. I hope you liked my site! If you'd like to reach out, you can find my LinkedIn and Instagram in the footer.
                        </p>
                    </div>
                </div>
            </Card>
            <Footer />
        </Layout>
    );
}
