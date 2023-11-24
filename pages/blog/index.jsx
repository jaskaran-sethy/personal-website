import Layout, {Content, Footer, Metadata, NavBar, Sidebar} from '../../components/layout'
import BlogCard from "./blogCard";
import style from "./index.module.css";
import React, {useState} from "react";
import Button from "../../components/button";
import Head from "next/head";

export default function BlogPage() {
    const [blogId, setBlogId] = useState("book-review-mindset");
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
                    <Button text="📚🧠 Mindset" onButtonClick={() => handleClick("book-review-mindset", 0)} buttonClass={buttonClasses[0]} />
                    <Button text="📚🛠️ Ikigai" onButtonClick={() => handleClick("book-review-ikigai", 1)} buttonClass={buttonClasses[1]} />
                    <Button text="📚🗪 Crucial Conversations" onButtonClick={() => handleClick("book-review-crucial-conversations", 2)} buttonClass={buttonClasses[2]} />
                </Sidebar>
            </div>
            <Footer/>
        </Layout>
    );
}