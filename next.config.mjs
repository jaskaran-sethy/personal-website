// Games that were taken down. Their pages were indexed, so each one sends visitors (and search engines) on to
// /games for good rather than to a 404.
const REMOVED_GAMES = [
    "tic-tac-toe", "memory", "snake", "2048", "minesweeper", "connect-four", "sliding-puzzle", "word-guess", "simon",
    "lights-out", "whack-a-mole", "typing",
];

export default {
    async redirects() {
        return REMOVED_GAMES.flatMap((id) => [
            {source: `/games/${id}`, destination: "/games", permanent: true},
            {source: `/games/${id}.md`, destination: "/games.md", permanent: true},
        ]);
    },
};
