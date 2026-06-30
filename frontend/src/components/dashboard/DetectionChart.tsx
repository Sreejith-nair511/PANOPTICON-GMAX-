'use client';

import React from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, Activity } from 'lucide-react';

const detectionData = [
  { time: '08:00', persons: 12, objects: 34, events: 3 },
  { time: '09:00', persons: 19, objects: 41, events: 5 },
  { time: '10:00', persons: 8,  objects: 28, events: 2 },
  { time: '11:00', persons: 24, objects: 67, events: 8 },
  { time: '12:00', persons: 31, objects: 89, events: 11 },
  { time: '13:00', persons: 44, objects: 102, events: 14 },
  { time: '14:00', persons: 67, objects: 134, events: 22 },
  { time: '15:00', persons: 29, objects: 78, events: 9 },
  { time: '16:00', persons: 18, objects: 55, events: 6 },
  { time: '17:00', persons: 22, objects: 61, events: 7 },
];

const caseActivityData = [
  { case: '0047', evidence: 14, suspects: 2, confidence: 87 },
  { case: '0043', evidence: 28, suspects: 1, confidence: 72 },
  { case: '0039', evidence: 42, suspects: 6, confidence: 91 },
  { case: '0052', evidence: 5,  suspects: 3, confidence: 0  },
  { case: '0031', evidence: 87, suspects: 11, confidence: 83 },
];

const TOOLTIP_STYLE = {
  background: '#0D1526',
  border: '1px solid #1E2840',
  borderRadius: '8px',
  fontSize: '11px',
  color: '#94a3b8',
};

export function DetectionChart() {
  return (
    <div className="card-panel rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 p-4 border-b border-border">
        <TrendingUp className="w-4 h-4 text-accent" />
        <h2 className="text-sm font-semibold">Detection Activity</h2>
        <span className="text-2xs text-muted-foreground ml-2">Last 10 hours</span>
      </div>
      <div className="p-4">
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={detectionData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="personGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00B4D8" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00B4D8" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="eventGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2840" />
            <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Area type="monotone" dataKey="persons" stroke="#00B4D8" strokeWidth={2} fill="url(#personGrad)" name="Persons" />
            <Area type="monotone" dataKey="events" stroke="#EF4444" strokeWidth={2} fill="url(#eventGrad)" name="Events" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function CaseActivityChart() {
  return (
    <div className="card-panel rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 p-4 border-b border-border">
        <Activity className="w-4 h-4 text-accent" />
        <h2 className="text-sm font-semibold">Case Breakdown</h2>
      </div>
      <div className="p-4">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={caseActivityData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2840" />
            <XAxis dataKey="case" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false}
              tickFormatter={(v) => `#${v}`} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="evidence" fill="#1565C0" radius={[3,3,0,0]} name="Evidence" />
            <Bar dataKey="suspects" fill="#F59E0B" radius={[3,3,0,0]} name="Suspects" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
