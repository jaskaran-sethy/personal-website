import '/styles/global.css';
import '/styles/button.css';
import { Poppins } from 'next/font/google'

const poppins = Poppins({
    weight: ['100', '200', '400', '700'],
    subsets: ['latin']
});

export default function App({ Component, pageProps }) {
    return (
        <main className={poppins.className}>
            <Component {...pageProps} />
        </main>
        );
}