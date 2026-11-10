# eilamarialeskinen.fi

Astro (staattinen) + Firebase Hosting + Cloud Function (yhteydenottolomake).

## Kehitys
```
npm install && npm install --prefix functions
npm run dev        # http://localhost:4321
npm run build      # -> dist/
```

## Sisällön päivitys
- Konsertit: `src/data/concerts.json` (`date` YYYY-MM-DD, `title`, `venue`, `city`, valinn. `time`, `description`, `link`). Menneet siirtyvät automaattisesti "menneisiin" buildissa (viikoittainen ajastettu deploy).
- Arvostelut: `src/data/reviews.json` · Levyt: `src/data/albums.json`, `singles.json`
- Kuvat: lisää tiedostot kansioon `src/assets/gallery/` (galleria päivittyy itsestään, nimijärjestyksessä; etusivun kuva on `src/assets/photos/hero.jpg`)
- Bio: `src/pages/cv.astro`

## Julkaisu (kertaluonteinen käyttöönotto)
1. Luo Firebase-projekti (Blaze-suunnitelma, aseta budjettihälytys) ja korvaa `.firebaserc`:n projektin id.
2. `firebase functions:secrets:set SMTP_USER` ja `SMTP_PASS` (Gmail + sovellussalasana).
3. `firebase deploy --only functions` ja `firebase deploy --only hosting`.
4. GitHub: lisää secret `FIREBASE_SERVICE_ACCOUNT` ja variable `FIREBASE_PROJECT_ID` → push mainiin julkaisee sivuston (`.github/workflows/deploy.yml`). Function deployataan käsin tarvittaessa.
5. Domain: lisää `www.eilamarialeskinen.fi` Firebase Hostingiin, päivitä DNS. Älä koske MX-tietueisiin.
