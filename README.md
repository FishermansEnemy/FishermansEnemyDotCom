# FishermansEnemy.com — Jekyll on GitHub Pages

The site is built with Jekyll and the GitHub Pages-compatible dependencies in `Gemfile`. Original Pelican article content and `/article-slug.html` URLs are preserved in `_posts/`. The existing `images/` directory is retained for article media and the landing-page photography.

## Local preview

Install the bundled dependencies, then run:

```sh
bundle install
bundle exec jekyll serve
```

Open `http://localhost:4000`. A standalone Jekyll executable is also available in the development environment: `jekyll build`.

## Publishing

GitHub Pages publishes the Jekyll site directly from the configured branch; no Actions build or deploy workflow is required. In repository settings, select **Pages → Build and deployment → Deploy from a branch**, then choose the `main` branch and `/ (root)` folder. The `CNAME` file is retained for `fishermansenemy.com`; configure the domain in the Pages settings and keep its DNS pointed at GitHub Pages.

The Twitch and YouTube status banner is populated in the visitor's browser by `assets/js/stream-status.js`. It polls the combined live-status endpoint once per minute; no API credentials are stored in the repository. The live-state endpoint caches results for 60 seconds and limits requests to 20 per minute per IP. Twitch live title, game, and avatar come from DecAPI. YouTube latest uploads come from the channel feed through rss2json. These third-party services can change availability or rate limits; live-state lookup failures are shown as unavailable, not offline.

The YouTube channel ID used for the uploads feed is `UCgesG-XlnAQiLmQqnDokaLA`, resolved from the confirmed `@Fishermansenemy` channel. The channel links retain the `/c/fishermansenemy/live` route.
