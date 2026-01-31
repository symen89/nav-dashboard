// Generate month-end table data from share prices
const fs = require('fs');

const sharePrices = JSON.parse(fs.readFileSync('lib/share-prices.json', 'utf8'));

// Find month-end dates (last day of each month)
const monthEndData = [];
const dates = Object.keys(sharePrices).sort();

for (let i = 0; i < dates.length; i++) {
  const currentDate = new Date(dates[i]);
  const nextDate = i < dates.length - 1 ? new Date(dates[i + 1]) : null;
  
  // Is this the last day we have data for this month?
  const isMonthEnd = !nextDate || 
                    nextDate.getMonth() !== currentDate.getMonth() || 
                    nextDate.getFullYear() !== currentDate.getFullYear();
  
  if (isMonthEnd) {
    const yearMonth = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;
    monthEndData.push({
      month: yearMonth,
      date: dates[i],
      price: sharePrices[dates[i]],
      note: i === dates.length - 1 ? "MTD" : null // Mark current month as Month-To-Date
    });
  }
}

console.log(`Generated ${monthEndData.length} month-end entries`);
console.log('Latest entries:');
monthEndData.slice(-5).forEach(entry => {
  console.log(`${entry.month}: €${entry.price.toFixed(2)} (${entry.date})`);
});

// Write to file
fs.writeFileSync('lib/month-end-data.json', JSON.stringify(monthEndData, null, 2));
console.log('\nWritten to lib/month-end-data.json');