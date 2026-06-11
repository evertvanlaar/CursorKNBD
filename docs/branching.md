# Git branches

## Productie-basis: `PLAYSTORE-START`

De live website (kalanera.gr) en PWA draaien op **`PLAYSTORE-START`**.  
Deze branch bevat o.a. `asset-version.txt`, `scripts/sync-asset-version.mjs` en release 3.1.x.

**`PLAYSTORE-START` is de status quo** — niet `main`. Op GitHub loopt `main` soms achter; productie staat altijd op `PLAYSTORE-START`.

Werk lokaal op `PLAYSTORE-START`. Eén keer per clone (of na een verse clone):

```bash
bash scripts/setup-git-production-pull.sh
```

Daarna haalt **`git pull` altijd `origin/PLAYSTORE-START` binnen**, ongeacht of je op `main` of `PLAYSTORE-START` staat.

## Workflow

```bash
git checkout PLAYSTORE-START
git pull

# na wijzigingen
git push origin PLAYSTORE-START
git push origin PLAYSTORE-START:main   # optioneel: main gelijk trekken op GitHub
```

Versie bump:

```bash
echo "3.1.45" > asset-version.txt
node scripts/sync-asset-version.mjs
```

## GitHub Actions

Scheduled workflows (o.a. visitkalanera sitemap refresh) draaien op de **default branch** (`PLAYSTORE-START`).
