// sync-data.js - FIXED VERSION
// Syncs NAV and CCI30 data to nav-dashboard

const fs = require('fs');

const CONFIG = {
  // CCI30 data (public)
  cci30Url: 'https://cci30.com/ajax/getIndexHistory.php',
  
  // NAV data (public API)
  navApiUrl: 'https://adam-nav-api.vercel.app/api/nav-history',
  
  // Output paths
  navDataPath: 'lib/nav-data.json',
  cci30DataPath: 'lib/cci30-data.json',
  configPath: 'lib/config.json',
};

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.json();
}

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.text();
}

async function getNavData() {
  console.log('Fetching NAV data from adam-nav-api...');
  
  // Get config for scale factor and last historic date
  const config = JSON.parse(fs.readFileSync(CONFIG.configPath, 'utf8'));
  const scaleFactor = config.scale_factor;
  const lastHistoricDate = config.last_historic_date;
  
  console.log(`Scale factor: ${scaleFactor}`);
  console.log(`Last historic date: ${lastHistoricDate}`);
  
  // Get current nav-data.json (for historic data before API)
  const currentNavData = JSON.parse(fs.readFileSync(CONFIG.navDataPath, 'utf8'));
  
  // Get new API data from public endpoint
  console.log('Fetching from adam-nav-api.vercel.app...');
  const apiResponse = await fetchJson(CONFIG.navApiUrl);
  const apiHistory = apiResponse.history;
  
  console.log(`Fetched ${apiHistory.length} entries from API`);
  
  // Start with historic data
  const navData = { ...currentNavData };
  
  // Add/update API data (scaled to match historic format)
  for (const entry of apiHistory) {
    const date = entry.date;
    const sharePrice = entry.share_price_eur;
    
    if (sharePrice && date > lastHistoricDate) {
      // Scale to match historic data format
      const scaledValue = sharePrice * scaleFactor * 1000;
      navData[date] = Math.round(scaledValue * 10000) / 10000;
    }
  }
  
  console.log(`NAV data entries: ${Object.keys(navData).length}`);
  
  return navData;
}

async function getCci30Data() {
  console.log('Fetching CCI30 data...');
  
  // Get current data to preserve historic entries
  const currentData = JSON.parse(fs.readFileSync(CONFIG.cci30DataPath, 'utf8'));
  
  // Fetch new CSV data
  const csv = await fetchText(CONFIG.cci30Url);
  const lines = csv.trim().split('\n');
  
  // Parse CSV (Date,Open,High,Low,Close,Volume)
  const cci30Data = { ...currentData };
  
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',');
    if (parts.length >= 5) {
      const date = parts[0];
      const close = parseFloat(parts[4]);
      
      if (date && !isNaN(close)) {
        cci30Data[date] = Math.round(close * 10) / 10;
      }
    }
  }
  
  console.log(`CCI30 data entries: ${Object.keys(cci30Data).length}`);
  
  return cci30Data;
}

async function main() {
  try {
    console.log('=== NAV Dashboard Data Sync (FIXED) ===\n');
    
    // Fetch both datasets
    const [navData, cci30Data] = await Promise.all([
      getNavData(),
      getCci30Data(),
    ]);
    
    // Sort by date
    const sortObject = (obj) => {
      const sorted = {};
      Object.keys(obj).sort().forEach(key => {
        sorted[key] = obj[key];
      });
      return sorted;
    };
    
    const sortedNavData = sortObject(navData);
    const sortedCci30Data = sortObject(cci30Data);
    
    // Write to files
    fs.writeFileSync(
      CONFIG.navDataPath,
      JSON.stringify(sortedNavData, null, 2)
    );
    console.log(`\nWritten: ${CONFIG.navDataPath}`);
    
    fs.writeFileSync(
      CONFIG.cci30DataPath,
      JSON.stringify(sortedCci30Data, null, 2)
    );
    console.log(`Written: ${CONFIG.cci30DataPath}`);
    
    // Summary
    const navDates = Object.keys(sortedNavData).sort();
    const cci30Dates = Object.keys(sortedCci30Data).sort();
    
    console.log('\n=== Summary ===');
    console.log(`NAV: ${navDates[0]} to ${navDates[navDates.length - 1]} (${navDates.length} entries)`);
    console.log(`CCI30: ${cci30Dates[0]} to ${cci30Dates[cci30Dates.length - 1]} (${cci30Dates.length} entries)`);
    
  } catch (error) {
    console.error('Sync failed:', error);
    process.exit(1);
  }
}

main();