# MDB (Mode Mobile)

A mobile app that helps people find and claim money from class-action settlements, in the style of the Payout app. Built with Expo (SDK 58), React Native and Expo Router, with Supabase as the backend.

- **Home**: open settlements (featured carousel plus a filterable list), with the brands you picked at onboarding shown first. A menu in the header explains how class actions work.
- **Settlement details**: the full write-up and a **Get Started** button that files your claim.
- **Wallet**: your claims, an estimated payout total, and live status updates.
- **Forms**: the forms opened for your claims, filterable by status.
- **First run**: onboarding (pick brands and a payout method, see your estimated claimable total), then a paywall and a one-time offer. There are no real purchases yet; the paywall buttons only set a dev flag.

There is no sign-up screen. Each install signs in anonymously and keeps its session, so everything is tied to that device's anonymous user.

## Setup

You need Node, npm and a free [Supabase](https://supabase.com) project.

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Add your Supabase keys.** Copy the example file and fill it in (Supabase dashboard, Project Settings, API Keys):

   ```bash
   cp .env.example .env
   ```

   | Variable | What it is |
   | --- | --- |
   | `EXPO_PUBLIC_SUPABASE_URL` | Your project URL |
   | `EXPO_PUBLIC_SUPABASE_KEY` | The **publishable** key (`sb_publishable_...`). Safe to ship in the app; row level security protects the data. |
   | `SUPABASE_SECRET_KEY` | The **secret** key (`sb_secret_...`). Used only by `backend/seed.ts` and `backend/scraper.ts`. Never put it in an `EXPO_PUBLIC_` variable. |

   `.env` is gitignored. Restart the dev server after changing it.

3. **Create the database.** In the Supabase SQL editor, paste and run `supabase/schema.sql`. It creates the tables, row level security policies, the profile-on-signup trigger and realtime for claims and forms. It is safe to re-run.

4. **Enable anonymous sign-ins.** Supabase dashboard, Authentication, Sign In / Providers, turn on **Allow anonymous sign-ins**. Without this the app can't sign in.

5. **Seed the settlements.**

   ```bash
   npm run seed
   ```

   Upserts 15 settlements (the placeholder Instagram rows plus Apple, Tesla, Meta, Google, DoorDash, Amazon, Fortnite, Spotify and Pepsi). Safe to re-run.

6. **(Optional) Scrape live settlements.**

   ```bash
   npm run scrape             # fetch and save
   npm run scrape -- --dry-run  # parse and print only; no keys needed
   ```

   Reads the public listing at [claimdepot.com/settlements](https://www.claimdepot.com/settlements) (it re-checks `robots.txt` on every run) and upserts the open settlements, so re-runs don't duplicate. If the site's layout changes it stops with a message and leaves your data alone.

7. **Start the app**

   ```bash
   npx expo start
   ```

   Then open it in the iOS simulator, an Android emulator, Expo Go, or the browser (press `w`).

## Dev tools (`?dev`)

A small panel at the bottom of Home, Wallet and Forms lets you switch the data source (**Live**, **Sample**, **Empty**, **Error**) to check every UI state, and **Reset onboarding** to replay the first-run flow. It is hidden unless the build is a development build **and** the app was opened with a `dev` flag:

- **Web:** open `http://localhost:8081/?dev`
- **Device / simulator:** open a link that ends in `?dev`, for example `exp://<your-computer-ip>:8081/--/?dev` in Expo Go, or `mdbapp://?dev` in a development build.

Once seen, the flag stays on for that session. Release builds never show these tools.

## Commands

| Command | What it does |
| --- | --- |
| `npx expo start` | Start the dev server |
| `npm run seed` | Seed the settlements table |
| `npm run scrape` | Scrape and upsert live settlements (`-- --dry-run` to preview) |
| `npx expo lint` | Lint |
| `npx tsc --noEmit` | Typecheck |

## Project structure

```
src/
  app/                  Expo Router routes (every file is a screen)
    _layout.tsx           Root layout: loads the profile, then shows onboarding or the tabs
    onboarding.tsx        The whole first-run flow (onboarding, paywall, offer) on one route
    (tabs)/               Home (index), Wallet, Forms
    settlement/[id].tsx   Settlement details + Get Started
  components/           Screen pieces (rows, cards, headers, modals)
    onboarding/           The reusable OnboardingScreen, heroes, brand grid, paywall, offer
    ui/                   Small building blocks (Button, Card, Chip, Badge, BrandAvatar, InfoModal)
  data/
    onboarding.ts         Copy, order and options for every onboarding step
    placeholder.ts        Sample data behind the dev "Sample" source
  hooks/                Data hooks (settlements, claims, forms, realtime list, dev mode)
  lib/
    supabase.ts           Supabase client and the anonymous sign-in
    api.ts                All reads, mapped into the shapes the UI uses
    claims.ts             startClaim()
    profile.tsx           Profile context: onboarding stage, saved answers, reset
    dev-flags.ts          The dev "plan" flag the paywall sets
  utils/                Formatting and filtering helpers
  constants/            Theme and palette
backend/
  seed.ts               Seeds settlements (secret key)
  scraper.ts            Scrapes live settlements (secret key)
supabase/
  schema.sql            Tables, RLS, trigger, realtime
assets/images/          Icons and the onboarding background and logo
```

## How the data is protected

Row level security is on for every table. Settlements are read-only to the app. Profiles, claims and forms can only be read and inserted by their owner (profiles can also be updated by their owner), and claims can never be updated or deleted from the app. New claims must start at the default status, so a client can't award itself a payout. Only the seed and scrape scripts write settlements, using the secret key, which bypasses RLS and must stay on your machine.
