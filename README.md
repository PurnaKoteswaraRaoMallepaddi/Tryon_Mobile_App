# Atelier — iOS app (in-store try-on)

The mobile client for Atelier. Photograph any dress **in a store** — on a rack, a
mannequin, or worn by someone — and the app extracts just the garment (**try-off**),
fits it onto **your** photo (**try-on**), saves it to your **wardrobe**, and lets you
chat with a personal **AI stylist**.

It's a thin native client over the **same backend** as the Atelier website and Chrome
extension — no AI runs on the phone; everything goes to the shared API. Built with
**Expo (React Native)**, so it's real native iOS **and** Android from one codebase.

## What it does

| Tab | What it does | Backend |
|---|---|---|
| **Try on** | Snap a dress → extract the garment → fit it on you | `POST /api/catalog-items` (try-off) → `POST /api/catalog-items/:id/tryon` |
| **Wardrobe** | Your fittings; mark pieces as bought | `GET/PATCH /api/applied` |
| **Stylist** | Chat with an AI stylist who knows your photo + colours | `POST /api/stylist/chat` |
| **Profile** | Set your reference photo (the one garments fit onto) | `POST /api/photos` |

The backend defaults to the live server
(`https://atelier-tryon-delicate-shell-8720.fly.dev`); override with
`EXPO_PUBLIC_API_BASE` or `extra.apiBase` in `app.json`.

## Run it on your iPhone (no Mac needed)

1. Install **Node 18+** and the **Expo Go** app from the iOS App Store.
2. In this folder:
   ```bash
   npm install
   npx expo start
   ```
3. **Scan the QR code** in the terminal with your iPhone camera → it opens in Expo Go.
4. Sign in with your Atelier account (invite-only — use your invite). In **Profile**,
   take your reference photo first, then go to **Try on** and photograph a dress.

> You need an account on the backend. It's the same login as the website; production
> is invite-only, so create an account via an invite link first.

## Point it at a different backend (e.g. local dev)

```bash
EXPO_PUBLIC_API_BASE=http://<your-computer-ip>:4000 npx expo start
```
(Use your machine's LAN IP, not `localhost`, so the phone can reach it.)

## Build for TestFlight / the App Store (no Mac needed)

Uses **EAS Build** (Expo's cloud build — compiles the iOS binary for you):

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform ios        # produces an .ipa in the cloud
eas submit --platform ios       # uploads to App Store Connect / TestFlight
```

You'll need an Apple Developer account ($99/yr). For a pilot, **TestFlight** lets up to
10,000 testers install it without a public App Store listing.

## Notes / limitations

- **Try-off quality** depends on the backend engine (`TRYOFF_PROVIDER` on the server).
  Gemini extraction is good on clean, well-lit photos; messy in-store shots are where a
  purpose-built model (fal try-off) would help — that's a server-side switch, not an
  app change.
- The stylist reply is fetched as a whole (RN doesn't stream SSE easily); it isn't
  token-by-token live yet. Functionally identical, just not animated.
- Camera/photo permissions are requested on first use (strings in `app.json`).

## Project layout

```
app/
  _layout.tsx          auth gate + root stack
  login.tsx signup.tsx auth screens (invite-aware)
  (tabs)/
    _layout.tsx        bottom tabs
    index.tsx          Try on — capture → extract → try-on (the hero flow)
    wardrobe.tsx       fittings grid
    stylist.tsx        AI stylist chat
    profile.tsx        reference photo + sign out
src/
  api.ts               typed client for the shared backend (+ SSE parse)
  auth.tsx             auth context (token in expo-secure-store)
  config.ts            API base URL
  theme.ts ui.tsx      Atelier palette + small UI kit
```
