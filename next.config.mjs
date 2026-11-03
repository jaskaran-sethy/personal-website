// The whole site is prerendered to plain files in out/, which Cloudflare serves as Workers static assets (see
// wrangler.jsonc). Redirects for taken-down pages live in public/_redirects.
export default {
    output: "export",
};
