// Correct month table logic: 
// Last day of month = entry price for NEXT month's participants
const fs = require('fs');

const sharePrices = JSON.parse(fs.readFileSync('lib/share-prices.json', 'utf8'));
const dates = Object.keys(sharePrices).sort();

console.log(`Processing ${dates.length} dates from ${dates[0]} to ${dates[dates.length-1]}`);

const monthData = [];

// Group dates by year-month
const datesByMonth = {};
dates.forEach(date => {
  const yearMonth = date.substring(0, 7); // "2022-03"
  if (!datesByMonth[yearMonth]) {
    datesByMonth[yearMonth] = [];
  }
  datesByMonth[yearMonth].push(date);
});

const months = Object.keys(datesByMonth).sort();
console.log(`Found ${months.length} months with data`);

// Generate table: each month uses END of PREVIOUS month as entry price
for (let i = 0; i < months.length; i++) {
  const month = months[i];
  
  if (month === '2022-03') {
    // March 2022 starts with 1000 (special case)
    monthData.push({
      month: month,
      date: dates[0],
      price: 1000.0,
      note: null
    });
  } else {
    // All other months: use last day of previous month
    const prevMonth = months[i - 1];
    if (prevMonth && datesByMonth[prevMonth]) {
      const prevMonthDates = datesByMonth[prevMonth].sort();
      const lastDateOfPrevMonth = prevMonthDates[prevMonthDates.length - 1];
      
      monthData.push({
        month: month,
        date: lastDateOfPrevMonth,
        price: sharePrices[lastDateOfPrevMonth],
        note: null
      });
    }
  }
}

// ADD NEXT MONTH: February 2026 uses January 2026's last day
const lastMonth = months[months.length - 1]; // "2026-01"
const lastMonthDates = datesByMonth[lastMonth].sort();
const lastDateOverall = lastMonthDates[lastMonthDates.length - 1]; // "2026-01-31"

// Add February 2026 with January's last price
monthData.push({
  month: "2026-02",
  date: lastDateOverall,
  price: sharePrices[lastDateOverall],
  note: "Next month entry price"
});

console.log('\nGenerated month table:');
console.log('First entries:');
monthData.slice(0, 5).forEach(entry => {
  console.log(`${entry.month}: €${entry.price.toFixed(2)} (${entry.date})`);
});

console.log('\nLast entries:');
monthData.slice(-5).forEach(entry => {
  console.log(`${entry.month}: €${entry.price.toFixed(2)} (${entry.date}) ${entry.note || ''}`);
});

console.log(`\nTotal: ${monthData.length} month entries (including next month)`);

// Write to file
fs.writeFileSync('lib/month-end-data.json', JSON.stringify(monthData, null, 2));
console.log('Written to lib/month-end-data.json');
