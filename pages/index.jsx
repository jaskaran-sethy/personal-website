import Head from 'next/head';
import Layout, { Metadata, Header, NavBar, Content, Footer, Card } from '../components/layout';
import useSWR from 'swr';

export default function HomePage() {
    return (<Layout>
            <Head>
                <Metadata />
            </Head>
            <Header/>
            <NavBar/>
            <Content>
                <Card image={true} />
            </Content>
            <Footer/>
        </Layout>
    );
}



