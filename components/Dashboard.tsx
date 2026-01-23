'use client';

import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';

interface DashboardProps {
  navData: Record<string, number>;
  cci30Data: Record<string, number>;
  lastUpdated: string;
}

const PRESETS: Record<string, { label: string; days?: number; year?: number }> = {
  'all': { label: 'Alles' },
  'ytd': { label: 'YTD' },
  '2025': { label: '2025', year: 2025 },
  '2024': { label: '2024', year: 2024 },
  '2023': { label: '2023', year: 2023 },
  '6m': { label: '6M', days: 180 },
  '3m': { label: '3M', days: 90 },
  '1m': { label: '1M', days: 30 },
};

export default function Dashboard({ navData, cci30Data, lastUpdated }: DashboardProps) {
  const allDates = useMemo(() => Object.keys(navData).sort(), [navData]);
  
  const [dateRange, setDateRange] = useState<[number, number]>([0, allDates.length - 1]);
  const [activePreset, setActivePreset] = useState<string>('all');
  const [view, setView] = useState<'normalized' | 'spread'>('normalized');

  const applyPreset = (key: string) => {
    const preset = PRESETS[key];
    if (!preset) return;

    let start = 0;
    let end = allDates.length - 1;

    if (preset.days) {
      start = Math.max(0, allDates.length - preset.days);
    } else if (preset.year) {
      const yearStr = String(preset.year);
      start = allDates.findIndex(d => d.startsWith(yearStr));
      end = allDates.findIndex(d => d.startsWith(String(preset.year + 1))) - 1;
      if (start < 0) start = 0;
      if (end < 0) end = allDates.length - 1;
    } else if (key === 'ytd') {
      const currentYear = new Date().getFullYear();
      start = allDates.findIndex(d => d.startsWith(String(currentYear)));
      if (start < 0) start = 0;
    }

    setDateRange([start, end]);
    setActivePreset(key);
  };

  const { chartData, navReturn, cci30Return, alpha, correlation, beta, startDate, endDate } = useMemo(() => {
    const dates = allDates.slice(dateRange[0], dateRange[1] + 1);
    if (dates.length === 0) return { chartData: [], navReturn: 0, cci30Return: 0, alpha: 0, correlation: 0, beta: 1, startDate: '', endDate: '' };

    const baseNav = navData[dates[0]];
    const baseCCI30 = cci30Data[dates[0]];

    const data = dates.map(date => ({
      date,
      nav: navData[date],
      cci30: cci30Data[date] || 0,
      nav_norm: (navData[date] / baseNav) * 100,
      cci30_norm: cci30Data[date] ? (cci30Data[date] / baseCCI30) * 100 : 100
    }));

    const lastDate = dates[dates.length - 1];
    const navRet = ((navData[lastDate] - baseNav) / baseNav * 100);
    const cci30Ret = cci30Data[lastDate] ? ((cci30Data[lastDate] - baseCCI30) / baseCCI30 * 100) : 0;

    const navReturns = data.slice(1).map((d, i) => (d.nav - data[i].nav) / data[i].nav);
    const cci30Returns = data.slice(1).map((d, i) => d.cci30 && data[i].cci30 ? (d.cci30 - data[i].cci30) / data[i].cci30 : 0);
    const n = navReturns.length;
    
    let corr = 0, b = 1;
    if (n > 1) {
      const meanNav = navReturns.reduce((a, b) => a + b, 0) / n;
      const meanCCI = cci30Returns.reduce((a, b) => a + b, 0) / n;
      const covariance = navReturns.reduce((sum, nav, i) => sum + (nav - meanNav) * (cci30Returns[i] - meanCCI), 0) / n;
      const stdNav = Math.sqrt(navReturns.reduce((sum, nav) => sum + Math.pow(nav - meanNav, 2), 0) / n);
      const stdCCI = Math.sqrt(cci30Returns.reduce((sum, c) => sum + Math.pow(c - meanCCI, 2), 0) / n);
      corr = stdNav && stdCCI ? covariance / (stdNav * stdCCI) : 0;
      b = stdCCI ? covariance / (stdCCI * stdCCI) : 1;
    }

    return { chartData: data, navReturn: navRet, cci30Return: cci30Ret, alpha: navRet - cci30Ret, correlation: corr, beta: b, startDate: dates[0], endDate: lastDate };
  }, [dateRange, allDates, navData, cci30Data]);

  const formatDate = (d: string) => new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
  const formatFullDate = (d: string) => new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-white">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-1">NAV vs CCI30 Index</h1>
        <p className="text-slate-400 mb-6">
          {formatFullDate(startDate)} - {formatFullDate(endDate)} • 
          <span className="text-slate-500 text-sm ml-2">Update: {new Date(lastUpdated).toLocaleString('nl-NL')}</span>
        </p>

        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 mb-6">
          <h3 className="text-sm text-slate-400 mb-3">📅 Selecteer periode</h3>
          <div className="flex gap-2 flex-wrap mb-4">
            {Object.entries(PRESETS).map(([key, preset]) => (
              <button key={key} onClick={() => applyPreset(key)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${activePreset === key ? 'bg-blue-600 font-semibold' : 'bg-slate-700 hover:bg-slate-600'}`}>
                {preset.label}
              </button>
            ))}
          </div>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs text-slate-500 block mb-1">Startdatum</label>
              <input type="range" min={0} max={allDates.length - 2} value={dateRange[0]}
                onChange={(e) => { const v = parseInt(e.target.value); if (v < dateRange[1]) { setDateRange([v, dateRange[1]]); setActivePreset(''); }}}
                className="w-full accent-blue-500" />
              <p className="text-sm text-slate-300 mt-1">{formatFullDate(allDates[dateRange[0]])}</p>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs text-slate-500 block mb-1">Einddatum</label>
              <input type="range" min={1} max={allDates.length - 1} value={dateRange[1]}
                onChange={(e) => { const v = parseInt(e.target.value); if (v > dateRange[0]) { setDateRange([dateRange[0], v]); setActivePreset(''); }}}
                className="w-full accent-blue-500" />
              <p className="text-sm text-slate-300 mt-1">{formatFullDate(allDates[dateRange[1]])}</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">{chartData.length} dagen geselecteerd</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { label: 'NAV Return', value: navReturn, color: navReturn >= 0 ? 'text-green-400' : 'text-red-400', format: (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(2)}%` },
            { label: 'CCI30 Return', value: cci30Return, color: cci30Return >= 0 ? 'text-green-400' : 'text-red-400', format: (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(2)}%` },
            { label: 'Alpha', value: alpha, color: alpha >= 0 ? 'text-green-400' : 'text-red-400', format: (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(2)}%` },
            { label: 'Correlatie', value: correlation, color: 'text-purple-400', format: (v: number) => v.toFixed(2) },
            { label: 'Beta', value: beta, color: 'text-sky-400', format: (v: number) => v.toFixed(2) },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.format(stat.value)}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-4">
          <button onClick={() => setView('normalized')} className={`px-4 py-2 rounded-lg font-medium ${view === 'normalized' ? 'bg-blue-600' : 'bg-slate-700'}`}>
            Genormaliseerd (100 = start)
          </button>
          <button onClick={() => setView('spread')} className={`px-4 py-2 rounded-lg font-medium ${view === 'spread' ? 'bg-blue-600' : 'bg-slate-700'}`}>
            Spread (NAV - CCI30)
          </button>
        </div>

        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 mb-6">
          <h2 className="text-lg mb-4">{view === 'normalized' ? 'Performance Vergelijking' : 'Outperformance vs CCI30'}</h2>
          <ResponsiveContainer width="100%" height={400}>
            {view === 'normalized' ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={formatDate} />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} domain={['auto', 'auto']} tickFormatter={v => `${v.toFixed(0)}%`} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                  labelFormatter={d => formatFullDate(d as string)} formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]} />
                <Legend />
                <ReferenceLine y={100} stroke="#475569" strokeDasharray="5 5" />
                <Line type="monotone" dataKey="nav_norm" name="NAV" stroke="#4ade80" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="cci30_norm" name="CCI30" stroke="#f97316" strokeWidth={2} dot={false} />
              </LineChart>
            ) : (
              <LineChart data={chartData.map(d => ({ ...d, spread: d.nav_norm - d.cci30_norm }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={formatDate} />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} domain={['auto', 'auto']} tickFormatter={v => `${v > 0 ? '+' : ''}${v.toFixed(0)}%`} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                  labelFormatter={d => formatFullDate(d as string)} formatter={(value: number) => [`${value > 0 ? '+' : ''}${value.toFixed(2)}%`, 'NAV vs CCI30']} />
                <ReferenceLine y={0} stroke="#475569" strokeWidth={1} />
                <Line type="monotone" dataKey="spread" name="Spread" stroke="#a78bfa" strokeWidth={2} dot={false} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 rounded-xl border border-slate-700">
          <h2 className="text-lg mb-3">📊 Analyse</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-slate-200">
                <span className={alpha >= 0 ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'}>
                  NAV {alpha >= 0 ? 'outperformt' : 'underperformt'}
                </span> de CCI30 met <strong>{Math.abs(alpha).toFixed(2)}%</strong> over deze periode.
              </p>
              <p className="text-slate-400 text-sm mt-2">
                Correlatie van {correlation.toFixed(2)} = portfolio beweegt {correlation > 0.8 ? 'zeer sterk' : correlation > 0.5 ? 'sterk' : 'matig'} mee met de markt.
              </p>
            </div>
            <div>
              <p className="text-slate-200">
                <span className="text-sky-400 font-semibold">Beta van {beta.toFixed(2)}</span> = portfolio is {beta > 1.1 ? 'agressiever' : beta < 0.9 ? 'defensiever' : 'vergelijkbaar'} dan de markt.
              </p>
              <p className="text-slate-400 text-sm mt-2">Data: {allDates.length} dagen vanaf maart 2022</p>
            </div>
          </div>
        </div>
        <p className="text-slate-500 text-xs text-center mt-6">NAV: adam-nav-api.vercel.app • CCI30: cci30.com</p>
      </div>
    </div>
  );
}
