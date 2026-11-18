# instagram-scraper-js

[![npm](https://img.shields.io/npm/v/socialapis-sdk?cacheSeconds=300&label=npm&logo=npm)](https://www.npmjs.com/package/socialapis-sdk)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-blue.svg)](https://nodejs.org)

> Modern TypeScript/JavaScript alternative to abandoned Node.js Instagram scrapers — [`instagram-web-api`](https://github.com/jlobos/instagram-web-api) (1.5k stars, dead since 2020), `instagram-private-api` (3.7k stars, sporadically maintained), and the long tail of broken Puppeteer-based packages. Hosted backend means it doesn't break when Instagram updates their interface, **and you don't need an Instagram account, login cookies, or to risk your IG account getting flagged.**

This repo is a **migration landing page** + working examples. The actual SDK lives at [`SocialAPIsHub/socialapis-js`](https://github.com/SocialAPIsHub/socialapis-js) and ships as the [`socialapis-sdk`](https://www.npmjs.com/package/socialapis-sdk) package on npm.

```bash
npm install socialapis-sdk
```

```ts
import { InstagramScraper } from "socialapis-sdk"; // alias of Instagram

const ig = new InstagramScraper({ apiToken: "..." });
const profile = await ig.getProfileDetails("instagram");
console.log(profile.username, profile.followers_count, profile.media_count);

const posts = await ig.getProfilePosts("instagram");
for (const post of posts.data ?? []) {
  console.log(post.caption?.slice(0, 80));
}
```

**[Get a free API token →](https://socialapis.io/auth/signup)** — 200 calls/month, no credit card

---

## Why this exists

The Node.js Instagram-scraping ecosystem has been collapsing for years. The two most popular libraries:

- **`instagram-web-api`** (~1.5k stars): no commits since 2020. Open issues full of "doesn't work anymore" reports.
- **`instagram-private-api`** (~3.7k stars): sporadic maintenance, requires Instagram credentials, **flags your IG account** because it logs in on every request.

Plus the long tail of Puppeteer wrappers that all break the same way when Instagram pushes a UI update.

If you're here because:

- Your existing scraper returns empty arrays or 403s
- You searched for "instagram scraper node alternative" or "instagram-web-api fork"
- Your Instagram account got flagged / disabled from scraping with `instagram-private-api`
- You want Instagram public data without logging into Instagram
- You're tired of running Puppeteer just to read a public profile

…this is the modern replacement. Same idea (Instagram public data via Node.js) but the actual scraping runs on a hosted API ([socialapis.io](https://socialapis.io)) — so when Instagram changes their interface, **we fix it**. Your code doesn't change. And **no Instagram credentials are involved**.

## Side-by-side migration

```ts
// BEFORE — instagram-private-api (requires your IG account, login-flagging risk)
import { IgApiClient } from "instagram-private-api";

const ig = new IgApiClient();
ig.state.generateDevice("YOUR_IG_USERNAME");
await ig.account.login("YOUR_IG_USERNAME", "YOUR_IG_PASSWORD");
const user = await ig.user.searchExact("instagram");
const feed = ig.feed.user(user.pk);
const posts = await feed.items();
```

```ts
// AFTER — socialapis-sdk (one HTTP call, no IG account needed, typed)
import { InstagramScraper } from "socialapis-sdk";

const ig = new InstagramScraper({ apiToken: "..." });
const profile = await ig.getProfileDetails("instagram");
const posts = await ig.getProfilePosts("instagram");
// profile.username, profile.followers_count, profile.is_verified, ...
// All typed, IDE autocomplete, no IG login, no detection risk
```

`InstagramScraper` is an exact alias of `Instagram` from `socialapis-sdk` — identical class, identical methods, just a different name so your grep-replace migration stays a one-liner.

Full working example: [`examples/migrate.ts`](examples/migrate.ts).

## Method-by-method mapping

| Common Node scraper API | `socialapis-sdk` |
|---|---|
| `ig.user.searchExact(username)` / `ig.user.info(pk)` | `new InstagramScraper({apiToken}).getProfileDetails(username)` |
| `ig.feed.user(pk).items()` | `.getProfilePosts(username)` |
| Stories highlights via private API | `.getProfileHighlights(user_id)` + `.getHighlightDetails(highlight_id)` |
| Reels feed via scraping | `.getProfileReels(user_id)` / `.getReelsFeed()` |
| Search via web scrape | `.search(keyword)` |
| Location tag posts | `.getLocationPosts(location_id, { tab: "ranked" })` |
| **IG login** (account-flagging risk) | **Not needed** — no IG credentials anywhere |
| Device fingerprint / cookies / 2FA | **Not needed** |
| Puppeteer browser | **Not needed** |

## What you get on top of common scrapers

The hosted API exposes 13 Instagram endpoints + 35 Facebook + 3 Account, all from the same SDK. From the `InstagramScraper` (or `Instagram`) instance:

```ts
// Profiles + their numeric IDs
await ig.getUserId("instagram");
await ig.getProfileDetails("instagram");
await ig.getProfilePosts("instagram");
await ig.getProfileReels("25025320");
await ig.getProfileHighlights("25025320");
await ig.getHighlightDetails("17914256252161608");

// Individual posts by shortcode
await ig.getPostId("https://www.instagram.com/p/DMF-GjGO0-q/");
await ig.getPostDetails("DMF-GjGO0-q");

// Reels — trending feed + audio-track discovery
await ig.getReelsFeed();
await ig.getReelsByAudio("1028713130625019");

// Search + locations
await ig.search("travel");
await ig.getLocationPosts("454547536", { tab: "ranked" });
await ig.getNearbyLocations("454547536");
```

Full method list + TypeScript response types: [main SDK README →](https://github.com/SocialAPIsHub/socialapis-js#readme)

## Comparison at a glance

| | `instagram-private-api` / Puppeteer scrapers | `socialapis-sdk` (2026) |
|---|---|---|
| **Maintenance** | Sporadic; major bugs sit unfixed | Active; 7M+ calls/month in prod |
| **Reliability** | Breaks on every Instagram UI change | Hosted backend; we absorb breakage |
| **Auth required** | Your Instagram username + password (or cookies) | Single `x-api-token` header, 200 free calls/month |
| **Risk to your IG account** | Real — login-based scraping gets flagged | None (no login required) |
| **Type hints** | Manual `interface { ... }` | Strict TypeScript types ship with the package |
| **HTTP client** | Login session + private API mimicry, OR headless browser | Native `fetch` |
| **Browser dependency** | Often Puppeteer (~150MB) | None |
| **Detection risk** | High — gets blocked, accounts disabled | None — we handle it |
| **Surface area** | Whatever works that day | 13 Instagram endpoints + 35 Facebook + Account |

## Pricing

| Tier | Calls / month | Price |
|---|---|---|
| **Free** | 200 | $0 |
| Pro | 1,500 | $4.99 |
| Ultra | 30,000 | $49 |
| Mega | 120,000 | $179 |
| Enterprise | Custom | [Contact us](https://socialapis.io/contact-us) |

One credit per successful call. Failed calls (4xx caused by bad input) don't consume credits.

## Free live follower badge

Show a public Instagram account's follower count on your website or README, updated about once a day. No API key, no account.

[![NASA Instagram followers](https://socialapis.io/badge/instagram/nasa.svg)](https://socialapis.io/tools/instagram-follower-count?utm_source=github&utm_medium=readme&utm_campaign=badges)

```markdown
[![Instagram followers](https://socialapis.io/badge/instagram/<username>.svg)](https://socialapis.io/tools/instagram-follower-count)
```

Options: `?theme=dark`, `?style=flat`, `?label=Your%20text`. Get the HTML, Markdown or forum code for any account on the [Instagram follower count checker](https://socialapis.io/tools/instagram-follower-count?utm_source=github&utm_medium=readme&utm_campaign=badges).

## Other resources

- **Full SDK source + docs**: [SocialAPIsHub/socialapis-js](https://github.com/SocialAPIsHub/socialapis-js)
- **Facebook alternative** to puppeteer-based Node scrapers: [SocialAPIsHub/facebook-scraper-js](https://github.com/SocialAPIsHub/facebook-scraper-js)
- **Python SDK** (PyPI `socialapis-sdk`): [SocialAPIsHub/socialapis-python](https://github.com/SocialAPIsHub/socialapis-python)
- **Go SDK**: [SocialAPIsHub/socialapis-go](https://github.com/SocialAPIsHub/socialapis-go)
- **Hosted API docs**: [docs.socialapis.io](https://docs.socialapis.io)
- **Status page**: [socialapis.io/status](https://socialapis.io/status)
- **Telegram (fastest support)**: [t.me/socialapis](https://t.me/socialapis)
- **Email**: [support@socialapis.io](mailto:support@socialapis.io)

## License

MIT — see [LICENSE](LICENSE).

The `socialapis-sdk` package this repo points at is also MIT-licensed. Both are open source; the hosted scraping API is the commercial layer.
