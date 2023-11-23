import style from "./footer.module.css";
import IconLink from "./iconLink";

export default function Footer() {
    return (
        <>
            <div className={style.footer}>
                <IconLink imageSrc="/githubIcon.svg" link="https://www.github.com/jaskaran-sethy/" />
                <IconLink imageSrc="/linkedInIcon.png" link="https://www.linkedin.com/in/jaskaran-sethy-2377bb173/" width={31} height={27} />
            </div>
            <div>
                <IconLink/>
            </div>
        </>
    );
}