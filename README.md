# SlowPour

### Every cup has a story.

SlowPour is a personal coffee journal for the beans you bring home, the recipes you repeat, and the little changes that make a brew click. Follow each coffee from the first bag to the last sip, then keep what you learn for next time.

![SlowPour's coffee loop: coffee, recipe, brew, reflect](public/assets/slowpour-brew-loop.svg)

## A journal for the whole brew

- **Coffee shelf:** keep coffees and open or finished bags together, with their origin and processing details.
- **Recipe notebook:** save repeatable brew methods and settings, then choose a go-to recipe for each coffee.
- **Brew journal:** use the timer, log what you brewed, and keep tasting notes alongside the recipe you followed.
- **Your setup:** track grinders, brewers, scales, and kettles so each brew has useful context.
- **Insights:** revisit your brew history to spot favorite coffees and methods.

The idea is simple: keep the useful details close, but make recording a cup feel more like journaling than filling out a spreadsheet.


## Your journal, kept between cups

Accounts and journal data are stored in Postgres. A new account starts with example coffees and brews to explore. If you used the earlier browser demo, Settings has an explicit import button; the browser copy remains untouched.

## Run your own

Install dependencies with `npm install`, put a Postgres connection URI in `DATABASE_URL` (see `.env.example`), run `npm run db:migrate`, then `npm run dev`. On Vercel, set `DATABASE_URL` for production and preview before deploying.

The Next.js route handlers provide account registration, sign in, sessions, and account-scoped journal reads and writes. The current UI saves a journal snapshot as one document; the migration also defines domain tables for a future move to granular record endpoints.
