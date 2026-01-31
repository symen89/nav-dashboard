'use client';

import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';
import { SHARE_PRICES, CCI30_DATA, CONFIG } from '@/lib/data';

// Portfolio Holdings (snapshot from Octav API - updated manually to save credits)
// Percentages calculated based on USD values at time of snapshot
const PORTFOLIO_HOLDINGS = [
  { symbol: 'WETH', name: 'Wrapped Ether', balance: 55.49, pct: 55.4, img: 'https://images.octav.fi/chains/ethereum_icon.svg' },
  { symbol: 'WBTC', name: 'Wrapped Bitcoin', balance: 1.003, pct: 30.0, img: 'https://images.octav.fi/tokens/small/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599_small_icon.png' },
  { symbol: 'LINK', name: 'Chainlink', balance: 2275.98, pct: 8.9, img: 'https://images.octav.fi/tokens/small/0x514910771af9ca656af840dff83e8264ecf986ca_small_icon.png' },
  { symbol: 'WTAO', name: 'Wrapped TAO', balance: 53.00, pct: 4.1, img: 'https://images.octav.fi/tokens/small/wtao_logo_758042fd-ead0-45a2-af1b-bf0c20ae2fbc.png' },
  { symbol: 'POL', name: 'Polygon', balance: 20168.28, pct: 0.8, img: 'https://images.octav.fi/chains/polygon_icon.svg' },
  { symbol: 'EUROC', name: 'Euro Coin', balance: 1543.07, pct: 0.7, img: 'https://images.octav.fi/tokens/small/0x1abaea1f7c830bd89acc67ec4af516284b1bc33c_small_icon.png' },
  { symbol: 'MLN', name: 'Enzyme', balance: 56.43, pct: 0.1, img: 'https://images.octav.fi/tokens/small/0xec67005c4e498ec7f55e092bd1d35cbc47c91892_small_icon.png' },
];
const PORTFOLIO_LAST_UPDATED = '2026-01-29';

// Officiële maand-einde NAV (Prijs per Participatie)
const MONTH_END_NAV = [
  { month: "2022-03", date: "2022-03-31", price: 1081.14 },
  { month: "2022-04", date: "2022-04-30", price: 982.76 },
  { month: "2022-05", date: "2022-05-31", price: 775.59 },
  { month: "2022-06", date: "2022-06-30", price: 559.99 },
  { month: "2022-07", date: "2022-07-31", price: 764.59 },
  { month: "2022-08", date: "2022-08-31", price: 673.76 },
  { month: "2022-09", date: "2022-09-30", price: 653.67 },
  { month: "2022-10", date: "2022-10-31", price: 711.56 },
  { month: "2022-11", date: "2022-11-30", price: 570.49 },
  { month: "2022-12", date: "2022-12-31", price: 512.68 },
  { month: "2023-01", date: "2023-01-31", price: 651.93 },
  { month: "2023-02", date: "2023-02-28", price: 700.46 },
  { month: "2023-03", date: "2023-03-31", price: 708.99 },
  { month: "2023-04", date: "2023-04-30", price: 718.11 },
  { month: "2023-05", date: "2023-05-31", price: 710.63 },
  { month: "2023-06", date: "2023-06-30", price: 670.91 },
  { month: "2023-07", date: "2023-07-31", price: 704.70 },
  { month: "2023-08", date: "2023-08-31", price: 621.21 },
  { month: "2023-09", date: "2023-09-30", price: 658.23 },
  { month: "2023-10", date: "2023-10-31", price: 752.04 },
  { month: "2023-11", date: "2023-11-30", price: 838.01 },
  { month: "2023-12", date: "2023-12-31", price: 931.10 },
  { month: "2024-01", date: "2024-01-31", price: 928.08 },
  { month: "2024-02", date: "2024-02-29", price: 1186.65 },
  { month: "2024-03", date: "2024-03-31", price: 1263.32 },
  { month: "2024-04", date: "2024-04-30", price: 1085.46 },
  { month: "2024-05", date: "2024-05-31", price: 1228.62 },
  { month: "2024-06", date: "2024-06-30", price: 1079.60 },
  { month: "2024-07", date: "2024-07-31", price: 1078.65 },
  { month: "2024-08", date: "2024-08-31", price: 856.06 },
  { month: "2024-09", date: "2024-09-30", price: 915.87 },
  { month: "2024-10", date: "2024-10-31", price: 948.57 },
  { month: "2024-11", date: "2024-11-30", price: 1330.32 },
  { month: "2024-12", date: "2024-12-31", price: 1296.95 },
  { month: "2025-01", date: "2025-01-31", price: 1330.99 },
  { month: "2025-02", date: "2025-02-28", price: 977.54 },
  { month: "2025-03", date: "2025-03-31", price: 774.58 },
  { month: "2025-04", date: "2025-04-30", price: 784.35 },
  { month: "2025-05", date: "2025-05-31", price: 958.98 },
  { month: "2025-06", date: "2025-06-30", price: 937.21 },
  { month: "2025-07", date: "2025-07-31", price: 1263.63 },
  { month: "2025-08", date: "2025-08-31", price: 1337.26 },
  { month: "2025-09", date: "2025-09-30", price: 1311.45 },
  { month: "2025-10", date: "2025-10-30", price: 1212.64 },
  { month: "2025-11", date: "2025-11-30", price: 923.36 },
  { month: "2025-12", date: "2025-12-31", price: 874.63 },
  { month: "2026-01", date: "2026-01-29", price: 861.81, note: "MTD" },
];

const MONTH_NAMES = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

// Tooltip component - appears below on mobile to avoid overflow
const InfoTooltip = ({ text }: { text: string }) => (
  <span className="relative inline-block ml-1 group">
    <span className="cursor-help text-[#6b7585] hover:text-[#2098d1] text-xs">ⓘ</span>
    <span className="fixed sm:absolute top-auto sm:top-full left-4 right-4 sm:left-auto sm:right-0 mt-1 sm:mt-2 px-3 py-2 text-xs text-white bg-[#161d26] border border-[#2a3441] rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-lg sm:w-56 leading-relaxed">
      {text}
    </span>
  </span>
);

// Stat tooltips
const STAT_TOOLTIPS: Record<string, string> = {
  startPrice: 'De NAV (Net Asset Value) per participatie aan het begin van de geselecteerde periode.',
  endPrice: 'De huidige NAV per participatie aan het eind van de geselecteerde periode.',
  navReturn: 'Het totaalrendement van het fonds over de geselecteerde periode, berekend als (eindprijs - startprijs) / startprijs.',
  alpha: 'Outperformance ten opzichte van de CCI30 benchmark. Positief = beter dan de markt.',
  maxDrawdown: 'De grootste piek-naar-dal daling in de geselecteerde periode. Meet het maximale verlies.',
  volatility: 'Geannualiseerde standaarddeviatie van dagelijkse rendementen. Hogere waarde = meer koersschommelingen.',
  sharpeRatio: 'Rendement per eenheid risico. Hoger = beter risico-gecorrigeerd rendement. >1 is goed, >2 is excellent.',
  winRate: 'Percentage dagen met positief rendement in de geselecteerde periode.',
  beta: 'Gevoeligheid voor marktbewegingen. Beta 1 = beweegt gelijk met markt, <1 = defensiever, >1 = agressiever.',
  correlation: 'Mate waarin het fonds meebeweegt met de CCI30 index. 100% = perfecte correlatie.',
};

export default function SharePriceDashboard() {
  const allDates = useMemo(() => Object.keys(SHARE_PRICES).sort(), []);

  const [view, setView] = useState('both');
  const [showTable, setShowTable] = useState(true);
  const [rangeStart, setRangeStart] = useState(0);
  const [rangeEnd, setRangeEnd] = useState(allDates.length - 1);
  const [startDateInput, setStartDateInput] = useState(allDates[0]);
  const [endDateInput, setEndDateInput] = useState(allDates[allDates.length - 1]);

  // Helper to find date index X months ago
  const getDateMonthsAgo = (months: number): number => {
    const lastDate = new Date(allDates[allDates.length - 1]);
    const targetDate = new Date(lastDate);
    targetDate.setMonth(targetDate.getMonth() - months);
    const targetStr = targetDate.toISOString().split('T')[0];
    const idx = allDates.findIndex(d => d >= targetStr);
    return idx !== -1 ? idx : 0;
  };

  // Preset periods
  const presets = [
    { label: 'Alles', start: 0, end: allDates.length - 1 },
    { label: 'YTD', start: allDates.findIndex(d => d >= '2026-01-01'), end: allDates.length - 1 },
    { label: '2025', start: allDates.findIndex(d => d >= '2025-01-01'), end: allDates.findIndex(d => d >= '2026-01-01') - 1 },
    { label: '2024', start: allDates.findIndex(d => d >= '2024-01-01'), end: allDates.findIndex(d => d >= '2025-01-01') - 1 },
    { label: '2023', start: allDates.findIndex(d => d >= '2023-01-01'), end: allDates.findIndex(d => d >= '2024-01-01') - 1 },
    { label: '6M', start: getDateMonthsAgo(6), end: allDates.length - 1 },
    { label: '3M', start: getDateMonthsAgo(3), end: allDates.length - 1 },
    { label: '1M', start: getDateMonthsAgo(1), end: allDates.length - 1 },
  ];

  const applyPreset = (preset: { label: string; start: number; end: number }) => {
    const start = Math.max(0, preset.start);
    const end = Math.min(allDates.length - 1, preset.end);
    setRangeStart(start);
    setRangeEnd(end);
    setStartDateInput(allDates[start]);
    setEndDateInput(allDates[end]);
  };

  const handleDateInputChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setStartDateInput(value);
      const idx = allDates.findIndex(d => d >= value);
      if (idx !== -1) setRangeStart(idx);
    } else {
      setEndDateInput(value);
      const idx = allDates.findIndex(d => d > value);
      if (idx !== -1) setRangeEnd(idx - 1);
      else setRangeEnd(allDates.length - 1);
    }
  };

  const handleSliderChange = (type: 'start' | 'end', value: string) => {
    const idx = parseInt(value);
    if (type === 'start') {
      setRangeStart(Math.min(idx, rangeEnd - 1));
      setStartDateInput(allDates[Math.min(idx, rangeEnd - 1)]);
    } else {
      setRangeEnd(Math.max(idx, rangeStart + 1));
      setEndDateInput(allDates[Math.max(idx, rangeStart + 1)]);
    }
  };

  // Filter and compute chart data based on selected range
  const { chartData, stats } = useMemo(() => {
    const filteredDates = allDates.slice(rangeStart, rangeEnd + 1);
    const baseDate = filteredDates[0];
    const basePrice = SHARE_PRICES[baseDate];
    const baseCCI30 = CCI30_DATA[baseDate] || CCI30_DATA[allDates.find(d => CCI30_DATA[d] && d >= baseDate) || ''];

    const data = filteredDates.map((date, idx) => {
      // CCI30 data is shifted 1 day forward to align with NAV timing
      // (NAV reacts ~1 day after market movements)
      const prevDate = idx > 0 ? filteredDates[idx - 1] : date;
      const cci30Value = CCI30_DATA[prevDate];
      return {
        date,
        displayDate: new Date(date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' }),
        sharePrice: SHARE_PRICES[date],
        priceNorm: (SHARE_PRICES[date] / basePrice) * 100,
        cci30Norm: cci30Value ? (cci30Value / baseCCI30) * 100 : null,
      };
    });

    const prices = filteredDates.map(d => SHARE_PRICES[d]);
    const startPrice = prices[0];
    const endPrice = prices[prices.length - 1];
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);

    // CCI30 stats also shifted by 1 day to match the chart alignment
    const cci30Start = baseCCI30;
    const lastIdx = filteredDates.length - 1;
    const shiftedLastDate = lastIdx > 0 ? filteredDates[lastIdx - 1] : filteredDates[0];
    const cci30End = CCI30_DATA[shiftedLastDate] || cci30Start;

    // Calculate Max Drawdown
    let maxDrawdown = 0;
    let peak = prices[0];
    for (const price of prices) {
      if (price > peak) peak = price;
      const drawdown = ((peak - price) / peak) * 100;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    }

    // Calculate daily returns for volatility & Sharpe
    const dailyReturns: number[] = [];
    for (let i = 1; i < prices.length; i++) {
      dailyReturns.push((prices[i] - prices[i-1]) / prices[i-1]);
    }
    
    // Volatility (annualized, assuming 365 days)
    const avgReturn = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
    const variance = dailyReturns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / dailyReturns.length;
    const dailyVol = Math.sqrt(variance);
    const annualizedVol = dailyVol * Math.sqrt(365) * 100;

    // Sharpe Ratio (assuming 0% risk-free rate for crypto)
    const annualizedReturn = avgReturn * 365;
    const sharpeRatio = annualizedVol > 0 ? (annualizedReturn / (dailyVol * Math.sqrt(365))) : 0;

    // Win rate (% of days with positive return)
    const winningDays = dailyReturns.filter(r => r > 0).length;
    const winRate = (winningDays / dailyReturns.length) * 100;

    // Beta & Correlation vs CCI30
    const cci30Returns: number[] = [];
    const navReturnsForCorr: number[] = [];
    for (let i = 1; i < filteredDates.length; i++) {
      const prevDate = filteredDates[i - 1];
      const currDate = filteredDates[i];
      const prevCCI = CCI30_DATA[prevDate];
      const currCCI = CCI30_DATA[currDate];
      if (prevCCI && currCCI) {
        cci30Returns.push((currCCI - prevCCI) / prevCCI);
        navReturnsForCorr.push(dailyReturns[i - 1] || 0);
      }
    }

    let beta = 0;
    let correlation = 0;
    if (cci30Returns.length > 1) {
      const avgNav = navReturnsForCorr.reduce((a, b) => a + b, 0) / navReturnsForCorr.length;
      const avgCCI = cci30Returns.reduce((a, b) => a + b, 0) / cci30Returns.length;
      let covariance = 0;
      let varCCI = 0;
      let varNav = 0;
      for (let i = 0; i < cci30Returns.length; i++) {
        covariance += (navReturnsForCorr[i] - avgNav) * (cci30Returns[i] - avgCCI);
        varCCI += Math.pow(cci30Returns[i] - avgCCI, 2);
        varNav += Math.pow(navReturnsForCorr[i] - avgNav, 2);
      }
      covariance /= cci30Returns.length;
      varCCI /= cci30Returns.length;
      varNav /= cci30Returns.length;
      beta = varCCI > 0 ? covariance / varCCI : 0;
      correlation = (varCCI > 0 && varNav > 0) ? covariance / (Math.sqrt(varCCI) * Math.sqrt(varNav)) : 0;
    }

    return {
      chartData: data,
      stats: {
        startPrice,
        endPrice,
        maxPrice,
        minPrice,
        navReturn: ((endPrice - startPrice) / startPrice) * 100,
        cci30Return: ((cci30End - cci30Start) / cci30Start) * 100,
        alpha: ((endPrice - startPrice) / startPrice) * 100 - ((cci30End - cci30Start) / cci30Start) * 100,
        days: filteredDates.length,
        startDate: filteredDates[0],
        endDate: filteredDates[filteredDates.length - 1],
        maxDrawdown,
        volatility: annualizedVol,
        sharpeRatio,
        winRate,
        beta,
        correlation,
      }
    };
  }, [rangeStart, rangeEnd, allDates]);

  // Group month-end data by year for table
  const navByYear = useMemo(() => {
    const years: Record<string, Record<number, typeof MONTH_END_NAV[0]>> = {};
    MONTH_END_NAV.forEach(item => {
      const year = item.month.split('-')[0];
      if (!years[year]) years[year] = {};
      const monthIdx = parseInt(item.month.split('-')[1]) - 1;
      years[year][monthIdx] = item;
    });
    return years;
  }, []);

  const formatEUR = (v: number) => `€${v.toFixed(2)}`;
  const formatPct = (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`;
  const formatDate = (d: string) => new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen text-white bg-[#0f151b]">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0f151b] to-[#1e2731] text-white py-8 px-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <img src="https://adamcapital.nl/assets/img/logo-adam-wit.svg" alt="A-DAM Capital" className="h-10" />
          <div>
            <h1 className="text-2xl font-bold">Prestaties Fonds A</h1>
            <p className="text-[#8b95a5] text-sm">
              {formatDate(stats.startDate)} - {formatDate(stats.endDate)}
            </p>
          </div>
        </div>
      </div>
      
<div className="max-w-6xl mx-auto px-4 pt-4">

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-[#161d26] p-3 rounded-lg border border-[#2a3441] shadow-sm">
            <p className="text-[#6b7585] text-xs">Startprijs<InfoTooltip text={STAT_TOOLTIPS.startPrice} /></p>
            <p className="text-xl font-bold text-white">{formatEUR(stats.startPrice)}</p>
          </div>
          <div className="bg-[#161d26] p-3 rounded-lg border border-[#2a3441] shadow-sm">
            <p className="text-[#6b7585] text-xs">Eindprijs<InfoTooltip text={STAT_TOOLTIPS.endPrice} /></p>
            <p className="text-xl font-bold text-white">{formatEUR(stats.endPrice)}</p>
          </div>
          <div className="bg-[#161d26] p-3 rounded-lg border border-[#2a3441] shadow-sm">
            <p className="text-[#6b7585] text-xs">NAV Return<InfoTooltip text={STAT_TOOLTIPS.navReturn} /></p>
            <p className={`text-xl font-bold ${stats.navReturn >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
              {formatPct(stats.navReturn)}
            </p>
          </div>
          <div className="bg-[#161d26] p-3 rounded-lg border border-[#2a3441] shadow-sm">
            <p className="text-[#6b7585] text-xs">Alpha vs CCI30<InfoTooltip text={STAT_TOOLTIPS.alpha} /></p>
            <p className={`text-xl font-bold ${stats.alpha >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
              {formatPct(stats.alpha)}
            </p>
          </div>
        </div>

        {/* Advanced Stats */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
          <div className="bg-[#161d26] p-3 rounded-lg border border-[#2a3441] shadow-sm">
            <p className="text-[#6b7585] text-xs">Max Drawdown<InfoTooltip text={STAT_TOOLTIPS.maxDrawdown} /></p>
            <p className="text-lg font-bold text-[#ef4444]">-{stats.maxDrawdown.toFixed(1)}%</p>
          </div>
          <div className="bg-[#161d26] p-3 rounded-lg border border-[#2a3441] shadow-sm">
            <p className="text-[#6b7585] text-xs">Volatiliteit<InfoTooltip text={STAT_TOOLTIPS.volatility} /></p>
            <p className="text-lg font-bold text-[#f97316]">{stats.volatility.toFixed(1)}%</p>
          </div>
          <div className="bg-[#161d26] p-3 rounded-lg border border-[#2a3441] shadow-sm">
            <p className="text-[#6b7585] text-xs">Sharpe Ratio<InfoTooltip text={STAT_TOOLTIPS.sharpeRatio} /></p>
            <p className={`text-lg font-bold ${stats.sharpeRatio >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
              {stats.sharpeRatio.toFixed(2)}
            </p>
          </div>
          <div className="bg-[#161d26] p-3 rounded-lg border border-[#2a3441] shadow-sm">
            <p className="text-[#6b7585] text-xs">Win Rate<InfoTooltip text={STAT_TOOLTIPS.winRate} /></p>
            <p className="text-lg font-bold text-[#2098d1]">{stats.winRate.toFixed(0)}%</p>
          </div>
          <div className="bg-[#161d26] p-3 rounded-lg border border-[#2a3441] shadow-sm">
            <p className="text-[#6b7585] text-xs">Beta vs CCI30<InfoTooltip text={STAT_TOOLTIPS.beta} /></p>
            <p className="text-lg font-bold text-white">{stats.beta.toFixed(2)}</p>
          </div>
          <div className="bg-[#161d26] p-3 rounded-lg border border-[#2a3441] shadow-sm">
            <p className="text-[#6b7585] text-xs">Correlatie<InfoTooltip text={STAT_TOOLTIPS.correlation} /></p>
            <p className="text-lg font-bold text-white">{(stats.correlation * 100).toFixed(0)}%</p>
          </div>
        </div>

        {/* Date Range Controls */}
        <div className="bg-[#161d26] p-4 rounded-xl border border-[#2a3441] shadow-sm mb-4">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-[#6b7585] text-sm">Periode:</span>
            {presets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => applyPreset(preset)}
                className="px-2 py-1 text-xs rounded bg-[#1e2731] hover:bg-[#2a3441] text-white transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Date inputs */}
          <div className="flex flex-wrap gap-4 mb-3">
            <div className="flex items-center gap-2">
              <label className="text-[#6b7585] text-sm">Van:</label>
              <input
                type="date"
                value={startDateInput}
                min={allDates[0]}
                max={endDateInput}
                onChange={(e) => handleDateInputChange('start', e.target.value)}
                className="bg-[#1e2731] border border-[#2a3441] rounded px-2 py-1 text-sm text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[#6b7585] text-sm">Tot:</label>
              <input
                type="date"
                value={endDateInput}
                min={startDateInput}
                max={allDates[allDates.length - 1]}
                onChange={(e) => handleDateInputChange('end', e.target.value)}
                className="bg-[#1e2731] border border-[#2a3441] rounded px-2 py-1 text-sm text-white"
              />
            </div>
          </div>

          {/* Range sliders */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-[#6b7585] text-xs w-12">Start:</span>
              <input
                type="range"
                min="0"
                max={allDates.length - 1}
                value={rangeStart}
                onChange={(e) => handleSliderChange('start', e.target.value)}
                className="flex-1 h-2 bg-[#e5e7eb] rounded-lg appearance-none cursor-pointer accent-[#2098d1]"
              />
              <span className="text-[#6b7585] text-xs w-24">{formatDate(allDates[rangeStart]).split(' ').slice(0, 2).join(' ')}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[#6b7585] text-xs w-12">Eind:</span>
              <input
                type="range"
                min="0"
                max={allDates.length - 1}
                value={rangeEnd}
                onChange={(e) => handleSliderChange('end', e.target.value)}
                className="flex-1 h-2 bg-[#e5e7eb] rounded-lg appearance-none cursor-pointer accent-[#2098d1]"
              />
              <span className="text-[#6b7585] text-xs w-24">{formatDate(allDates[rangeEnd]).split(' ').slice(0, 2).join(' ')}</span>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 mb-3 flex-wrap">
          <button
            onClick={() => setView('shareprice')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${view === 'shareprice' ? 'bg-[#2098d1] text-white' : 'bg-[#1e2731] text-white hover:bg-[#2a3441]'}`}>
            💶 Prijs per Participatie
          </button>
          <button
            onClick={() => setView('normalized')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${view === 'normalized' ? 'bg-[#2098d1] text-white' : 'bg-[#1e2731] text-white hover:bg-[#2a3441]'}`}>
            📊 vs CCI30
          </button>
          <button
            onClick={() => setView('both')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${view === 'both' ? 'bg-[#2098d1] text-white' : 'bg-[#1e2731] text-white hover:bg-[#2a3441]'}`}>
            🔄 Beide
          </button>
          <div className="flex-1" />
          <button
            onClick={() => setShowTable(!showTable)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${showTable ? 'bg-[#22c55e] text-white' : 'bg-[#1e2731] text-white hover:bg-[#2a3441]'}`}>
            📋 Maandtabel
          </button>
        </div>

        {/* Share Price Chart */}
        {(view === 'shareprice' || view === 'both') && (
          <div className="bg-[#161d26] p-4 rounded-xl border border-[#2a3441] shadow-sm mb-4">
            <h2 className="text-sm font-medium mb-3 text-[#6b7585]">Prijs per Participatie (EUR)</h2>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2098d1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2098d1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3441" />
                <XAxis 
                  dataKey="displayDate" 
                  stroke="#6b7585" 
                  tick={{ fill: '#6b7585', fontSize: 10 }}
                  interval={Math.max(1, Math.floor(chartData.length / 10))}
                />
                <YAxis 
                  stroke="#6b7585" 
                  tick={{ fill: '#6b7585', fontSize: 10 }}
                  domain={['auto', 'auto']}
                  tickFormatter={(v) => `€${v}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e2731', border: '1px solid #2a3441', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value) => [`€${Number(value).toFixed(2)}`, 'Prijs per Participatie']}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.date ? formatDate(payload[0].payload.date) : ''}
                />
                <ReferenceLine y={stats.startPrice} stroke="#6b7585" strokeDasharray="5 5" />
                <Area type="monotone" dataKey="sharePrice" stroke="#2098d1" strokeWidth={2} fill="url(#colorPrice)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Normalized Chart */}
        {(view === 'normalized' || view === 'both') && (
          <div className="bg-[#161d26] p-4 rounded-xl border border-[#2a3441] shadow-sm mb-4">
            <h2 className="text-sm font-medium mb-3 text-[#6b7585]">Performance vs CCI30 (100 = startdatum)</h2>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3441" />
                <XAxis 
                  dataKey="displayDate" 
                  stroke="#6b7585" 
                  tick={{ fill: '#6b7585', fontSize: 10 }}
                  interval={Math.max(1, Math.floor(chartData.length / 10))}
                />
                <YAxis 
                  stroke="#6b7585" 
                  tick={{ fill: '#6b7585', fontSize: 10 }}
                  domain={['auto', 'auto']}
                  tickFormatter={(v) => `${v.toFixed(0)}%`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e2731', border: '1px solid #2a3441', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value, name) => [`${Number(value).toFixed(1)}%`, name]}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.date ? formatDate(payload[0].payload.date) : ''}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <ReferenceLine y={100} stroke="#6b7585" strokeDasharray="5 5" />
                <Line type="monotone" dataKey="priceNorm" name="A-DAM Capital" stroke="#2098d1" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="cci30Norm" name="CCI30 Index" stroke="#f97316" strokeWidth={2} dot={false} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Monthly NAV Table */}
        {showTable && (
          <div className="bg-[#161d26] p-4 rounded-xl border border-[#2a3441] shadow-sm mb-4">
            <h2 className="text-sm font-medium mb-3 text-[#6b7585]">📋 Officiële NAV per Maand (Prijs per Participatie)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2a3441]">
                    <th className="text-left py-2 px-2 text-[#6b7585] font-medium">Jaar</th>
                    {MONTH_NAMES.map((m, i) => (
                      <th key={i} className="text-right py-2 px-1 text-[#6b7585] font-medium">{m}</th>
                    ))}
                    <th className="text-right py-2 px-2 text-[#6b7585] font-medium">Jaar %</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(navByYear).sort().map(year => {
                    const yearData = navByYear[year];
                    const firstMonth = Object.keys(yearData).sort((a,b) => Number(a)-Number(b))[0];
                    const lastMonth = Object.keys(yearData).sort((a,b) => Number(b)-Number(a))[0];
                    const startVal = year === '2022' ? 1000 : (navByYear[String(parseInt(year)-1)]?.[11]?.price || yearData[Number(firstMonth)]?.price);
                    const endVal = yearData[Number(lastMonth)]?.price || startVal;
                    const yearReturn = ((endVal - startVal) / startVal) * 100;

                    return (
                      <tr key={year} className="border-b border-[#2a3441]/50 hover:bg-[#1e2731]">
                        <td className="py-2 px-2 font-medium text-white">{year}</td>
                        {MONTH_NAMES.map((_, i) => {
                          const item = yearData[i];
                          if (!item) return <td key={i} className="text-right py-2 px-1 text-[#9ca3af]">-</td>;

                          // Calculate month change
                          let prevPrice;
                          if (i === 0) {
                            prevPrice = year === '2022' ? 1000 : navByYear[String(parseInt(year)-1)]?.[11]?.price;
                          } else {
                            prevPrice = yearData[i-1]?.price;
                          }
                          const change = prevPrice ? ((item.price - prevPrice) / prevPrice) * 100 : 0;

                          return (
                            <td key={i} className="text-right py-2 px-1">
                              <div className="text-white">€{item.price.toFixed(0)}</div>
                              <div className={`text-xs ${change >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                                {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                              </div>
                            </td>
                          );
                        })}
                        <td className={`text-right py-2 px-2 font-bold ${yearReturn >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                          {yearReturn >= 0 ? '+' : ''}{yearReturn.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-[#6b7585] text-xs mt-2">* Startprijs maart 2022: €1.000 | Januari 2026 is MTD (month-to-date)</p>
          </div>
        )}

        {/* Portfolio Holdings */}
        <div className="bg-[#161d26] p-4 rounded-xl border border-[#2a3441] shadow-sm mt-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-white">📊 Portfolio Holdings</h2>
            <span className="text-[#6b7585] text-xs">Laatst bijgewerkt: {PORTFOLIO_LAST_UPDATED}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {PORTFOLIO_HOLDINGS.map((asset) => (
              <div key={asset.symbol} className="bg-[#1e2731] p-3 rounded-lg border border-[#2a3441] text-center">
                <img 
                  src={asset.img} 
                  alt={asset.symbol} 
                  className="w-8 h-8 mx-auto mb-2 rounded-full"
                  onError={(e) => { e.currentTarget.src = 'https://images.octav.fi/tokens/small/NoImageAvailable_small.png'; }}
                />
                <p className="text-sm font-bold text-[#2098d1]">{asset.symbol}</p>
                <p className="text-lg font-bold text-white">{asset.pct}%</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[#6b7585] text-xs text-center mt-4 pb-4">
          Bron: historic_nav + adam-nav-api • CCI30: cci30.com • Portfolio: octav.fi
        </p>
      </div>
    </div>
  );
}
