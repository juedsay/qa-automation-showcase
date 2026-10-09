#!/usr/bin/env bash
# Starts a disposable Toolshop (sprint 5), seeds it and waits until the API and the UI respond.
# Used by CI; also works locally:  bash ci/toolshop/start.sh   (stop with: docker compose -p toolshop down -v)
set -euo pipefail

cd "$(dirname "$0")"
compose="docker compose -f docker-compose.yml"

wait_for() { # name, command, attempts, seconds between attempts
  local name=$1 cmd=$2 attempts=$3 pause=$4
  for ((i = 1; i <= attempts; i++)); do
    if eval "$cmd" >/dev/null 2>&1; then echo "$name ready"; return 0; fi
    sleep "$pause"
  done
  echo "$name did not become ready" >&2
  $compose logs --tail=50 >&2
  return 1
}

$compose up -d --quiet-pull
wait_for "database" "$compose exec -T mariadb mysqladmin ping -uroot -proot --silent" 60 2
$compose exec -T laravel-api php artisan migrate:fresh --seed --force
wait_for "API" "curl -fsS http://localhost:8091/products" 60 2
# The UI container compiles the Angular app on start (`ng serve`), which takes a while.
wait_for "UI" "curl -fsS http://localhost:4200/" 100 3
