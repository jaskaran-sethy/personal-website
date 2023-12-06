import styles from './layout.module.css';
import NavBar from './navbar'
import Metadata from './metadata'
import Header from './header'
import Footer from './footer'
import Content from './content'
import Card from "./card";
import Sidebar from "./sidebar";
import BackgroundImage from "./backgroundImage";
import DownArrow from "./downArrow";


export default function Layout({ children }) {
    return <div className={styles.container}>{children}</div>;
}

export {
    Metadata,
    NavBar,
    BackgroundImage,
    Header,
    Footer,
    Content,
    Card,
    Sidebar,
    DownArrow
}