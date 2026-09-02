import style from './tagBadges.module.css';

export function formatTag(tag) {
    return tag.replace(/-/g, ' ');
}

export default function TagBadges({tags}) {
    if (!tags || !tags.length) return null;
    return (
        <div className={style.tagBadges}>
            {tags.map((tag) => (
                <span key={tag} className={style.tagBadge}>{formatTag(tag)}</span>
            ))}
        </div>
    )
}
