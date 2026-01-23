import Dashboard from '@/components/Dashboard';
import { NAV_DATA, CCI30_DATA, CONFIG } from '@/lib/data';

// Revalidate data every hour
export const revalidate = 3600;

async function getData() {
  const navData = { ...NAV_DATA };
  const cci30Data = { ...CCI30_DATA };
  const scaleFactor = CONFIG.scale_factor;
  let lastUpdated = new Date().toISOString();

  // Try to fetch latest NAV
  try {
    const navResponse = await fetch('https://adam-nav-api.vercel.app/api/nav', { 
      cache: 'no-store' 
    });
    if (navResponse.ok) {
      const data = await navResponse.json();
      if (data.ok && data.gav_eur) {
        const today = new Date().toISOString().split('T')[0];
        navData[today] = Math.round(data.gav_eur * scaleFactor * 10000) / 10000;
        lastUpdated = data.timestamp || lastUpdated;
      }
    }
  } catch (e) {
    console.error('Failed to fetch latest NAV:', e);
  }

  // Try to fetch latest CCI30
  try {
    const cci30Response = await fetch('https://cci30.com/ajax/getIndexHistory.php', {
      cache: 'no-store'
    });
    if (cci30Response.ok) {
      const csvText = await cci30Response.text();
      const lines = csvText.trim().split('\n');
      for (let i = 1; i < Math.min(lines.length, 10); i++) {
        const parts = lines[i].split(',');
        if (parts.length >= 5) {
          const [date, , , , close] = parts;
          if (date && close) {
            cci30Data[date] = parseFloat(close);
          }
        }
      }
    }
  } catch (e) {
    console.error('Failed to fetch latest CCI30:', e);
  }

  return { navData, cci30Data, lastUpdated };
}

export default async function Home() {
  const { navData, cci30Data, lastUpdated } = await getData();
  
  return (
    <main>
      <Dashboard 
        navData={navData} 
        cci30Data={cci30Data} 
        lastUpdated={lastUpdated}
      />
    </main>
  );
}
