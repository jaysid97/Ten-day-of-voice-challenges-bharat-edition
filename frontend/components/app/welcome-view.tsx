'use client';

import { useState } from 'react';
import { HumanAITutor } from '@/components/app/human-ai-tutor';
import { Button } from '@/components/ui/button';

interface WelcomeViewProps {
  startButtonText: string;
  onStartCall: () => void;
  hasEndedCall?: boolean;
}

export const WelcomeView = ({
  startButtonText,
  onStartCall,
  hasEndedCall = false,
  ref,
}: React.ComponentProps<'div'> & WelcomeViewProps) => {
  const [activeTab, setActiveTab] = useState<'day7escalation' | 'day6outbound' | 'day5tools' | 'overview' | 'states' | 'guardrails'>('day7escalation');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [escalationRequests, setEscalationRequests] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isLoadingRequests, setIsLoadingRequests] = useState<boolean>(false);

  const fetchEscalationRequests = async (statusFilter = filterStatus) => {
    setIsLoadingRequests(true);
    try {
      const url = `/api/escalation?status=${statusFilter === 'ALL' ? '' : statusFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setEscalationRequests(data.requests || []);
      }
    } catch (e) {
      console.error('Failed to load escalation requests:', e);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const handleUpdateStatus = async (ref_id: string, new_status: string) => {
    try {
      const res = await fetch('/api/escalation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          ref_id,
          status: new_status,
          notes: `Updated to ${new_status} via Human Admin Dashboard`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchEscalationRequests();
      }
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  };

  const handleCreateDemoRequest = async (category: string, desc: string) => {
    try {
      const res = await fetch('/api/escalation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_request',
          caller_name: 'Ramesh',
          reason_category: category,
          issue_description: desc,
          agent_checked: 'AI Agent verified NCERT syllabus & asked for caller consent.',
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchEscalationRequests();
      }
    } catch (e) {
      console.error('Failed to create demo request:', e);
    }
  };

  const day7EscalationScenarios = [
    {
      scene: 'Scenario 1: Frustrated Learner / Teacher Help (Escalation Path)',
      title: 'Caller Upset & Stuck -> Explicit Consent -> Ref ID',
      prompt: '"I don\'t understand calculus at all, I\'m frustrated, call a human teacher!"',
      expectedOutcome: 'Agent identifies trigger, asks permission to share info with senior teacher. User consents. Agent calls create_escalation, saves ticket to DB, posts Discord Webhook, speaks Ref ID (REF-XXXXX), and gives 2-4 hr timeline.',
      userConsent: 'Explicit Consent Granted',
      type: 'Human Escalation',
      color: 'from-amber-500/20 to-rose-500/10 border-amber-500/40 text-amber-300',
    },
    {
      scene: 'Scenario 2: Exam / Certificate Dispute (Escalation Path)',
      title: 'Official Exam Error -> Explicit Consent -> Ref ID',
      prompt: '"My CBSE Hall Ticket photo is incorrect, connect me to human support!"',
      expectedOutcome: 'Agent asks explicit permission, creates administrative policy escalation ticket REF-XXXXX, and provides honest next steps.',
      userConsent: 'Explicit Consent Granted',
      type: 'Exam Dispute',
      color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/40 text-purple-300',
    },
    {
      scene: 'Scenario 3: Consent Denied by Caller (No Ticket Path)',
      title: 'Caller Refuses Permission -> Request Aborted',
      prompt: '"I am stuck on math, but NO, do NOT share my information or create a ticket."',
      expectedOutcome: 'Agent respects refusal, DOES NOT call create_escalation tool, and continues conversation politely.',
      userConsent: 'Consent Denied (Aborted)',
      type: 'Consent Refused',
      color: 'from-rose-500/20 to-red-500/10 border-rose-500/40 text-rose-300',
    },
    {
      scene: 'Scenario 4: Standard Educational Query (Normal Path)',
      title: 'Normal Question -> AI Answers -> No Ticket',
      prompt: '"What is photosynthesis in simple Hindi?"',
      expectedOutcome: 'Agent answers using educational tools normally. NO human escalation ticket created.',
      userConsent: 'Normal AI Conversation',
      type: 'Normal Path',
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/40 text-emerald-300',
    },
  ];

  const day6OutboundScenarios = [
    {
      scene: 'Scenario 1: Standard Outbound Call (ANSWERED)',
      title: 'Daily Practice Call with Mandated 2-Sentence Opening',
      prompt: 'Call Target: Ramesh (+91 98765 43210) | Topic: NCERT Class 10 Photosynthesis',
      expectedOutcome: 'Agent connects, delivers mandatory opening (Who, Why, Opt-out) in first 2 sentences, and conducts practice session.',
      userConsent: 'Mandated Opening Delivered',
      type: 'Outbound Answered',
      color: 'from-amber-500/20 to-emerald-500/10 border-amber-500/40 text-amber-300',
    },
    {
      scene: 'Scenario 2: Immediate Opt-Out Request',
      title: 'Caller says "Stop Calls" or "Opt Out"',
      prompt: '"शिक्षा AI, मेरी डेली कॉल्स बंद कर दो (Stop practice calls)"',
      expectedOutcome: 'Agent immediately calls opt_out_learner tool, confirms opt-out in DB, and ends session cleanly.',
      userConsent: 'Opt-Out Persisted to DB',
      type: 'Opt-Out Handled',
      color: 'from-rose-500/20 to-red-500/10 border-rose-500/40 text-rose-300',
    },
    {
      scene: 'Scenario 3: No Answer (30s Ring Timeout)',
      title: 'Call Unanswered -> 15m Retry Rule',
      prompt: 'Simulated Outcome: NO_ANSWER',
      expectedOutcome: 'System logs NO_ANSWER in SQLite database and schedules Retry 1 after 15 minutes (Max 3 retries).',
      userConsent: 'Retry Engine Active (15m)',
      type: 'Outcome Handling',
      color: 'from-sky-500/20 to-indigo-500/10 border-sky-500/40 text-sky-300',
    },
    {
      scene: 'Scenario 4: Phone Busy / Declined',
      title: 'Call Busy -> 5m Retry Rule',
      prompt: 'Simulated Outcome: BUSY',
      expectedOutcome: 'System logs BUSY outcome in SQLite database and schedules Retry 1 after 5 minutes (Max 3 retries).',
      userConsent: 'Retry Engine Active (5m)',
      type: 'Outcome Handling',
      color: 'from-yellow-500/20 to-amber-500/10 border-yellow-500/40 text-yellow-300',
    },
    {
      scene: 'Scenario 5: Voicemail Answering Machine',
      title: 'Voicemail Detected -> Spoken Message Drop',
      prompt: 'Simulated Outcome: VOICEMAIL',
      expectedOutcome: 'Agent drops concise spoken voicemail message ("This is Shiksha AI with your daily practice reminder..."), then hangs up.',
      userConsent: 'Voicemail Audio Drop',
      type: 'Message Drop',
      color: 'from-purple-500/20 to-pink-500/10 border-purple-500/40 text-purple-300',
    },
  ];

  const day5ToolsDemoScript = [
    {
      scene: 'Scenario 1: Live Tool Fetch & Exercise',
      title: 'Multi-Subject Educational Tool',
      prompt: 'मेरा नाम रमेश है, मुझे Class 8 Math Fractions का प्रश्न दो।',
      expectedOutcome: 'Agent calls fetch_ncert_exercise_and_syllabus tool, fetches live concept summary, and presents practice exercise aloud.',
      userConsent: 'Live Educational API Call',
      type: 'Live Tool Fetch',
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-300',
    },
    {
      scene: 'Scenario 2: Multi-Language Learning',
      title: 'Language Learning Tool (Sanskrit/French/Hindi)',
      prompt: 'Teach me basic greetings in Sanskrit and French.',
      expectedOutcome: 'Agent calls fetch_language_lesson_and_vocabulary tool and teaches greetings, grammar tips, and practice phrases.',
      userConsent: 'Multi-Language Engine',
      type: 'Language Tool',
      color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-300',
    },
  ];

  const agentStatesList = [
    {
      state: 'State 1: Ready',
      desc: 'Agent has not started yet; 1 clear start button',
      icon: '🟢',
      badge: 'READY (तैयार)',
      color: 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300',
    },
    {
      state: 'State 2: Connecting',
      desc: 'Agent is joining call; tells user to wait',
      icon: '🟡',
      badge: 'CONNECTING (जोड़ रहे हैं)',
      color: 'border-sky-500/40 bg-sky-950/30 text-sky-300',
    },
    {
      state: 'State 3: Listening',
      desc: 'Agent is listening to the user speak',
      icon: '🎤',
      badge: 'LISTENING (आपकी बात सुन रहे हैं)',
      color: 'border-emerald-400/50 bg-emerald-950/40 text-emerald-300',
    },
    {
      state: 'State 4: Speaking',
      desc: 'Agent is replying to user via Murf TTS',
      icon: '🔊',
      badge: 'SPEAKING (Shiksha AI बोल रही है)',
      color: 'border-amber-500/40 bg-amber-950/40 text-amber-300',
    },
    {
      state: 'State 5: Call ended',
      desc: 'Conversation is over; option to start again',
      icon: '🔴',
      badge: 'CALL ENDED (समाप्त)',
      color: 'border-rose-500/40 bg-rose-950/30 text-rose-300',
    },
  ];

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div
      ref={ref}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pt-20 pb-10 school-grid-bg"
    >
      {/* Top Tricolor Cyber Gradient Line */}
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#FF9933] via-white to-[#138808] opacity-90" />

      {/* Ambient Smart Classroom Window Lighting */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 size-[500px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-amber-500/15 via-sky-500/15 to-emerald-500/15 blur-[120px]" />

      <section className="relative z-10 flex max-w-3xl flex-col items-center text-center">
        {/* Language & Track Header Bar */}
        <div className="mb-2 flex items-center justify-between w-full max-w-xl px-2">
          <div className="inline-flex items-center space-x-2 rounded-full border border-rose-500/40 bg-slate-900/90 px-3 py-1 text-[11px] font-extrabold text-rose-300 shadow-lg backdrop-blur-xl">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500"></span>
            </span>
            <span>🚨 DAY 7 • KNOW WHEN TO ASK FOR HUMAN HELP &amp; ESCALATION</span>
          </div>

          <button
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            className="inline-flex items-center space-x-1 rounded-full border border-white/20 bg-slate-900/90 px-3 py-1 text-[11px] font-extrabold text-amber-300 shadow-md hover:bg-slate-800 transition-all active:scale-95"
          >
            <span>{lang === 'en' ? '🇮🇳 हिन्दी' : '🌐 English'}</span>
          </button>
        </div>

        {/* State 5 Banner if Call Ended */}
        {hasEndedCall && (
          <div className="mb-4 w-full animate-bounce rounded-xl border border-rose-500/40 bg-rose-950/70 p-3 text-rose-200 backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-center space-x-2 font-mono text-xs font-extrabold text-rose-300">
              <span className="size-2.5 rounded-full bg-rose-500 animate-ping" />
              <span>🔴 {lang === 'hi' ? 'कॉन्वर्सेशन समाप्त (Call Ended)' : 'Call Ended'}</span>
            </div>
            <p className="mt-0.5 text-[11px] text-slate-300">
              {lang === 'hi'
                ? 'आपका आउटबाउंड/इनबाउंड वॉइस सेशन समाप्त हो गया है। नया सेशन शुरू करने के लिए नीचे बटन दबाएं।'
                : 'Your voice session with Shiksha AI has concluded. Click below to start a new session.'}
            </p>
          </div>
        )}

        {/* Human AI Tutor Interactive Character Avatar */}
        <HumanAITutor state={hasEndedCall ? 'ended' : 'ready'} size="md" className="my-1" />

        {/* Hero Title */}
        <h1 className="mb-1 text-3xl font-black tracking-tight sm:text-5xl md:text-6xl">
          <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-sky-400 bg-clip-text text-transparent drop-shadow-sm">
            Shiksha AI
          </span>
          <span className="mt-0.5 inline-block ml-2 font-mono text-xl font-bold text-slate-300 sm:text-2xl">
            (शिक्षा AI)
          </span>
        </h1>

        {/* Day 7 Ready Badge */}
        <div className="mb-2 inline-flex items-center space-x-1.5 rounded-full border border-rose-500/40 bg-rose-950/70 px-3 py-0.5 text-[11px] font-extrabold text-rose-300 shadow-md">
          <span className="size-2 rounded-full bg-rose-400 animate-pulse" />
          <span>
            {lang === 'hi'
              ? '🚨 डे 7: ह्यूमन-इन-द-लूप एस्केलेशन, अनुमति सत्यापन एवं लाइव डैशबोर्ड सक्रिय'
              : '🚨 Day 7: Know When to Ask for Human Help, Explicit Consent & Live Escalation Desk'}
          </span>
        </div>

        <p className="mb-1.5 max-w-xl text-base font-medium leading-snug text-amber-200/90 sm:text-xl">
          {lang === 'hi'
            ? 'शिक्षा AI — मानव शिक्षक सहायता एवं एस्केलेशन केंद्र (Learning Track)'
            : 'Human Teacher Escalation & Human-in-the-Loop Support System'}
        </p>

        <p className="mb-4 max-w-lg text-xs font-normal leading-relaxed text-slate-300 sm:text-sm">
          {lang === 'hi'
            ? 'शिक्षा AI अब पहचानती है कि कब मानव शिक्षक की मदद चाहिए। अनुमति लेकर सपोर्ट टिकट बनाती है और लाइव डैशबोर्ड पर स्थिति प्रदर्शित करती है।'
            : 'Shiksha AI knows when to ask for human help. Asks explicit caller permission before sharing details, scrubs PII, and posts to DB & Discord Webhook with live status updates.'}
        </p>

        {/* Tab Navigation Controls */}
        <div className="mb-3 flex flex-wrap items-center justify-center gap-1 rounded-xl border border-white/10 bg-slate-900/80 p-1 text-xs font-semibold backdrop-blur-md">
          <button
            onClick={() => setActiveTab('day7escalation')}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              activeTab === 'day7escalation'
                ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-orange-500 font-bold text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🚨 Day 7 Human Escalations
          </button>
          <button
            onClick={() => setActiveTab('day6outbound')}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              activeTab === 'day6outbound'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 font-bold text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📞 Day 6 Outbound Calls
          </button>
          <button
            onClick={() => setActiveTab('day5tools')}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              activeTab === 'day5tools'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 font-bold text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🛠️ Day 5 Domain Tools
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-sky-500 to-blue-500 font-bold text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🌟 Overview
          </button>
        </div>

        {/* TAB: DAY 7 HUMAN ESCALATIONS */}
        {activeTab === 'day7escalation' && (
          <div className="mb-4 w-full space-y-3 text-left max-h-[320px] overflow-y-auto pr-1">
            {/* Scenarios Grid */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {day7EscalationScenarios.map((sc, i) => (
                <div
                  key={i}
                  className={`relative rounded-xl border bg-gradient-to-br ${sc.color} p-2.5 shadow-sm backdrop-blur-md transition-all hover:scale-[1.01]`}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-amber-200">{sc.scene}</span>
                    <span className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-[9px] font-bold text-slate-300">
                      {sc.type}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-100">{sc.title}</h4>
                  <p className="mt-1 font-mono text-[11px] italic text-slate-300">{sc.prompt}</p>
                  <p className="mt-1 text-[11px] leading-tight text-slate-300">{sc.expectedOutcome}</p>
                  <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-1.5 text-[10px]">
                    <span className="font-semibold text-amber-300">Consent Rule: {sc.userConsent}</span>
                    {sc.type !== 'Normal Path' && sc.type !== 'Consent Refused' && (
                      <button
                        onClick={() => handleCreateDemoRequest(sc.title, sc.prompt)}
                        className="rounded bg-amber-500/30 px-2 py-0.5 font-bold text-amber-200 hover:bg-amber-500/50"
                      >
                        + Create Demo Ticket
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Live Human Escalation Requests Dashboard */}
            <div className="rounded-xl border border-rose-500/40 bg-slate-950/80 p-3 backdrop-blur-md">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2 border-b border-rose-500/20 pb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-extrabold text-rose-300">
                    🚨 LIVE HUMAN HELP REQUESTS CENTER (SQLite DB)
                  </span>
                  <span className="rounded-full bg-rose-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-rose-300">
                    {escalationRequests.length} Requests
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-[10px]">
                  {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setFilterStatus(st)}
                      className={`rounded px-2 py-0.5 font-bold transition-all ${
                        filterStatus === st
                          ? 'bg-rose-500 text-slate-950 shadow-sm'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                  <button
                    onClick={() => fetchEscalationRequests()}
                    className="rounded bg-slate-800 px-2 py-0.5 font-bold text-amber-300 hover:bg-slate-700"
                  >
                    🔄 Refresh
                  </button>
                </div>
              </div>

              {isLoadingRequests ? (
                <div className="py-4 text-center font-mono text-xs text-slate-400">Loading requests...</div>
              ) : escalationRequests.length === 0 ? (
                <div className="py-4 text-center font-mono text-xs text-slate-400">
                  No human help requests found for filter [{filterStatus}]. Create a test request or speak to agent.
                </div>
              ) : (
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                  {escalationRequests.map((req) => (
                    <div
                      key={req.ref_id}
                      className="flex flex-col gap-1 rounded-lg border border-white/10 bg-slate-900/90 p-2 text-xs backdrop-blur-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-black text-amber-300">{req.ref_id}</span>
                          <span className="font-semibold text-slate-200">{req.caller_name} ({req.contact_info})</span>
                          <span
                            className={`rounded px-1.5 py-0.2 font-mono text-[9px] font-black uppercase ${
                              req.urgency === 'high' || req.urgency === 'emergency'
                                ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50'
                                : req.urgency === 'medium'
                                ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                                : 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                            }`}
                          >
                            {req.urgency}
                          </span>
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${
                            req.status === 'OPEN'
                              ? 'bg-rose-500/20 text-rose-300 animate-pulse'
                              : req.status === 'IN_PROGRESS'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300">
                        <span className="font-bold text-amber-200/90">Reason:</span> {req.reason_category}
                      </div>
                      <div className="text-[11px] text-slate-300">
                        <span className="font-bold text-amber-200/90">Issue (Sanitized):</span> {req.issue_description}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        <span className="font-semibold text-slate-300">Agent Checked:</span> {req.agent_checked}
                      </div>
                      <div className="mt-1 flex items-center justify-between border-t border-white/5 pt-1 text-[10px] text-slate-400">
                        <span>Follow-up: {req.preferred_contact_method} ({req.preferred_language})</span>
                        <div className="flex items-center space-x-1">
                          {req.status !== 'IN_PROGRESS' && req.status !== 'RESOLVED' && (
                            <button
                              onClick={() => handleUpdateStatus(req.ref_id, 'IN_PROGRESS')}
                              className="rounded bg-amber-500/20 px-2 py-0.5 font-bold text-amber-300 hover:bg-amber-500/40"
                            >
                              Assign Teacher
                            </button>
                          )}
                          {req.status !== 'RESOLVED' && (
                            <button
                              onClick={() => handleUpdateStatus(req.ref_id, 'RESOLVED')}
                              className="rounded bg-emerald-500/20 px-2 py-0.5 font-bold text-emerald-300 hover:bg-emerald-500/40"
                            >
                              ✓ Mark Resolved
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === 'day6outbound' && (
          <div className="mb-4 w-full space-y-2 text-left max-h-[240px] overflow-y-auto pr-1">
            {/* Opening Script Box */}
            <div className="rounded-xl border border-amber-500/40 bg-amber-950/40 p-3 backdrop-blur-md">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="font-mono text-xs font-extrabold text-amber-300">
                  🗣️ MANDATED 2-SENTENCE OUTBOUND OPENING SCRIPT (STEP 4)
                </span>
                <span className="rounded bg-amber-500/20 px-2 py-0.5 font-mono text-[10px] text-amber-200">
                  Step 4 Compliant
                </span>
              </div>
              <div className="space-y-1 font-mono text-[11px] leading-relaxed text-slate-200">
                <p>
                  <strong className="text-amber-300">1. Who &amp; Why:</strong> "नमस्ते Ramesh जी! मैं शिक्षा AI बोल रहा हूँ, आपकी डेली 5-मिनट NCERT साइंस प्रैक्टिस कॉल के लिए।"
                </p>
                <p>
                  <strong className="text-amber-300">2. How to Stop (Opt-Out):</strong> "अगर आप ये कॉल्स बंद करना चाहते हैं, तो बस 'स्टॉप' या 'कॉल्स बंद करो' बोल दें।"
                </p>
                <p>
                  <strong className="text-emerald-300">3. Value Delivery:</strong> "आज हम NCERT Class 10 Science Photosynthesis रिवाइज करेंगे। क्या आप शुरू करने के लिए तैयार हैं?"
                </p>
              </div>
            </div>

            <p className="mb-1 text-center font-mono text-[11px] text-amber-300">
              💡 Outbound Call Scenarios &amp; Outcome Handling Matrix:
            </p>
            {day6OutboundScenarios.map((item, idx) => (
              <div
                key={idx}
                className={`group relative rounded-xl border bg-gradient-to-r ${item.color} p-3 backdrop-blur-md transition-all`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="rounded-md border border-white/10 bg-slate-950/60 px-2 py-0.5 font-mono text-[10px] font-bold">
                    {item.scene}
                  </span>
                  <span className="text-[10px] font-mono font-medium text-amber-300">{item.type}</span>
                </div>
                <p className="text-xs font-medium leading-relaxed text-slate-100 font-mono mb-0.5">
                  "{item.prompt}"
                </p>
                <p className="text-[11px] text-slate-300 font-sans italic mb-1">
                  ✨ Expected: {item.expectedOutcome}
                </p>
              </div>
            ))}
          </div>
        )}


        {/* TAB 2: OVERVIEW GRID */}
        {activeTab === 'overview' && (
          <div className="mb-4 grid w-full grid-cols-1 gap-2 text-left sm:grid-cols-3">
            <div className="group rounded-xl border border-white/10 bg-slate-900/70 p-3 backdrop-blur-md transition-all hover:border-amber-500/50">
              <div className="mb-1 flex items-center space-x-1.5 text-xs font-bold text-amber-400">
                <span className="text-sm">🌐</span>
                <span>Real Domain Tools</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-300">
                Connects to live Educational REST APIs to fetch real concepts, exercises, and vocabulary across all subjects.
              </p>
            </div>

            <div className="group rounded-xl border border-white/10 bg-slate-900/70 p-3 backdrop-blur-md transition-all hover:border-sky-400/50">
              <div className="mb-1 flex items-center space-x-1.5 text-xs font-bold text-sky-400">
                <span className="text-sm">🔗</span>
                <span>Day 4 Memory Chaining</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-300">
                Auto-chains learner grade and language level saved in SQLite memory directly into today's tool lookup without re-asking.
              </p>
            </div>

            <div className="group rounded-xl border border-white/10 bg-slate-900/70 p-3 backdrop-blur-md transition-all hover:border-emerald-400/50">
              <div className="mb-1 flex items-center space-x-1.5 text-xs font-bold text-emerald-400">
                <span className="text-sm">🗣️</span>
                <span>Graceful Out-Loud Fallback</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-300">
                Explicitly speaks network failure states aloud when APIs time out, seamlessly falling back to cached NCERT curriculum data.
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: FIVE AGENT STATES */}
        {activeTab === 'states' && (
          <div className="mb-4 grid w-full grid-cols-1 gap-2 text-left sm:grid-cols-2">
            {agentStatesList.map((item, idx) => (
              <div
                key={idx}
                className={`rounded-xl border ${item.color} p-2.5 backdrop-blur-md transition-all`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-mono text-[11px] font-extrabold">{item.state}</span>
                  <span className="text-[10px] font-bold">{item.badge}</span>
                </div>
                <p className="text-[11px] leading-snug text-slate-200">{item.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: GUARDRAILS & CONSENT */}
        {activeTab === 'guardrails' && (
          <div className="mb-4 w-full space-y-2 text-left text-xs">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 backdrop-blur-md">
              <div className="mb-0.5 flex items-center space-x-2 font-bold text-emerald-300">
                <span>🔐 Explicit Caller Consent (Hard Rule)</span>
                <span className="ml-auto rounded-full border border-emerald-500/40 bg-emerald-500/20 px-2 py-0.5 font-mono text-[9px] text-emerald-300">
                  HARD RULE
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Agent MUST ask: "क्या मैं आपका लर्निंग डेटा सेव कर लूँ?" before calling save_caller_facts. Drops data if caller says no.
              </p>
            </div>

            <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 backdrop-blur-md">
              <div className="mb-0.5 flex items-center space-x-2 font-bold text-amber-300">
                <span>🔤 Native Devanagari Hindi Script</span>
                <span className="ml-auto rounded-full border border-amber-500/40 bg-amber-500/20 px-2 py-0.5 font-mono text-[9px] text-amber-300">
                  MULTILOCALE
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Enforces native Devanagari script (नमस्ते) for clean Murf Falcon Indian accent voice synthesis.
              </p>
            </div>

            <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-3 backdrop-blur-md">
              <div className="mb-0.5 flex items-center space-x-2 font-bold text-rose-300">
                <span>🚫 Medical / Disability Refusal</span>
                <span className="ml-auto rounded-full border border-rose-500/40 bg-rose-500/20 px-2 py-0.5 font-mono text-[9px] text-rose-300">
                  GUARDRAIL
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Refuses ADHD, Dyslexia or medical assessments with escalation script to certified experts.
              </p>
            </div>
          </div>
        )}

        {/* Start Button (State 1 & State 5 restart) */}
        <div className="group relative mt-1">
          <div className="absolute -inset-1 animate-pulse rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-sky-400 opacity-75 blur-lg transition duration-500 group-hover:opacity-100 group-hover:duration-200" />

          <Button
            size="lg"
            onClick={onStartCall}
            className="relative h-14 w-72 border border-white/30 bg-gradient-to-r from-amber-500 via-orange-500 to-sky-500 font-mono text-sm sm:text-base font-black uppercase tracking-wider text-slate-950 shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 sm:w-88"
          >
            <span className="relative z-10 flex items-center justify-center space-x-2.5">
              <span className="size-2.5 animate-ping rounded-full bg-slate-950" />
              <span>{hasEndedCall ? (lang === 'hi' ? 'फिर से शुरू करें (Start Session)' : 'Start Voice Session (Test Day 7 Human Escalations)') : (lang === 'hi' ? 'कॉल शुरू करें (Start Call)' : startButtonText)}</span>
              <svg
                className="size-5 transition-transform duration-300 group-hover:translate-x-1.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </span>
          </Button>
        </div>
      </section>

      {/* Footer Branding */}
      <div className="z-10 mt-6 text-center font-mono text-[11px] text-slate-400 space-y-0.5">
        <p className="font-semibold text-slate-300">
          #VoiceForBharat • 10 Days of Voice Challenge (Day 5: Real Domain Tools, Multi-Subject &amp; Language Learning)
        </p>
        <p>
          Built with{' '}
          <a
            target="_blank"
            rel="noreferrer"
            href="https://murf.ai"
            className="font-bold text-amber-300 underline underline-offset-2 hover:text-amber-200"
          >
            Murf Falcon TTS
          </a>
          , LiveKit Agents &amp; Gemini
        </p>
      </div>
    </div>
  );
};
