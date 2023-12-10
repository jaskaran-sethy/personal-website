import style from "./footer.module.css";
import IconLink from "./iconLink";

export default function Footer() {
    return (
        <footer className={style.footer}>
            <div className={style.copyright}>
                © 2023 Jaskaran Sethy
            </div>
            <div className={style.icons}>
                <IconLink src="/logos/githubIcon.svg" link="https://www.github.com/jaskaran-sethy/" />
                <IconLink src="/logos/linkedInIcon.png" link="https://www.linkedin.com/in/jaskaran-sethy/" width={28} height={28} />
                <IconLink src="/logos/instagramIcon.png" link="https://www.instagram.com/sethyrical" width={27}/>
            </div>
        </footer>
    );
}