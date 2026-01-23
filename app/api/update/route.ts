import { NextResponse } from 'next/server';

// This endpoint is called daily by Vercel Cron to update data
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const results: string[] = [];

    // 1. Fetch latest NAV
    const navResponse = await fetch('https://adam-nav-api.vercel.app/api/nav', { cache: 'no-store' });
    if (navResponse.ok) {
      const navData = await navResponse.json();
      if (navData.ok && navData.gav_eur) {
        const today = new Date().toISOString().split('T')[0];
        results.push(`NAV: ${navData.gav_eur} (${today})`);
      }
    }

    // 2. Fetch latest CCI30
    const cci30Response = await fetch('https://cci30.com/ajax/getIndexHistory.php', { cache: 'no-store' });
    if (cci30Response.ok) {
      const csvText = await cci30Response.text();
      const lines = csvText.trim().split('\n');
      if (lines.length > 1) {
        const [date, , , , close] = lines[1].split(',');
        results.push(`CCI30: ${close} (${date})`);
      }
    }

    return NextResponse.json({ success: true, timestamp: new Date().toISOString(), results });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
