import { NextResponse } from 'next/server';
import { CCI30_DATA } from '@/lib/data';

const CCI30_SOURCE = 'https://cci30.com/ajax/getIndexHistory.php';

// Parse CCI30 CSV data
function parseCci30Csv(csv: string): Record<string, number> {
  const lines = csv.trim().split('\n');
  const data: Record<string, number> = {};
  
  // Format: Date,Open,High,Low,Close,Volume
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',');
    if (parts.length >= 5) {
      const date = parts[0]; // YYYY-MM-DD
      const close = parseFloat(parts[4]);
      
      if (date && !isNaN(close)) {
        data[date] = Math.round(close * 100) / 100;
      }
    }
  }
  
  return data;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const live = searchParams.get('live') === 'true';
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const format = searchParams.get('format') || 'json';
  
  try {
    let data: Record<string, number>;
    let source: string;
    
    if (live) {
      // Fetch live from CCI30.com
      const res = await fetch(CCI30_SOURCE, { 
        next: { revalidate: 3600 } // Cache 1 hour
      });
      
      if (!res.ok) {
        throw new Error(`CCI30 API returned ${res.status}`);
      }
      
      const csv = await res.text();
      data = parseCci30Csv(csv);
      source = 'live';
    } else {
      // Use cached data
      data = CCI30_DATA;
      source = 'cached';
    }
    
    // Filter by date range if specified
    let filteredData = data;
    if (from || to) {
      filteredData = {};
      for (const [date, value] of Object.entries(data)) {
        if ((!from || date >= from) && (!to || date <= to)) {
          filteredData[date] = value;
        }
      }
    }
    
    const dates = Object.keys(filteredData).sort();
    const stats = {
      count: dates.length,
      from: dates[0],
      to: dates[dates.length - 1],
      latest: filteredData[dates[dates.length - 1]],
    };
    
    // CSV format
    if (format === 'csv') {
      let csv = 'date,close\n';
      for (const date of dates) {
        csv += `${date},${filteredData[date]}\n`;
      }
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="cci30-data.csv"'
        }
      });
    }
    
    // Array format (for charts)
    if (format === 'array') {
      const array = dates.map(date => ({
        date,
        close: filteredData[date]
      }));
      return NextResponse.json({
        ok: true,
        source,
        stats,
        data: array
      });
    }
    
    // Default: object format
    return NextResponse.json({
      ok: true,
      source,
      stats,
      data: filteredData
    });
    
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: String(error)
    }, { status: 500 });
  }
}
