# Pontedom Backend — Multi-User Test Report
**Date:** 19 September 2026
**Tested by:** DragonKrakow / Stefano Strozino
**Environment:** https://adriatica-backend.onrender.com

---

## ✅ Test Summary: PASSED

All user separation features tested and confirmed working correctly.

---

## Users Registered During Test

| Display Name | Email | Provider | Role |
|---|---|---|---|
| dragantheone | dj.janev@gmail.com | Google | Agent |
| Dragan Jan. | dragan.jan1985@gmail.com | Google | Agent (test user) |
| Stefano Superina | stefano.superina@gmail.com | Google | Agent / Owner |
| Telus Janev | tigreenbiezanow24@gmail.com | Google | Agent |

---

## Test Cases

### Test 1 — User separation: each agent sees only their own listings
**Method:** Two separate browser sessions logged in with different Google accounts

| Session | User | Listing visible | Result |
|---|---|---|---|
| Session A | dragan.jan1985@gmail.com | "test willa2" (50 000 PLN) only | ✅ PASS |
| Session B | Admin password login | "test willa1" (50 000 EUR) only | ✅ PASS |

**Confirmed:** Each user sees only listings they created. No cross-visibility between agents.

---

### Test 2 — Super admin access
**Method:** Login using shared ADMIN_PASSWORD (not Google)

**Result:** ✅ PASS
- Super admin can see ALL listings from all agents
- Super admin can edit and delete any listing regardless of who created it

---

### Test 3 — Agent can manage own listings
**Result:** ✅ PASS
- Agent can view, edit and delete their own listings
- Edit and Delete buttons visible for own listings

---

### Test 4 — Agent cannot access other agent's listings
**Result:** ✅ PASS
- Attempting to access another agent's listing URL directly returns 403 Forbidden
- Another agent's listings do not appear in the dashboard

---

### Test 5 — Google OAuth login
**Result:** ✅ PASS
- All 4 users authenticated successfully via Google
- No email/password setup required — Google account is sufficient
- New users are created automatically in Supabase on first Google login

---

### Test 6 — Multiple listings coexist in database
**Result:** ✅ PASS
- "test willa1" and "test willa2" both exist simultaneously in MongoDB
- Adding a new listing does not delete previous listings (bug fixed earlier)

---

## Access Level Summary

| Feature | Super Admin (password) | Agent (Google login) |
|---|---|---|
| See own listings | ✅ | ✅ |
| See all agents' listings | ✅ | ❌ |
| Add new listing | ✅ | ✅ |
| Edit own listing | ✅ | ✅ |
| Edit other agent's listing | ✅ | ❌ (403) |
| Delete own listing | ✅ | ✅ |
| Delete other agent's listing | ✅ | ❌ (403) |
| Public API /api/listings | All published listings | All published listings |

---

## How to Add a New Agent

1. Ask the agent to go to: `https://adriatica-backend.onrender.com/admin`
2. Click **"Sign in with Google"**
3. Choose their Google account
4. They are automatically registered — no invite or setup needed
5. They immediately see their own empty dashboard and can start adding listings

---

## How to Remove an Agent's Access

1. Go to https://supabase.com/dashboard
2. Open project **pontedom** → Authentication → Users
3. Find the agent's email
4. Click the three dots `...` → **Delete user**
5. Their listings remain in the database (super admin can still see them)
6. The agent can no longer log in

---

## Known Limitations (to address in future)

- [ ] Super admin dashboard should show which agent created each listing (add "Agent" column to the listings table)
- [ ] Agents cannot yet upload via XML (Gestim integration — planned)
- [ ] Email + password login has Supabase free tier email limit — Google login recommended for all agents
- [ ] Auto-translation of listings (PL/EN/IT) depends on external service — needs monitoring

---

## Public Website Integration

All published listings from ALL agents appear automatically on:
- **pontedom.pl** — fetched via `/api/listings` endpoint
- **adriatica-backend.onrender.com** — direct backend public pages

The public site shows listings from all agents combined, regardless of who uploaded them.
