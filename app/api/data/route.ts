import { NextResponse } from 'next/server';
import { SHARE_PRICES, CCI30_DATA, HISTORIC_DATA } from '@/lib/data';

// Clean API endpoint - serves static data only (no live API calls)
export async function GET() {
  try {
    return NextResponse.json({
      sharePrices: SHARE_PRICES,
      cci30: CCI30_DATA,
      historicInfo: {
        cutoff: HISTORIC_DATA.cutoff,
        source: HISTORIC_DATA.source,
        comment: HISTORIC_DATA.comment
      },
      lastUpdated: new Date().toISOString(),
      message: "Data is updated 2x daily via GitHub Actions at 01:00 and 13:00 UTC"
    });

  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
