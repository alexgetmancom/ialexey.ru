#!/usr/bin/env bash
set -euo pipefail
export HOME=/home/deploy
if command -v flock >/dev/null 2>&1; then
  exec 9>/tmp/ialexey-web-sync.lock
  flock -n 9 || exit 0
fi
REPO=/home/deploy/repos/ialexey-web
PUBLIC=/home/deploy/ialexey-web
cd "$REPO"
before=$(/usr/bin/git rev-parse HEAD)
/usr/bin/git fetch origin main --quiet
after=$(/usr/bin/git rev-parse origin/main)
if [ "$before" != "$after" ]; then
  echo "$(date -Iseconds) updating $before -> $after"
  /usr/bin/git pull --ff-only origin main
fi
/usr/bin/rsync -a --delete --exclude ".git" "$REPO"/ "$PUBLIC"/

# Run collector render if available (prefer new repository-managed path, fallback to old path)
if [ -x "$PUBLIC"/feed/collector.py ] && [ -f /home/deploy/ialexey-feed/ialexey-feed.env ]; then
  set -a
  # shellcheck disable=SC1091
  . /home/deploy/ialexey-feed/ialexey-feed.env
  set +a
  /usr/bin/python3 "$PUBLIC"/feed/collector.py render
elif [ -x /home/deploy/ialexey-feed/collector.py ] && [ -f /home/deploy/ialexey-feed/ialexey-feed.env ]; then
  set -a
  # shellcheck disable=SC1091
  . /home/deploy/ialexey-feed/ialexey-feed.env
  set +a
  /usr/bin/python3 /home/deploy/ialexey-feed/collector.py render
fi
