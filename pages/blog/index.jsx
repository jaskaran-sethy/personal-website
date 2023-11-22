import Layout, {Content, Footer, Metadata, NavBar, Sidebar} from '../../components/layout'
import BlogCard from "./blogCard";
import style from "./index.module.css";
import React, {useState} from "react";
import Button from "../../components/button";
import Head from "next/head";

export default function BlogPage() {
    const [blogId, setBlogId] = useState(0);
    const [buttonStates, setButtonStates] = useState([true, false, false]);

    function handleClick(idx, buttonIndex) {
        setBlogId(idx);
        const newButtonStates = buttonStates.map((state, index) => index === buttonIndex)
        setButtonStates(newButtonStates);

    }
    const buttonClasses = buttonStates.map((state) => {
        if (state) return "blogButtonActive";
        else return "blogButton";
    })
    return (
        <Layout>
            <Head>
                <Metadata />
            </Head>
            <NavBar/>
            <div className={style.mainWrapper}>
                <Content className={style.content}>
                    <BlogCard className={style.blogCard} blogId={blogId}/>
                </Content>
                <Sidebar className={style.sideBar}>
                    <Button text="Cookies" icon="🍪" onButtonClick={() => handleClick(0, 0)} buttonClass={buttonClasses[0]} />
                    <Button text="Milk" icon="🥛" onButtonClick={() => handleClick(1, 1)} buttonClass={buttonClasses[1]} />
                    <Button text="Yum" icon="😋" onButtonClick={() => handleClick(2, 2)} buttonClass={buttonClasses[2]} />
                </Sidebar>
            </div>
            <Footer/>
        </Layout>
    );
}