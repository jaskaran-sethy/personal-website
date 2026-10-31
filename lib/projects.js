import {GITHUB_URL} from "./site";

// Shown on the home page and on /projects.
export const FEATURED_PROJECT = {
    title: "Breathe",
    kicker: "ANDROID · KOTLIN · JETPACK COMPOSE",
    description: "A calm, offline breathing app. Four rhythms, three visual guides — an orb, a tide, a trace of light — and badges you can never lose.",
    image: "/projects/breathe-lake.webp",
    icon: "/projects/breathe-icon.webp",
    href: `${GITHUB_URL}/meditation-app`,
};

// `crop` mirrors the image fill transform in the design: size and offset as fractions of the frame.
export const PROJECTS = [
    {
        title: "Insight Extractor",
        kicker: "NLP · WEB TOOL",
        description: "Product Insights in the browser: paste feedback or a product link, get every opinion by topic and sentiment.",
        image: "/projects/insight-dark.jpg",
        crop: {w: 1, h: 1, x: 0, y: 0}, // Made for the card, so shown whole.
        href: "/games/insight-extractor",
    },
    {
        title: "Mermaid Nixie",
        kicker: "OBSIDIAN PLUGIN",
        description: "Vault-wide Mermaid layouts: the ELK engine, right-angle edges and spacing that actually applies.",
        image: "/projects/mermaid-dark.jpg",
        crop: {w: 1.724, h: 1.724, x: -0.345, y: -0.310},
        href: `${GITHUB_URL}/obsidian-mermaid-nixie`,
    },
    {
        title: "Nested List Numbers",
        kicker: "OBSIDIAN PLUGIN",
        description: "Numbered lists that know their parents, so item 1 under 2.2 reads as 2.2.1.",
        image: "/projects/nested-dark.jpg",
        crop: {w: 1.667, h: 1.667, x: -0.317, y: -0.167},
        href: `${GITHUB_URL}/obsidian-nested-list-numbers`,
    },
];
