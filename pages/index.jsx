import Head from 'next/head';
import Image from 'next/image';
import Layout, { Metadata, NavBar, Footer } from '../components/layout';
import style from './index.module.css';
import useSWR from 'swr';

export default function HomePage() {
    return (
        <Layout className="noScrollx noScrolly">
            <Head>
                <Metadata />
            </Head>
            <NavBar />
            <div className={style.homeContainer}>
                <div className={style.homeText}>
                    Hey! I'm Jaskaran!
                    <br />
                    AI Engineer

                </div>
                <div className={style.homeImage}>
                    <Image src="/mountainMe.jpg" alt="Jaskaran Sethy in a suit" width={1500} height={2100} unoptimized={true}
                           priority/>
                </div>

            </div>
            <Footer/>
        </Layout>
    );
}
