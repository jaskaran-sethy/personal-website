import '/styles/global.css';

// Fonts and theme come from SiteShell on each page; this only adds the global reset.
export default function App({ Component, pageProps }) {
    return <Component {...pageProps} />;
}
