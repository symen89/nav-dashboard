#!/usr/bin/env node
/**
 * Import historical NAV data from Enzyme API
 * Converts netShareValue to our NAV format (base 1000)
 */

const fs = require('fs');
const path = require('path');

const ENZYME_DATA_PATH = '/tmp/enzyme-full-history.json';
const NAV_DATA_PATH = path.join(__dirname, '..', 'lib', 'nav-data.json');
const BACKUP_PATH = path.join(__dirname, '..', 'lib', 'nav-data-backup.json');

// Base NAV at start (1 March 2022 = 1000)
const BASE_NAV = 1000;
const BASE_DATE = '2022-03-01';

async function main() {
  console.log('📊 Importing Enzyme historical data...\n');

  // Load Enzyme data
  const enzymeData = JSON.parse(fs.readFileSync(ENZYME_DATA_PATH, 'utf8'));
  console.log(`Loaded ${enzymeData.length} data points from Enzyme API`);

  // Load existing NAV data
  const existingNav = JSON.parse(fs.readFileSync(NAV_DATA_PATH, 'utf8'));
  console.log(`Existing NAV data has ${Object.keys(existingNav).length} entries`);

  // Backup existing data
  fs.writeFileSync(BACKUP_PATH, JSON.stringify(existingNav, null, 2));
  console.log(`Backed up to ${BACKUP_PATH}`);

  // Find the base netShareValue from Enzyme (first non-zero entry around March 2022)
  const baseEntry = enzymeData.find(e => 
    e.timestamp.startsWith('2022-03') && 
    e.netShareValue > 0 && 
    e.totalSupply > 0
  );

  if (!baseEntry) {
    console.error('Could not find base entry for March 2022');
    return;
  }

  const baseNetShareValue = baseEntry.netShareValue;
  console.log(`\nBase netShareValue (${baseEntry.timestamp}): ${baseNetShareValue}`);
  console.log(`Converting to NAV base ${BASE_NAV}\n`);

  // Convert Enzyme data to our format
  const newNavData = {};
  let filledGaps = 0;
  let updatedEntries = 0;

  for (const entry of enzymeData) {
    // Skip entries with no data
    if (entry.netShareValue === 0 || entry.totalSupply === 0) continue;
    
    // Parse date
    const date = entry.timestamp.split('T')[0];
    
    // Convert netShareValue to our NAV (base 1000)
    // Our NAV = (netShareValue / baseNetShareValue) * 1000
    const nav = (entry.netShareValue / baseNetShareValue) * BASE_NAV;
    
    // Check if this fills a gap
    if (!existingNav[date]) {
      filledGaps++;
    } else if (Math.abs(existingNav[date] - nav) > 1) {
      // Significant difference - note it
      updatedEntries++;
    }
    
    newNavData[date] = nav;
  }

  // Check what we're filling
  const gapDates = [];
  const checkDates = ['2025-02-15', '2025-02-16', '2025-02-20', '2025-02-25', '2025-03-01', '2025-03-15'];
  for (const d of checkDates) {
    if (newNavData[d] && !existingNav[d]) {
      gapDates.push(`${d}: ${newNavData[d].toFixed(2)}`);
    }
  }

  console.log('📅 Gap dates now filled:');
  gapDates.forEach(d => console.log(`  ✅ ${d}`));

  // Merge: NEVER overwrite existing data, only fill gaps with Enzyme data
  // Existing data = source of truth (spreadsheet)
  // Enzyme data = only for missing days
  
  const mergedNav = { ...existingNav }; // Start with ALL existing data
  
  for (const [date, nav] of Object.entries(newNavData)) {
    // Only add if date doesn't exist in our data
    if (!existingNav[date]) {
      mergedNav[date] = nav;
    }
  }

  // Sort by date
  const sortedNav = {};
  Object.keys(mergedNav).sort().forEach(date => {
    sortedNav[date] = mergedNav[date];
  });

  console.log(`\n📊 Summary:`);
  console.log(`  - Enzyme entries processed: ${Object.keys(newNavData).length}`);
  console.log(`  - Gaps filled: ${filledGaps}`);
  console.log(`  - Final entries: ${Object.keys(sortedNav).length}`);
  console.log(`  - Cutoff date for Enzyme data: ${cutoffDate}`);
  console.log(`  - Using existing data after cutoff (manual corrections)`);

  // Save
  fs.writeFileSync(NAV_DATA_PATH, JSON.stringify(sortedNav, null, 2));
  console.log(`\n✅ Saved to ${NAV_DATA_PATH}`);

  // Print sample of feb-march 2025
  console.log('\n📅 Sample Feb-March 2025 data:');
  const sampleDates = ['2025-02-14', '2025-02-15', '2025-02-20', '2025-02-28', '2025-03-01', '2025-03-15', '2025-03-31'];
  for (const d of sampleDates) {
    console.log(`  ${d}: ${sortedNav[d]?.toFixed(4) || 'MISSING'}`);
  }
}

main().catch(console.error);
