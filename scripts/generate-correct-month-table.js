// Generate correct month-end table: each month shows the FIRST day of that month
const fs = require('fs');

const sharePrices = JSON.parse(fs.readFileSync('lib/share-prices.json', 'utf8'));
const dates = Object.keys(sharePrices).sort();

const monthData = [];

// Start with March 2022 = 1000 (start value)
monthData.push({
  month: "2022-03",
  date: dates[0], // First date we have
  price: 1000.0,  // Start value
  note: null
});

// For each subsequent month, use the LAST value of the previous month
let currentMonth = 3; // Start from March
let currentYear = 2022;

while (true) {
  // Move to next month
  currentMonth++;
  if (currentMonth > 12) {
    currentMonth = 1;
    currentYear++;
  }
  
  // Check if we have data for this timeframe
  const monthStr = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;
  const nextMonth = currentMonth + 1 > 12 ? 1 : currentMonth + 1;
  const nextYear = currentMonth + 1 > 12 ? currentYear + 1 : currentYear;
  const nextMonthStr = `${nextYear}-${nextMonth.toString().padStart(2, '0')}`;
  
  // Find last date of previous month (= this month's value)
  let lastDateOfPrevMonth = null;
  for (let i = dates.length - 1; i >= 0; i--) {
    const date = dates[i];
    if (date.startsWith(monthStr)) {
      // Found a date in current month, so previous date is end of prev month
      if (i > 0) {
        lastDateOfPrevMonth = dates[i - 1];
      }
      break;
    }
  }
  
  // Or find last date before this month
  if (!lastDateOfPrevMonth) {
    for (let i = dates.length - 1; i >= 0; i--) {
      if (dates[i] < `${monthStr}-01`) {
        lastDateOfPrevMonth = dates[i];
        break;
      }
    }
  }
  
  if (!lastDateOfPrevMonth) break; // No more data
  
  // Check if this is the current month (latest data)
  const isCurrentMonth = currentYear === 2026 && currentMonth === 1; // January 2026
  
  monthData.push({
    month: monthStr,
    date: lastDateOfPrevMonth,
    price: sharePrices[lastDateOfPrevMonth],
    note: isCurrentMonth ? "MTD" : null
  });
  
  // Stop if we've reached current time
  if (currentYear > 2026 || (currentYear === 2026 && currentMonth > 1)) break;
}

console.log('Generated month table (first few entries):');
monthData.slice(0, 5).forEach(entry => {
  console.log(`${entry.month}: €${entry.price.toFixed(2)} (from ${entry.date})`);
});

console.log('\nLast few entries:');
monthData.slice(-5).forEach(entry => {
  console.log(`${entry.month}: €${entry.price.toFixed(2)} (from ${entry.date})`);
});

console.log(`\nTotal entries: ${monthData.length}`);

// Write to file
fs.writeFileSync('lib/month-end-data.json', JSON.stringify(monthData, null, 2));
console.log('\nWritten to lib/month-end-data.json');
