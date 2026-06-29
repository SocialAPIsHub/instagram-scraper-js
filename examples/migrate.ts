/**
 * Side-by-side migration example: Node.js Instagram scrapers → socialapis-sdk.
 *
 * The two most popular libraries — `instagram-web-api` (dead since 2020)
 * and `instagram-private-api` (requires your IG credentials, flags your
 * account) — both need login or break frequently. This example shows the
 * modern equivalent: one HTTP call, typed response, no Instagram account
 * involved.
 *
 * Run this:
 *     1. Sign up free at https://socialapis.io/auth/signup
 *     2. export SOCIALAPIS_TOKEN="<paste your token from the dashboard>"
 *     3. npm install socialapis-sdk
 *     4. npx tsx examples/migrate.ts   (or compile + run)
 */

// ---------------------------------------------------------------------------
// BEFORE — instagram-private-api (login-based scraping, account-flagging risk)
// ---------------------------------------------------------------------------
//
// import { IgApiClient } from "instagram-private-api";
//
// const ig = new IgApiClient();
// ig.state.generateDevice("YOUR_IG_USERNAME");
// await ig.account.login("YOUR_IG_USERNAME", "YOUR_IG_PASSWORD");
// const user = await ig.user.searchExact("instagram");
// const feed = ig.feed.user(user.pk);
// const posts = await feed.items();

// ---------------------------------------------------------------------------
// AFTER — socialapis-sdk (no Instagram account, one HTTP call, typed)
// ---------------------------------------------------------------------------

import {
  InstagramScraper,
  InsufficientCreditsError,
  RateLimitError,
} from "socialapis-sdk";

async function main(): Promise<void> {
  const token = process.env.SOCIALAPIS_TOKEN;
  if (!token) {
    console.error(
      "Set SOCIALAPIS_TOKEN — sign up free at https://socialapis.io/auth/signup",
    );
    process.exit(1);
  }

  // InstagramScraper is an alias of Instagram from socialapis-sdk.
  // Same class, same methods, identical behaviour — just a name that
  // mirrors common Node scraper conventions for greppable migrations.
  const ig = new InstagramScraper({ apiToken: token });

  let profile;
  try {
    profile = await ig.getProfileDetails("instagram");
  } catch (err) {
    if (err instanceof RateLimitError) {
      console.error(`Rate-limited. Wait ${err.retryAfterSeconds}s and retry.`);
      process.exit(1);
    }
    if (err instanceof InsufficientCreditsError) {
      console.error("Out of credits. Upgrade at https://socialapis.io/pricing");
      process.exit(1);
    }
    throw err;
  }

  // Same data instagram-private-api returned (and more), but typed —
  // profile.username not profile.user.username
  console.log(`Profile: @${profile.username}`);
  console.log(`  Full name: ${profile.full_name}`);
  console.log(
    profile.followers_count
      ? `  Followers: ${profile.followers_count.toLocaleString()}`
      : "  Followers: n/a",
  );
  console.log(`  Media:     ${profile.media_count}`);
  console.log(`  Verified:  ${profile.is_verified}`);
  console.log(`  Private:   ${profile.is_private}`);

  // Equivalent of feed.user(pk).items() — paginate via cursors instead
  // of stateful feed iterators. The API decides page size.
  const posts = await ig.getProfilePosts("instagram");
  const sample = (posts.data as Array<Record<string, any>> | undefined) ?? [];
  for (const post of sample.slice(0, 5)) {
    const caption: string = post.caption ?? post.text ?? "";
    const mediaUrl = post.media_url ?? post.display_url ?? "?";
    console.log(`  ${caption.slice(0, 60)}  →  ${mediaUrl}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
