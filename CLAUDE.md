# Miniature-Oid — CLAUDE.md
*For Trinity. Read before touching anything.*

---

## What Miniature-Oid Is

Free AI-powered identification tool for miniatures, wargaming figures, dollhouse
furniture, and scale models. Upload a photo — Miniature-Oid identifies it. Ask
Reg (46 years at the painting table) for technique, gear, and painting advice.

Part of the FeelFamous -Oid Ecosystem.

**Live at:** miniature-oid.netlify.app | **Netlify:** auto-deploy on push to main

**Domain note (Chris, 2026-07-14):** `miniature-oid.co.uk` is dead — DNS at
IONOS was never sorted (see DocBrain `rune-hit-compaction.txt`) and Chris has
given up on it. The Netlify subdomain is now the one and only canonical URL
everywhere: this file, meta tags, Patreon OAuth `redirect_uri`, footer/share/
watermark text, `robots.txt`, `sitemap.xml`, `llms.txt`, and every sibling
-oid's Village cross-link. **Action needed from Chris:** the Patreon app's
registered Redirect URI must be updated to
`https://miniature-oid.netlify.app/auth/patreon` in the Patreon developer
dashboard, or sign-in will fail even though the code now points here.

---

## The Characters

**Reg** — the identifier voice and chatbot. Painting since 1978, first Airfix
kit at eight. Straight-talking, no-nonsense, genuinely loves teaching. `chat-reg.js`.

**The Tiny Curator** — the identification/roast persona used inside
`analyze-image.js`'s prompts (identify mode + "Roast My Paintjob" mode).

---

## Stack

- **Static HTML** — single page (`index.html`), no framework, no build step
- **Tailwind CSS CDN** — inline
- **Netlify** — hosting + serverless `/netlify/functions/`
- **Supabase** — users, kudos, leaderboard, broadcast (`pdnjeynugptnavkdbmxh`)
- **Gemini 2.0 Flash** (`analyze-image.js`) / **2.5 Flash** (`chat-reg.js`) — all AI calls (NEVER Anthropic API)
- **Patreon** — membership OAuth (NEVER Stripe for memberships)
- **what3words** — Meet tab (meeting point generator for shows/conventions)

---

## File Map

```
/
├── CLAUDE.md                   ← you are here
├── index.html                  ← entire app: Home/Identify, Learn, Q&A, Ask Reg, Gear, Meet, Village tabs
├── llms.txt
├── netlify.toml
├── supabase-schema.sql
└── netlify/functions/
    ├── analyze-image.js        ← Gemini vision: identify mode + roast mode
    ├── chat-reg.js              ← Ask Reg chatbot
    └── patreon-auth.js          ← Patreon OAuth token exchange + tier check
```

---

## Free-to-use philosophy (Chris, 2026-07-13 — read before adding any gate)

The core tool — photo identification (both Identify and Roast My Paintjob
modes) and Ask Reg chat — is free for everyone, no sign-in, no lock icon, no
"Villager+ only" banner. There was never a hard `isPro` gate on either:
`analyze-image.js` and `chat-reg.js` have no tier checks at all. `isPro` in
the frontend only ever drives status-badge display (Patreon sign-in state),
never blocks identify/chat. Don't gate the tool itself behind Patreon.

**What Patreon is for:** the Village — a hosted hut/hamlet page, Kudos and
leaderboard, the village activity feed. Those are real, ongoing Supabase-backed
costs tied to a persistent public record, so they stay behind membership.
Frame it honestly — never as a shame-lock ("🔒 ... Founders only ... Unlock
→"). The Village tab already does this reasonably ("Everything here is free
to use. Supporting the village keeps it growing.") — left as-is.

**2026-07-13 changes:**
- Removed a scarcity dark pattern from the Founding Member banner — it read
  "Founding Member price — first 1,000 only. After that, the door goes up,"
  which manufactures false urgency (the same pattern found and removed in
  designer-oid). Reworded to state the real, honest reason to join: "It's
  free to use, always will be. £4.95/month keeps the village running — hut
  pages, Kudos, the works."
- Fixed misleading "Pro unlocked" / "upgrade for Pro" copy in
  `showPatreonStatus()` — there is no Pro-gated feature in this app, so
  implying one exists was false advertising. Now shows honest patron status
  only.
- Added a one-time honesty-box message (`#honestyBox`) under the result
  view's action buttons, shown once after an identify/roast result — points
  to Buy Me a Coffee (one-off) and Patreon (ongoing), hidden automatically
  once `patreonSession.isPro` is true.

**The ask, when there is one:** one honest, low-key line after Reg gives a
result — free to use, tell a mate if it helped, buy-me-a-coffee if you want
to say thanks (one-off, buymeacoffee.com/chrispteemagician), Patreon if you
want to be a regular (patreon.com/chrisptee). Not a gate. Not gamified.

This same pattern is rolling out across the rest of the -oid ecosystem —
check other repos' CLAUDE.md for the shared version before assuming this
file is the only place it applies.

---

## Membership Tiers (Patreon — chrisptee campaign)

| Tier | Price | Pence threshold |
|------|-------|----------------|
| 🏡 Villager | £4.95/mo | ≥300¢ |
| ⭐ Elder | Earned | ≥700¢ |
| 👑 Founder | £14.95/mo | ≥1500¢ |

Checked in `netlify/functions/patreon-auth.js`. All Patreon links go to
`https://www.patreon.com/chrisptee`.

---

## Gemini API Rules (Ecosystem-Wide)

Two known pitfalls:

1. **Do NOT set `thinkingBudget: 0`** — Gemini 2.5 Flash rejects it with a silent 400. Remove `thinkingConfig` entirely.
2. **Do NOT hardcode `mime_type: "image/jpeg"`** — always extract from the data URL. Already correct in `analyze-image.js`.

---

## Deploy

Push to `main` → Netlify auto-deploys. Never drag-to-Netlify. `git pull` before every push.

---

## Session History

### 2026-07-13 — Claude (de-gate sweep)
- Audited for hard Patreon/tier paywalls on core functionality — found none;
  `analyze-image.js` and `chat-reg.js` were already fully free/ungated.
- Removed scarcity dark pattern ("first 1,000 only... door goes up") from the
  Founding Member banner.
- Fixed misleading "Pro unlocked"/"upgrade for Pro" copy that implied a
  locked feature which doesn't exist.
- Added the standard honesty-box message after identify/roast results.
