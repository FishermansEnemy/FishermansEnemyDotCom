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

The `.github/workflows/pages.yml` workflow builds the site with GitHub's Pages Jekyll action and deploys it when changes are pushed to `main`. In the repository's GitHub settings, set **Pages → Build and deployment → Source** to **GitHub Actions**. The `CNAME` file is retained for `fishermansenemy.com`; make sure the domain is configured in the repository's Pages settings and its DNS still points at GitHub Pages.

If the repository publishes from a branch instead of using Actions, use **Deploy from a branch**, select the `main` branch and `/ (root)` folder. GitHub Pages recognises `_config.yml`, `Gemfile`, and `Gemfile.lock` directly.
