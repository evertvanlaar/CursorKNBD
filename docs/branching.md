# Git branches

## Productie-basis: `PLAYSTORE-START`

De live website (kalanera.gr) en PWA draaien op **`PLAYSTORE-START`**.  
Deze branch bevat o.a. `asset-version.txt`, `scripts/sync-asset-version.mjs` en release 3.1.x.

`main` is **gelijkgetrokken** met `PLAYSTORE-START` (zelfde commit). Nieuwe werk altijd vanaf `PLAYSTORE-START` starten of mergen naar beide.

## Workflow

```bash
git checkout PLAYSTORE-START
git pull origin PLAYSTORE-START

# na wijzigingen
git push origin PLAYSTORE-START
git push origin main   # alleen als main weer achterloopt; anders: git push origin PLAYSTORE-START:main
```

Versie bump:

```bash
echo "3.1.45" > asset-version.txt
node scripts/sync-asset-version.mjs
```

## GitHub Actions

Scheduled workflows (o.a. visitkalanera sitemap refresh) draaien op de **default branch** (`PLAYSTORE-START`).
