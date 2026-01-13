# Platform Setup Guide

**For:** Company Challenges Platform 2.0
**Date:** January 12, 2026

---

## Overview

To transfer ownership of your platform, we need you to create accounts on four services. This guide walks you through each signup process. Once complete, we'll transfer the project resources to your accounts and you'll hold the master keys to everything.

**Time required:** ~20 minutes total

---

## 1. GitHub (Code Repository)

GitHub will host your source code. This is where the master copy of your application lives.

### Steps

1. Go to **[github.com/signup](https://github.com/signup)**
2. Enter your email (use your company email)
3. Create a password and username
4. Verify your account
5. **Create an organization** for your company:
   - Click your profile icon (top right) → "Your organizations"
   - Click "New organization"
   - Select **Free** plan
   - Name it something like `company-challenges` or your company name
   - Add team members if desired

### What we need from you

- Your GitHub username
- Your organization name

### Why GitHub?

- You own the source code
- Version history of all changes
- We'll show you how to connect this to Vercel for automatic deployments

---

## 2. Vercel (Hosting)

Vercel hosts your web application and handles deployments automatically when code changes.

### Steps

1. Go to **[vercel.com/signup](https://vercel.com/signup)**
2. Click **"Continue with GitHub"** (recommended - links your accounts)
3. Authorize Vercel to access your GitHub
4. When asked about a team, select **"Hobby"** for now (we can upgrade later)

### What we need from you

- Confirmation that your Vercel is connected to your GitHub

### Pricing

- **Hobby (Free):** Sufficient for testing and low traffic
- **Pro ($20/month):** Recommended for production (higher limits, team features)

---

## 3. Supabase (Database)

Supabase hosts your PostgreSQL database, authentication helpers, and file storage.

### Steps

1. Go to **[supabase.com](https://supabase.com)**
2. Click **"Start your project"** (top right)
3. Sign up with **GitHub** (recommended - keeps everything linked)
4. Once logged in, you'll see the dashboard
5. **Don't create a project yet** — we'll transfer our existing project to you

### What we need from you

- Your Supabase account email
- Your Supabase organization name (visible in dashboard URL)

### Pricing

- **Free tier:** 2 projects, 500MB database, 1GB storage
- **Pro ($25/month):** Recommended — 8GB database, 100GB storage, daily backups

> **Note:** Pro is recommended for production — includes daily backups and no project pausing.

---

## 4. Clerk (Authentication)

Clerk handles user login, signup, and session management for Individual Mode.

### Steps

1. Go to **[clerk.com](https://clerk.com)**
2. Click **"Start building for free"**
3. Sign up with **GitHub** (recommended)
4. Verify your email if required
5. Skip creating an application — we'll transfer ours to you

### What we need from you

- Your Clerk account email

### Pricing

- **Free tier:** 10,000 monthly active users
- **Pro ($25/month + usage):** Advanced features, custom domains

> **Note:** Free tier is likely sufficient for initial launch.

---

## Summary Checklist

| Platform | Signup URL | What We Need | Status |
|----------|-----------|--------------|--------|
| GitHub | [github.com/signup](https://github.com/signup) | Username + Org name | [ ] |
| Vercel | [vercel.com/signup](https://vercel.com/signup) | Connected to GitHub | [ ] |
| Supabase | [supabase.com](https://supabase.com) | Email + Org name | [ ] |
| Clerk | [clerk.com](https://clerk.com) | Email | [ ] |

---

## After Signup

Once you've created all accounts, send us:

1. **GitHub:** Username and organization name
2. **Vercel:** Confirmation it's connected to your GitHub
3. **Supabase:** Account email + organization name
4. **Clerk:** Account email

We'll then:

1. Transfer the code repository to your GitHub organization
2. Show you how to connect the repo to Vercel (automatic deployments)
3. Transfer the Supabase project to your organization
4. Transfer the Clerk application to your account
5. Guide you through DNS setup when ready to go live

**You'll hold all the master keys** — full ownership of code, database, and auth.

---

## Questions?

If you run into any issues during signup, reach out via Slack or WhatsApp. Happy to do a quick screen share if helpful.

---

## Cost Summary (Monthly)

| Service | Free Tier | Production |
|---------|-----------|------------|
| GitHub | $0 | $0 (Free for public/private repos) |
| Vercel | $0 | $20/month |
| Supabase | $0 | $25/month |
| Clerk | $0 | $25/month (if needed) |
| **Total** | **$0** | **$45-70/month** |

> Start with free tiers for testing. Upgrade before client pilots or production launches.
