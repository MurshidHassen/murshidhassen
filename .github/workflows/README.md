# GitHub Actions Build Pipeline

## Overview

This repository includes two GitHub Actions workflows for continuous integration and deployment:

### 1. **Build and Deploy** (`build.yml`)
Automatically builds the Jekyll site and deploys to GitHub Pages on every push to `main` or `master` branch.

**Workflow Steps:**
- Checkout code
- Setup Ruby 3.2 with bundler caching
- Setup Node.js 18 with npm caching
- Install dependencies
- Build Jekyll site with `bundle exec jekyll build`
- Validate HTML output
- Upload build artifacts
- Deploy to GitHub Pages (on main branch only)

**Triggers:** Push to `main`/`master`, Pull requests

### 2. **Code Quality** (`quality.yml`)
Runs linting, markdown checks, and security audits.

**Workflow Steps:**
- Ruby syntax checks
- Markdown linting with `mdl`
- Security vulnerability scanning with `bundler-audit`

**Triggers:** Push to `main`/`master`, Pull requests

## Setup Instructions

### 1. Enable GitHub Pages

1. Go to your repository settings: **Settings** → **Pages**
2. Under "Build and deployment":
   - Set **Source** to "GitHub Actions"
3. Save

### 2. Configure Branch Protection (Optional)

1. Go to **Settings** → **Branches**
2. Add a branch protection rule for `main`
3. Enable "Require status checks to pass before merging"
4. Select:
   - `build` job
   - `lint` job
   - `security` job

### 3. Verify Workflows

- Go to **Actions** tab to view workflow runs
- Each push and PR will trigger the workflows
- Build status appears in PR checks

## Environment Variables

If you need to add secrets for deployments (e.g., `GITHUB_TOKEN` is auto-supplied):

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click "New repository secret"
3. Add any required variables

## Customization

### Update Ruby Version
Edit `.ruby-version` or modify `ruby-version` in workflows (currently `3.2`)

### Disable HTML Validation
Comment out or remove the HTML proofer step in `build.yml` if it causes issues

### Add More Checks
Extend the quality workflow with additional tools:
- ESLint for JavaScript
- StyleLint for CSS
- Additional security scanners

## Deployment Notes

- The `deploy` job only runs on `main`/`master` branch merges
- PRs will run build and quality checks but won't deploy
- Deployment requires the `id-token: write` permission (already configured)
- GitHub Pages URL will be: `https://username.github.io/murshidhassen`

## Troubleshooting

**Build Fails:**
- Check Ruby/Node versions in logs
- Verify `Gemfile` and `package.json` are valid
- Review build output in **Actions** → workflow run

**Deployment Issues:**
- Ensure GitHub Pages is enabled
- Check branch protection rules aren't blocking
- Verify artifacts are being created in build job

**HTML Validation Fails:**
- Disable proofer if external links are an issue
- Add `--disable-external` flag (already present)
- Review validation errors in job logs
