import styles from './layout.module.css';
import NavBar from './navbar'
import Metadata from './metadata'
import Header from './header'
import Footer from './footer'
import Content from './content'

export default function Layout({ children }) {
    return <div className={styles.container}>{children}</div>;
}

export {
    Metadata,
    NavBar,
    Header,
    Footer,
    Content
}