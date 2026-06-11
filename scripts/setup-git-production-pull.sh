#!/usr/bin/env bash
# Configure this clone so `git pull` always syncs with origin/PLAYSTORE-START (live site + app).
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

git config branch.main.merge refs/heads/PLAYSTORE-START
git config branch.main.remote origin
git config branch.PLAYSTORE-START.merge refs/heads/PLAYSTORE-START
git config branch.PLAYSTORE-START.remote origin
git config alias.pull '!f(){ git fetch origin PLAYSTORE-START && git merge --ff-only FETCH_HEAD 2>/dev/null || git merge FETCH_HEAD -m "Sync with PLAYSTORE-START (production)"; }; f'

echo "OK: git pull synct nu altijd met origin/PLAYSTORE-START."
echo "Tip: werk op branch PLAYSTORE-START (git checkout PLAYSTORE-START)."
