import { NextResponse } from 'next/server';
import { NAV_DATA, CCI30_DATA, CONFIG } from '@/lib/data';

// API endpoint to get all historical data + fetch latest
export async function GET() {
  try {
    // Start with historical data
    const navData = { ...NAV_DATA };
    const cci30Data = { ...CCI30_DATA };
    const scaleFactor = CONFIG.scale_factor;

    // Try to fetch latest NAV
    try {
      const navResponse = await fetch('https://adam-nav-api.vercel.app/api/nav', { 
        cache: 'no-store',
        next: { revalidate: 3600 } // Cache for 1 hour
      });
      if (navResponse.ok) {
        const data = await navResponse.json();
        if (data.ok && data.gav_eur) {
          const today = new Date().toISOString().split('T')[0];
          // Scale the new value to match historical data
          navData[today] = Math.round(data.gav_eur * scaleFactor * 10000) / 10000;
        }
      }
    } catch (e) {
      console.error('Failed to fetch latest NAV:', e);
    }

    // Try to fetch latest CCI30
    try {
      const cci30Response = await fetch('https://cci30.com/ajax/getIndexHistory.php', {
        cache: 'no-store',
        next: { revalidate: 3600 }
      });
      if (cci30Response.ok) {
        const csvText = await cci30Response.text();
        const lines = csvText.trim().split('\n');
        // Parse latest entries (CSV is sorted newest first)
        for (let i = 1; i < Math.min(lines.length, 10); i++) {
          const parts = lines[i].split(',');
          if (parts.length >= 5) {
            const [date, , , , close] = parts;
            if (date && close && !cci30Data[date]) {
              cci30Data[date] = parseFloat(close);
            }
          }
        }
      }
    } catch (e) {
      console.error('Failed to fetch latest CCI30:', e);
    }

    return NextResponse.json({
      nav: navData,
      cci30: cci30Data,
      config: CONFIG,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
