// A link that opens in a new tab without handing the new page `window.opener`.
export default function ExternalLink(props) {
    return <a target="_blank" rel="noopener noreferrer" {...props}/>;
}
