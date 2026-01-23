# NAV vs CCI30 Dashboard

Real-time dashboard comparing your portfolio NAV against the CCI30 cryptocurrency index.

## Features

- 📊 Historical data from March 2022
- 🔄 Auto-updates daily via Vercel Cron
- 📈 Interactive date range selection
- 📉 Performance metrics: Return, Alpha, Beta, Correlation
- 🎯 Normalized comparison view
- 📱 Responsive design

## Data Sources

- **NAV**: adam-nav-api.vercel.app (live) + historical Google Sheets data
- **CCI30**: cci30.com official OHLCV data

## Deploy to Vercel

1. Push this repo to GitHub
2. Import to Vercel: https://vercel.com/new
3. Deploy!

The cron job in `vercel.json` will automatically fetch new data daily at 02:00 UTC.

## Environment Variables (optional)

- `CRON_SECRET`: Secret for authenticating cron job requests

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:3000
