// The one place the public address lives. Every canonical, Open Graph,
// JSON-LD, sitemap and robots URL is built from SITE_URL at build time, so
// moving the site (another Netlify name, a custom domain, Cloudflare Pages,
// GitHub Pages) means changing this line or setting SITE_URL in the host's
// build environment.
export const SITE_URL = (process.env.SITE_URL || "https://dinoryde.netlify.app").replace(/\/+$/, "");

// Swap to the real listing once DinoRyde is live (see README > App Store).
export const APP_STORE_URL = process.env.APP_STORE_URL || "";

export const CONTACT_EMAIL = "pcesnek290@gmail.com";
