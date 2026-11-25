# Zero Change – weboldal

A Zero Change dunakeszi pénzváltó statikus weboldala (HTML + CSS + JavaScript, build lépés nélkül).

## Oldalak

| Fájl | Tartalom |
|---|---|
| `index.html` | Főoldal: kiemelt és összes valutaárfolyam, kereső |
| `rolunk.html` | Rólunk, elérhetőségek, szolgáltatások |
| `kezeles.html` | Kezelési költség és tudnivalók |
| `fempenz.html` | Fémpénz vételi árak |
| `panasz.html` | Tájékoztatók és panaszkezelés (PDF-ek: `tajekoztatok/pdf/`) |
| `kapcsolat.html` | Kapcsolat, térkép, nyitvatartás |

A régi `fempenz/` és `tajekoztatok/` címek átirányítanak az új oldalakra.

## Adatok

- Valutaárfolyamok: a cassanova.hu árfolyam-API-ból, közös Firebase-gyorsítótárral (`assets/js/site.js`). Az API csak a `https://zerochange.hu` címről engedi a böngészős lekérést, helyben a gyorsítótárból jönnek az árak.
- Fémpénz árak: Firebase `rates/coinAmount`.
- Fordítások (magyar, angol, német): `assets/js/i18n.js`.

## Helyi előnézet

```bash
python3 -m http.server 8765
```

Utána: http://localhost:8765

## Feltöltés

A mappa teljes tartalmát kell a tárhely gyökerébe másolni.
