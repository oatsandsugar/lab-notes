#!/usr/bin/env bash
set -euo pipefail

# Find the highest-numbered entry
files=$(find entries -maxdepth 1 -name '*.md' 2>/dev/null || true)
if [ -z "$files" ]; then
  last=""
else
  last=$(echo "$files" | sed 's/.*\///' | sed 's/\.md//' | sort -n | tail -1)
fi
if [ -z "$last" ]; then
  next=1
else
  next=$(( 10#$last + 1 ))
fi

padded=$(printf '%03d' "$next")
file="entries/${padded}.md"

if [ -f "$file" ]; then
  echo "Error: $file already exists" >&2
  exit 1
fi

cat > "$file" << EOF
---
id: ${padded}
day: ${padded}
protocol: STANDARD
specimen: 0041
status: IN PROGRESS
incidents: 0
notableEvents: 0
budgetStart: \$0.00
budgetEnd: \$0.00
aceTokens: 0
aceSuit: "—"
rot: 0
title: Untitled
researcher: "[ILLEGIBLE]"
reviewer: PENDING
---

## Observations

EOF

echo "Created $file"
