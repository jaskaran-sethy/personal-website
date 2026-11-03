// Schema.org data for search engines (rendered by components/metadata.jsx as JSON-LD). The person is described once
// on the home page; posts point back to it by its @id, so every post is credited to the same Jaskaran.
import {DEFAULT_DESCRIPTION} from "./copy";
import {EMAIL, SOCIALS, SUBSTACK_URL} from "./site";

const SITE = "https://jaskaransethy.com";
const PERSON_ID = `${SITE}/#person`;

export function personSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "Person",
        "@id": PERSON_ID,
        name: "Jaskaran Sethy",
        url: SITE,
        image: `${SITE}/suit_me.png`,
        email: `mailto:${EMAIL}`,
        description: DEFAULT_DESCRIPTION,
        jobTitle: "ML & Full Stack Engineer",
        worksFor: {"@type": "Organization", name: "Armor"},
        alumniOf: {"@type": "CollegeOrUniversity", name: "Indian Institute of Technology Roorkee"},
        sameAs: [...SOCIALS.map((social) => social.href), SUBSTACK_URL],
    };
}

export function blogPostingSchema(post) {
    const url = `${SITE}/blog/${post.slug}`;
    const image = post.thumbnail || post.image;
    return {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "@id": url,
        mainEntityOfPage: url,
        url,
        headline: post.title,
        description: post.excerpt || undefined,
        datePublished: post.date || undefined,
        image: image ? `${SITE}${image}` : undefined,
        keywords: post.tags.length ? post.tags.join(", ") : undefined,
        author: {"@id": PERSON_ID, "@type": "Person", name: "Jaskaran Sethy", url: SITE},
        publisher: {"@id": PERSON_ID},
    };
}
