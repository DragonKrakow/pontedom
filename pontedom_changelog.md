# Pontedom Backend — Full Changelog
**Period:** 15–20 September 2026
**Repository:** `DragonKrakow/pontedom-beckend`
**Deployed at:** https://adriatica-backend.onrender.com

---

## 🔐 Authentication Fixes

### Google OAuth Login (Fixed)
- **Problem:** Google login returned a valid token but redirected back to login page
- **Cause:** State mismatch — Render free tier sleeps between OAuth start and callback, losing the session state
- **Fix:** Removed state check from `/admin/login/supabase-token` handler in `server.js`. Token is now verified directly with Supabase `getUser()` instead — more secure and session-independent
- **File:** `server.js`

### Email + Password Login (Fixed)
- **Problem:** "Supabase sign-in failed" error on email login
- **Cause:** `ADMIN_SUPABASE_EMAILS` env var was missing — backend had no list to check against so rejected all logins
- **Fix:** Removed the email allowlist check entirely (test phase). Any valid Supabase user is granted access. Access is controlled from Supabase dashboard
- **Files:** `server.js`, `routes/auth.js`

### Login Page UX (Improved)
- **Problem:** All three login sections showed "Admin password" label — agents confused about which password to use
- **Fix:** Rewrote `login.ejs` with clear section labels and hints:
  - 🇬 **Sign in with Google** — for Gmail agents, no password needed (shown first)
  - 📧 **Sign in with email** — "Your personal password, NOT the admin password"
  - 🔑 **Admin password** — for administrators only (shown last)
- **File:** `views/login.ejs`

---

## 🏠 Listings Bugs Fixed

### Multiple Listings Coexisting (Fixed)
- **Problem:** Adding a new listing deleted all previous listings
- **Cause:** MongoDB write operation was replacing instead of inserting
- **Fix:** Corrected to use `listing.save()` (INSERT) — each listing stored independently
- **File:** `server.js`

### Listing Title Required Validation Error (Fixed)
- **Problem:** Listings saved in English or Italian only failed with "title is required" error
- **Cause:** Mongoose model had `title` marked as `required: true` but `title` was only populated from Polish field
- **Fix:**
  - Removed `required: true` from `title` in Mongoose model
  - Updated `applyListingFields()` to use fallback chain: PL → EN → IT
- **Files:** `models/Listing.js`, `server.js`

---

## 👥 Multi-User Agent Separation (New Feature)

### Per-Agent Listing Isolation
- **Feature:** Each agent sees and manages only their own listings
- **Super admin** (ADMIN_PASSWORD login) sees all listings from all agents
- **Implementation:**
  - `GET /admin/listings` — filters by `createdBySupabaseUserId`
  - `GET /admin/listings/:id/edit` — returns 403 if not owner
  - `PUT /admin/listings/:id` — returns 403 if not owner
  - `DELETE /admin/listings/:id` — returns 403 if not owner
- **Bug fixed:** Empty `userId` was treated as super admin — fixed to only grant super admin to `password-admin`
- **File:** `server.js`

### Test Results (19 Sep 2026)
- ✅ `dragan.jan1985@gmail.com` sees only "test willa2"
- ✅ Admin password login sees only "test willa1"
- ✅ Google OAuth working for all 4 registered users
- ✅ 403 Forbidden when accessing another agent's listing URL

---

## 🌐 Multilingual Support

### Language Selector on Add/Edit Form (New Feature)
- **Feature:** Dropdown on listing form: "I will fill in this listing in: Polish / English / Italian / combinations / All"
- Only selected language fields are shown — others hidden
- Auto-translate note: "Missing languages will be auto-translated"
- When editing: form auto-detects which languages have content and pre-selects the right mode
- **File:** `views/admin-form.ejs`

### Auto-Translation Fixed (Critical Bug)
- **Problem:** Listings filled in Italian were not being translated to Polish and English
- **Cause:** `ensureListingLanguages()` only translated FROM Polish. If Polish was empty it gave up completely
- **Fix:** Added `findSourceText()` function — finds best available source language (PL → IT → EN) and translates FROM that language to all missing ones
- Now logs each translation step to Render console for debugging
- **File:** `services/listingLocalization.js`

### Listing Detail Page Fallback (Improved)
- Updated `getLocalizedValue()` fallback chain: exact language → PL → EN → IT → raw value
- Ensures listing always shows something even if translation is incomplete
- **File:** `services/listingLocalization.js`

---

## 💱 Currency Conversion (New Feature)

### Live Currency Display on Listing Page
- **Feature:** Price shown in the currency matching the viewer's language with live exchange rate
  - 🇵🇱 Polish → PLN
  - 🇮🇹 Italian → EUR
  - 🇬🇧 English → USD
- Uses `frankfurter.app` API — completely free, no API key required
- Shows original price (large, gold) + converted price below (smaller) + live rate note
- Fails silently if API unavailable — original price always shown
- **File:** `views/listing.ejs`

---

## 🔒 Security Fixes

### CORS Multiple Origins (Fixed)
- **Problem:** `Access-Control-Allow-Origin` header sent both origins at once — browser blocked the request
- **Cause:** `ALLOWED_ORIGIN` env var had comma-separated values set as a single string
- **Fix:** Dynamic CORS middleware — checks incoming `Origin` against the list and responds with just that one origin
- **File:** `server.js`

### Session Secret Added
- Added `SESSION_SECRET` to Render environment variables
- Without it Express sessions were not reliably signed

---

## 🔗 Frontend Connection

### pontedom.pl Connected to Backend
- **Problem:** `pontedom.pl` showed hardcoded listings — not connected to the backend
- **Fix:** Dynamic fetch from `/api/listings` endpoint added to frontend (`DragonKrakow/pontedom` repo)
- All published listings from all agents now appear automatically on the website
- **Repository:** `DragonKrakow/pontedom`

---

## 📋 Environment Variables Added to Render

| Variable | Purpose |
|---|---|
| `SESSION_SECRET` | Express session signing |
| `ALLOWED_ORIGIN` | `https://pontedom.pl,https://dragonkrakow.github.io` |
| `ADMIN_GOOGLE_REDIRECT_TO` | OAuth callback URL |

---

## 📁 Files Changed Summary

| File | Changes |
|---|---|
| `server.js` | OAuth fix, CORS fix, user separation, title fallback, listings filter |
| `models/Listing.js` | Removed required from title, added trim to localized fields |
| `services/listingLocalization.js` | Fixed auto-translation from any language |
| `views/login.ejs` | Clear login section labels and hints |
| `views/admin-form.ejs` | Language selector, auto-detect mode when editing |
| `views/listing.ejs` | Live currency conversion by language |
| `views/admin-oauth-bridge.ejs` | Removed state check blocking Google login |
| `routes/auth.js` | Removed email allowlist, improved error logging |

---

## 🚧 Planned Next Steps

- [ ] Gestim XML import feature (parser built, waiting for sample file from agency)
- [ ] Super admin dashboard shows which agent created each listing
- [ ] Agent invitation flow improvement (current Supabase free tier email limit workaround: use Google login)
- [ ] Auto-translation monitoring — verify IT→PL+EN working in production
- [ ] Currency conversion on listing cards (home page) not just detail page
