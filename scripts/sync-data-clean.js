// Clean NAV Dashboard Sync Script
// Data sources:
// 1. Historic: Google Sheets (1 maart 2022 - 1 dec 2025) - HARDFIXED
// 2. Live: adam-nav-api.vercel.app (vanaf 2 dec 2025) - DAGELIJKS UPDATE

const fs = require('fs');

const CONFIG = {
  // Cut-off date between historic and live data
  historicCutoff: '2025-12-01',
  
  // APIs
  adamNavApi: 'https://adam-nav-api.vercel.app/api/nav-history',
  cci30Api: 'https://cci30.com/ajax/getIndexHistory.php',
  
  // Files
  historicDataPath: 'lib/historic-data.json',
  cci30DataPath: 'lib/cci30-data.json',
  finalSharePricesPath: 'lib/share-prices.json',
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

async function getLiveNavData() {
  console.log('Fetching live NAV data from adam-nav-api...');
  
  try {
    const apiResponse = await fetchJson(CONFIG.adamNavApi);
    const liveData = {};
    
    if (apiResponse.ok && apiResponse.history) {
      apiResponse.history.forEach(entry => {
        if (entry.date > CONFIG.historicCutoff && entry.share_price_eur) {
          liveData[entry.date] = entry.share_price_eur;
        }
      });
      
      console.log(`Live NAV entries: ${Object.keys(liveData).length}`);
      if (Object.keys(liveData).length > 0) {
        const dates = Object.keys(liveData).sort();
        console.log(`Live data range: ${dates[0]} to ${dates[dates.length - 1]}`);
        console.log(`Latest share price: €${liveData[dates[dates.length - 1]]}`);
      }
    }
    
    return liveData;
  } catch (error) {
    console.error('Failed to fetch live NAV data:', error);
    return {};
  }
}

async function getCci30Data() {
  console.log('Fetching CCI30 data...');
  
  try {
    // Get current data to preserve historic entries
    let currentData = {};
    try {
      currentData = JSON.parse(fs.readFileSync(CONFIG.cci30DataPath, 'utf8'));
    } catch (e) {
      console.log('No existing CCI30 data found, starting fresh');
    }
    
    // Fetch new CSV data
    const csv = await fetchText(CONFIG.cci30Api);
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
  } catch (error) {
    console.error('Failed to fetch CCI30 data:', error);
    return {};
  }
}

async function mergeFinalData() {
  console.log('Merging historic + live share price data...');
  
  // Load historic data (HARDFIXED - never changes)
  const historicFile = JSON.parse(fs.readFileSync(CONFIG.historicDataPath, 'utf8'));
  const historicData = historicFile.data;
  
  console.log(`Historic entries: ${Object.keys(historicData).length}`);
  const historicDates = Object.keys(historicData).sort();
  console.log(`Historic range: ${historicDates[0]} to ${historicDates[historicDates.length - 1]}`);
  
  // Get live data  
  const liveData = await getLiveNavData();
  
  // Merge: historic data + live data (live overwrites any overlapping dates)
  const finalData = { ...historicData, ...liveData };
  
  // Sort by date
  const sortedData = {};
  Object.keys(finalData).sort().forEach(date => {
    sortedData[date] = finalData[date];
  });
  
  return sortedData;
}

async function main() {
  try {
    console.log('=== Clean NAV Data Sync ===\n');
    
    // Merge share price data
    const shareData = await mergeFinalData();
    
    // Get CCI30 data
    const cci30Data = await getCci30Data();
    
    // Sort both datasets
    const sortByDate = (obj) => {
      const sorted = {};
      Object.keys(obj).sort().forEach(key => {
        sorted[key] = obj[key];
      });
      return sorted;
    };
    
    const sortedShares = sortByDate(shareData);
    const sortedCci30 = sortByDate(cci30Data);
    
    // Write final files
    fs.writeFileSync(CONFIG.finalSharePricesPath, JSON.stringify(sortedShares, null, 2));
    console.log(`\nWritten: ${CONFIG.finalSharePricesPath}`);
    
    fs.writeFileSync(CONFIG.cci30DataPath, JSON.stringify(sortedCci30, null, 2));
    console.log(`Written: ${CONFIG.cci30DataPath}`);
    
    // Summary
    const shareDates = Object.keys(sortedShares).sort();
    const cci30Dates = Object.keys(sortedCci30).sort();
    
    console.log('\n=== Final Summary ===');
    console.log(`✅ Share Prices: ${shareDates[0]} to ${shareDates[shareDates.length - 1]} (${shareDates.length} entries)`);
    console.log(`✅ CCI30: ${cci30Dates[0]} to ${cci30Dates[cci30Dates.length - 1]} (${cci30Dates.length} entries)`);
    console.log(`📈 Latest share price: €${sortedShares[shareDates[shareDates.length - 1]]}`);
    
    // Generate month-end table data
    console.log('\nGenerating month-end table...');
    const monthEndData = [];
    
    for (let i = 0; i < shareDates.length; i++) {
      const currentDate = new Date(shareDates[i]);
      const nextDate = i < shareDates.length - 1 ? new Date(shareDates[i + 1]) : null;
      
      // Is this the last day we have data for this month?
      const isMonthEnd = !nextDate || 
                        nextDate.getMonth() !== currentDate.getMonth() || 
                        nextDate.getFullYear() !== currentDate.getFullYear();
      
      if (isMonthEnd) {
        const yearMonth = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;
        monthEndData.push({
          month: yearMonth,
          date: shareDates[i],
          price: sortedShares[shareDates[i]],
          note: i === shareDates.length - 1 ? "MTD" : null
        });
      }
    }
    
    fs.writeFileSync('lib/month-end-data.json', JSON.stringify(monthEndData, null, 2));
    console.log(`📅 Month-end table: ${monthEndData.length} entries written`);
    
  } catch (error) {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  }
}

main();