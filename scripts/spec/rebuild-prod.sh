#!/usr/bin/env bash
# Rebuild the production bundle and restart it on :3001 (used between measurement rounds).
cd "$(dirname "$0")/../.." || exit 1
pid=$(netstat -ano | grep ":3001 " | grep LISTENING | awk '{print $5}' | head -1)
[ -n "$pid" ] && taskkill //F //PID "$pid" > /dev/null 2>&1
npm run build 2>&1 | grep -E "error|Error|Failed|Compiled|✓ Generating" | head -12
(nohup npx next start -p 3001 > "${TEMP:-/tmp}/next-start-3001.log" 2>&1 &)
for i in $(seq 1 40); do code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/ 2>/dev/null); [ "$code" = "200" ] && break; sleep 1; done
echo "prod :3001 -> $code"
