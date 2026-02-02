#!/usr/bin/env node
/**
 * NAV Data Audit Script
 * Checks for consistency, gaps, anomalies, and cross-references with external price data
 */

const fs = require('fs');
const path = require('path');

const LIB_DIR = path.join(__dirname, '..', 'lib');

// Load data files
const navData = JSON.parse(fs.readFileSync(path.join(LIB_DIR, 'nav-data.json'), 'utf8'));
const monthEndData = JSON.parse(fs.readFileSync(path.join(LIB_DIR, 'month-end-data.json'), 'utf8'));

const results = {
  summary: {},
  consistencyIssues: [],
  missingDays: [],
  anomalies: [],
  crossCheckSamples: []
};

// ============================================
// 1. CONSISTENCY CHECK - Month-end vs Daily
// ============================================
console.log('\n📊 1. CONSISTENCY CHECK: Month-end vs Daily NAV\n');
console.log('Checking if month-end-data.json prices match nav-data.json...\n');

for (const entry of monthEndData) {
  const { date, price, month } = entry;
  const dailyPrice = navData[date];
  
  if (dailyPrice === undefined) {
    results.consistencyIssues.push({
      type: 'MISSING_IN_DAILY',
      month,
      date,
      monthEndPrice: price,
      dailyPrice: null
    });
    console.log(`❌ ${date} (${month}): NOT FOUND in daily data! Month-end price: ${price}`);
  } else {
    const diff = Math.abs(dailyPrice - price);
    const diffPct = (diff / price) * 100;
    
    if (diffPct > 0.01) { // More than 0.01% difference
      results.consistencyIssues.push({
        type: 'PRICE_MISMATCH',
        month,
        date,
        monthEndPrice: price,
        dailyPrice,
        diffPct: diffPct.toFixed(4)
      });
      console.log(`⚠️  ${date} (${month}): MISMATCH - Month-end: ${price}, Daily: ${dailyPrice} (${diffPct.toFixed(4)}% diff)`);
    } else {
      console.log(`✅ ${date} (${month}): OK - ${price}`);
    }
  }
}

// ============================================
// 2. MISSING DAYS CHECK
// ============================================
console.log('\n\n📅 2. MISSING DAYS CHECK\n');

const dates = Object.keys(navData).sort();
const startDate = new Date(dates[0]);
const endDate = new Date(dates[dates.length - 1]);

console.log(`Date range: ${dates[0]} to ${dates[dates.length - 1]}`);
console.log(`Total entries: ${dates.length}`);

let expectedDate = new Date(startDate);
let missingCount = 0;

while (expectedDate <= endDate) {
  const dateStr = expectedDate.toISOString().split('T')[0];
  if (!navData[dateStr]) {
    results.missingDays.push(dateStr);
    missingCount++;
  }
  expectedDate.setDate(expectedDate.getDate() + 1);
}

const totalExpectedDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
console.log(`Expected days: ${totalExpectedDays}`);
console.log(`Missing days: ${missingCount}`);

if (missingCount > 0 && missingCount <= 30) {
  console.log('\nMissing dates:');
  results.missingDays.forEach(d => console.log(`  - ${d}`));
} else if (missingCount > 30) {
  console.log('\nFirst 30 missing dates:');
  results.missingDays.slice(0, 30).forEach(d => console.log(`  - ${d}`));
  console.log(`  ... and ${missingCount - 30} more`);
}

// ============================================
// 3. ANOMALY DETECTION (>15% day-over-day)
// ============================================
console.log('\n\n🚨 3. ANOMALY DETECTION (>15% day-over-day change)\n');

const ANOMALY_THRESHOLD = 15; // percent

for (let i = 1; i < dates.length; i++) {
  const prevDate = dates[i - 1];
  const currDate = dates[i];
  const prevPrice = navData[prevDate];
  const currPrice = navData[currDate];
  
  const change = ((currPrice - prevPrice) / prevPrice) * 100;
  
  if (Math.abs(change) > ANOMALY_THRESHOLD) {
    results.anomalies.push({
      date: currDate,
      prevDate,
      prevPrice,
      currPrice,
      changePct: change.toFixed(2)
    });
    const emoji = change > 0 ? '📈' : '📉';
    console.log(`${emoji} ${currDate}: ${change.toFixed(2)}% (${prevPrice.toFixed(2)} → ${currPrice.toFixed(2)})`);
  }
}

if (results.anomalies.length === 0) {
  console.log('✅ No anomalies found (all day-over-day changes < 15%)');
} else {
  console.log(`\nTotal anomalies: ${results.anomalies.length}`);
}

// ============================================
// 4. CROSS-CHECK SAMPLES (for manual verification)
// ============================================
console.log('\n\n🔍 4. CROSS-CHECK SAMPLES\n');
console.log('Sample dates for manual verification against external sources:\n');

// Pick strategic dates: start, end of each year, random samples
const sampleDates = [
  '2022-03-01', // Start
  '2022-06-30', // Q2 2022 (crash)
  '2022-12-31', // End 2022
  '2023-06-30', // Mid 2023
  '2023-12-31', // End 2023
  '2024-03-31', // Q1 2024 (rally)
  '2024-06-30', // Mid 2024
  '2024-12-31', // End 2024
  '2025-06-30', // Mid 2025
  '2025-12-31', // End 2025
  dates[dates.length - 1] // Latest
];

console.log('Date          | NAV Price   | Notes');
console.log('--------------|-------------|---------------------------');

for (const date of sampleDates) {
  const price = navData[date];
  if (price !== undefined) {
    results.crossCheckSamples.push({ date, price });
    console.log(`${date}  | ${price.toString().padEnd(11)} | Check against portfolio snapshot`);
  } else {
    console.log(`${date}  | NOT FOUND   | ⚠️ Missing`);
  }
}

// ============================================
// 5. SUMMARY
// ============================================
console.log('\n\n📋 SUMMARY\n');
console.log('='.repeat(50));

results.summary = {
  totalDailyEntries: dates.length,
  dateRange: `${dates[0]} to ${dates[dates.length - 1]}`,
  monthEndEntries: monthEndData.length,
  consistencyIssues: results.consistencyIssues.length,
  missingDays: results.missingDays.length,
  anomalies: results.anomalies.length
};

console.log(`Total daily entries:    ${results.summary.totalDailyEntries}`);
console.log(`Date range:             ${results.summary.dateRange}`);
console.log(`Month-end entries:      ${results.summary.monthEndEntries}`);
console.log(`Consistency issues:     ${results.summary.consistencyIssues}`);
console.log(`Missing days:           ${results.summary.missingDays}`);
console.log(`Price anomalies (>15%): ${results.summary.anomalies}`);
console.log('='.repeat(50));

// Overall health
const hasIssues = results.consistencyIssues.length > 0 || 
                  results.missingDays.length > 10 ||
                  results.anomalies.length > 20;

if (hasIssues) {
  console.log('\n⚠️  DATA NEEDS REVIEW before master 1.0');
} else {
  console.log('\n✅ DATA LOOKS HEALTHY for master 1.0');
}

// Save detailed results
const outputPath = path.join(LIB_DIR, 'audit-results.json');
fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
console.log(`\nDetailed results saved to: ${outputPath}`);
