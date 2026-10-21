// Joins class names, skipping falsy ones: cx("a", isActive && "b").
export default function cx(...classNames) {
    return classNames.filter(Boolean).join(" ");
}
