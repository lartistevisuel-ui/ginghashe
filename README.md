# Boutique — Mini App Telegram

## Lancer en local
```
npm install
npm run dev
```

## Structure
- `app/page.js` — gère l'affichage Splash → Accueil
- `components/Splash.js` — animation logo à l'ouverture
- `components/Home.js` — assemble la page d'accueil
- `components/Marquee.js` — bandeau défilant (texte + emojis)
- `components/CategoryGrid.js` — 4 catégories (placeholder)
- `components/ProductList.js` — articles + avis intercalés (1 avis / 3 articles)
- `data/` — catégories, articles, avis (données en dur, à remplacer)
- `public/` — logo, image d'accueil, image article (placeholders SVG)

## À remplacer
- `public/logo-placeholder.svg` → ton vrai logo
- `public/hero-placeholder.svg` → ton image d'accueil
- `data/categories.js` → tes 4 vraies catégories
- `data/products.js` / `data/reviews.js` → tes vrais articles et avis
