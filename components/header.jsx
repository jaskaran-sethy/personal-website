import style from './header.module.css';

export default function Header({children}) {
    return (<div className={style.header}>
        <h1>{children}</h1>
    </div>);
}