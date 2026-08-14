'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface AnalyticsSummary {
  total_calls: number;
  successful_calls: number;
  failed_calls: number;
  success_rate_percent: number;
  failure_categories: Record<string, number>;
}

interface CallRecord {
  call_id: string;
  caller_name: string;
  channel: string;
  status: 'SUCCESS' | 'FAILED';
  failure_category: string;
  tools_used: string[];
  duration_seconds: number;
  timestamp: string;
  notes: string;
}

export default function AnalyticsDashboardPage() {
  const [summary, setSummary] = useState<AnalyticsSummary>({
    total_calls: 0,
    successful_calls: 0,
    failed_calls: 0,
    success_rate_percent: 0.0,
    failure_categories: {},
  });
  const [history, setHistory] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [simulating, setSimulating] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics');
      const data = await res.json();
      if (data.success) {
        setSummary(data.summary);
        setHistory(data.history);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error('Failed to fetch call analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    if (!autoRefresh) return;
    const interval = setInterval(fetchAnalytics, 3000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleSimulateCall = async (status: 'SUCCESS' | 'FAILED') => {
    setSimulating(true);
    try {
      const body = {
        action: 'simulate_call',
        status,
        caller_name: status === 'SUCCESS' ? 'Ramesh Kumar (Learner)' : 'Anita Verma (Learner)',
        channel: Math.random() > 0.5 ? 'BROWSER' : 'SIP',
        failure_category: status === 'FAILED' ? 'INCOMPLETE_TASK' : 'NONE',
        tools_used: status === 'SUCCESS' ? ['fetch_ncert_exercise_and_syllabus', 'fetch_subject_quiz_and_solution'] : [],
        notes: status === 'SUCCESS' ? 'Learner completed NCERT science quiz successfully' : 'Learner disconnected before practice started',
      };
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      await fetchAnalytics();
    } catch (err) {
      console.error('Failed to simulate call:', err);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Ambient Cyber Saffron Background */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <div className="absolute top-0 left-1/4 size-96 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="absolute bottom-10 right-1/4 size-96 rounded-full bg-sky-500/20 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* Navigation Bar & Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition-all"
              >
                ← Return to Voice Tutor
              </Link>
              <span className="rounded-md border border-rose-500/40 bg-rose-950/60 px-2 py-0.5 font-mono text-xs font-extrabold text-rose-300">
                DAY 9 • CALL ANALYTICS DASHBOARD
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-2 flex items-center gap-3">
              <span>Shiksha AI Call Analytics</span>
              <span className="text-xs font-normal text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full">
                Track: Learning &amp; Literacy
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Real-time performance metrics for Browser &amp; SIP voice calls powered by Murf Falcon TTS
            </p>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-2 ${
                autoRefresh
                  ? 'border-emerald-500/40 bg-emerald-950/60 text-emerald-300'
                  : 'border-slate-700 bg-slate-900 text-slate-400'
              }`}
            >
              <span className={`size-2 rounded-full ${autoRefresh ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
              {autoRefresh ? 'Live Updates (3s)' : 'Auto-Refresh Paused'}
            </button>

            <button
              onClick={fetchAnalytics}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-all"
            >
              {loading ? 'Refreshing...' : '↻ Refresh Now'}
            </button>
          </div>
        </header>

        {/* Step 1 Definition & Privacy Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 rounded-2xl border border-amber-500/20 bg-slate-900/60 p-4 backdrop-blur-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <span>🎯 Definition of Success (Step 1)</span>
            </h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              A call is marked <strong className="text-emerald-400">SUCCESSFUL</strong> when the learner completes an educational exercise, NCERT practice quiz, language lesson, or consents to human-teacher escalation. A call is marked <strong className="text-rose-400">FAILED</strong> if the learner disconnects prematurely without attempting any learning activity.
            </p>
          </div>

          <div className="rounded-2xl border border-sky-500/20 bg-slate-900/60 p-4 backdrop-blur-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2">
              <span>🔒 Privacy Protection (Step 6)</span>
            </h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              PII redaction active: All passwords, OTPs, PINs, and full private transcripts are automatically scrubbed prior to display.
            </p>
          </div>
        </div>

        {/* Step 3: Required 3 Numbers Dashboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total Calls */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-950 p-5 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Calls</span>
              <span className="text-xl">📞</span>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-white mt-3 font-mono tracking-tight">
              {summary.total_calls}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Combined Browser &amp; SIP Calls</p>
          </div>

          {/* Card 2: Successful Calls */}
          <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-slate-950 p-5 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Successful Calls</span>
              <span className="text-xl">✅</span>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-emerald-300 mt-3 font-mono tracking-tight">
              {summary.successful_calls}
            </div>
            <p className="text-[11px] text-emerald-400/80 mt-2">Learner completed exercise / escalation</p>
          </div>

          {/* Card 3: Failed Calls */}
          <div className="relative overflow-hidden rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-950/40 via-slate-900/90 to-slate-950 p-5 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Failed Calls</span>
              <span className="text-xl">⚠️</span>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-rose-300 mt-3 font-mono tracking-tight">
              {summary.failed_calls}
            </div>
            <p className="text-[11px] text-rose-400/80 mt-2">Incomplete task / premature hangup</p>
          </div>

          {/* Card 4: Success Rate Percentage */}
          <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/40 via-slate-900/90 to-slate-950 p-5 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Success Rate</span>
              <span className="text-xl">📈</span>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-amber-300 mt-3 font-mono tracking-tight">
              {summary.success_rate_percent}%
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-500"
                style={{ width: `${Math.min(100, summary.success_rate_percent)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Step 5 Interactive Call Simulator & Failure Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Call Simulation Panel */}
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-slate-900/80 p-5 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400">
                  🧪 Test Call Simulator (Step 5 Verification)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Simulate calls to verify real-time total &amp; successful counters increasing live on dashboard
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500">Last updated: {lastUpdated || 'Just now'}</span>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => handleSimulateCall('SUCCESS')}
                disabled={simulating}
                className="flex-1 min-w-[200px] px-4 py-3 rounded-xl border border-emerald-500/50 bg-emerald-950/70 hover:bg-emerald-900 text-emerald-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all hover:scale-[1.02]"
              >
                <span>➕ Simulate Successful Call</span>
              </button>

              <button
                onClick={() => handleSimulateCall('FAILED')}
                disabled={simulating}
                className="flex-1 min-w-[200px] px-4 py-3 rounded-xl border border-rose-500/50 bg-rose-950/70 hover:bg-rose-900 text-rose-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-950/50 transition-all hover:scale-[1.02]"
              >
                <span>❌ Simulate Failed Call</span>
              </button>
            </div>
          </div>

          {/* Failure Category Breakdown */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 backdrop-blur-xl">
            <h2 className="text-sm font-bold uppercase tracking-wider text-rose-400">
              📊 Failure Categories (Advanced)
            </h2>
            <div className="mt-3 space-y-2.5">
              {Object.keys(summary.failure_categories).length === 0 ? (
                <p className="text-xs text-slate-400 italic">No failed calls recorded yet.</p>
              ) : (
                Object.entries(summary.failure_categories).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between text-xs bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                    <span className="font-mono text-slate-300">{category}</span>
                    <span className="font-bold text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/30">
                      {count} call{count > 1 ? 's' : ''}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Step 4 & Advanced: Call History Table */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-sky-400">
              📋 Real Call History ({history.length})
            </h2>
            <span className="text-xs text-slate-400">Piped directly from SQLite database</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] font-bold bg-slate-950/80">
                  <th className="p-3">Call ID</th>
                  <th className="p-3">Caller Name</th>
                  <th className="p-3">Channel</th>
                  <th className="p-3">Outcome</th>
                  <th className="p-3">Tools Executed</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-slate-500 italic">
                      No call records logged yet. Make a call or simulate a test call above!
                    </td>
                  </tr>
                ) : (
                  history.map((record) => (
                    <tr key={record.call_id} className="hover:bg-slate-800/40 transition-colors font-mono">
                      <td className="p-3 text-slate-300 font-bold">{record.call_id}</td>
                      <td className="p-3 font-sans text-slate-200">{record.caller_name}</td>
                      <td className="p-3">
                        <span className="inline-block rounded px-2 py-0.5 text-[10px] font-bold border border-sky-500/30 bg-sky-950/60 text-sky-300">
                          {record.channel}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold border ${
                            record.status === 'SUCCESS'
                              ? 'border-emerald-500/40 bg-emerald-950/60 text-emerald-300'
                              : 'border-rose-500/40 bg-rose-950/60 text-rose-300'
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                      <td className="p-3 font-sans text-[11px]">
                        {record.tools_used.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {record.tools_used.map((tool, idx) => (
                              <span key={idx} className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[10px]">
                                {tool}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">None</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-400">{record.duration_seconds}s</td>
                      <td className="p-3 text-slate-400 text-[11px]">
                        {new Date(record.timestamp).toLocaleString()}
                      </td>
                      <td className="p-3 font-sans text-slate-400 text-[11px] max-w-xs truncate">
                        {record.notes || 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
