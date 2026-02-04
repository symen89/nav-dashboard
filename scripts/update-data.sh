#!/bin/bash
# Daily data update script for nav-dashboard
# Run via cron or manually

set -e
cd "$(dirname "$0")/.."

echo "$(date): Starting data update..."

# 1. Fetch latest share price from API
NAV_RESPONSE=$(curl -s "https://adam-nav-api.vercel.app/api/nav")
NAV_EUR=$(echo "$NAV_RESPONSE" | jq -r '.share_price_eur // empty')

if [ -z "$NAV_EUR" ]; then
  echo "Error: Could not fetch NAV"
  exit 1
fi

TODAY=$(date +%Y-%m-%d)
echo "NAV for $TODAY: €$NAV_EUR"

# 2. Update share-prices.json
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('lib/share-prices.json'));
const today = '$TODAY';
const nav = $NAV_EUR;

// Only add if not already present or different
if (!data[today] || Math.abs(data[today] - nav) > 0.01) {
  data[today] = Math.round(nav * 100) / 100;
  
  // Sort by date
  const sorted = Object.fromEntries(Object.entries(data).sort((a,b) => a[0].localeCompare(b[0])));
  fs.writeFileSync('lib/share-prices.json', JSON.stringify(sorted, null, 2));
  console.log('Updated share-prices.json');
} else {
  console.log('No update needed');
  process.exit(2);
}
"

UPDATE_RESULT=$?
if [ $UPDATE_RESULT -eq 2 ]; then
  echo "No changes to commit"
  exit 0
fi

# 3. Fetch latest CCI30
echo "Fetching CCI30..."
CCI30_CSV=$(curl -s "https://cci30.com/ajax/getIndexHistory.php")
if [ -n "$CCI30_CSV" ]; then
  node -e "
  const fs = require('fs');
  const csv = \`$CCI30_CSV\`;
  const lines = csv.trim().split('\n');
  const data = JSON.parse(fs.readFileSync('lib/cci30-data.json'));
  let updated = false;
  
  // Skip header, process recent entries
  for (let i = 1; i < Math.min(30, lines.length); i++) {
    const [date, , , , close] = lines[i].split(',');
    if (date && close && !data[date]) {
      data[date] = parseFloat(close);
      updated = true;
    }
  }
  
  if (updated) {
    const sorted = Object.fromEntries(Object.entries(data).sort((a,b) => a[0].localeCompare(b[0])));
    fs.writeFileSync('lib/cci30-data.json', JSON.stringify(sorted, null, 2));
    console.log('Updated cci30-data.json');
  }
  "
fi

# 4. Commit and push
if git diff --quiet lib/; then
  echo "No changes to commit"
  exit 0
fi

git add lib/share-prices.json lib/cci30-data.json
git commit -m "Daily data update $(date +%Y-%m-%d)"
git push

echo "$(date): Data update complete!"
