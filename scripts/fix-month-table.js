// Fix month table: each month shows end-of-previous-month value
// Exception: March 2022 starts with 1000
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

// Sort months
const months = Object.keys(datesByMonth).sort();
console.log(`Found ${months.length} months from ${months[0]} to ${months[months.length-1]}`);

// Generate table
for (let i = 0; i < months.length; i++) {
  const month = months[i];
  
  if (month === '2022-03') {
    // March 2022 starts with 1000
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
        note: month === '2026-01' ? "MTD" : null
      });
    }
  }
}

console.log('\nGenerated month table:');
console.log('First entries:');
monthData.slice(0, 5).forEach(entry => {
  console.log(`${entry.month}: €${entry.price.toFixed(2)} (${entry.date})`);
});

console.log('\nLast entries:');
monthData.slice(-5).forEach(entry => {
  console.log(`${entry.month}: €${entry.price.toFixed(2)} (${entry.date})`);
});

console.log(`\nTotal: ${monthData.length} month entries`);

// Write to file
fs.writeFileSync('lib/month-end-data.json', JSON.stringify(monthData, null, 2));
console.log('Written to lib/month-end-data.json');
