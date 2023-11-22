import Layout, { Metadata, NavBar, Content, Footer } from '../../components/layout';
import Head from "next/head";

export default function HomePage() {
    return (<Layout>
            <Head>
                <Metadata />
            </Head>
            <NavBar />
            <Content />
            <Footer />
        </Layout>
    );
}
