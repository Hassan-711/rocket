"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Radar, Zap, MessageSquare, Hand, Sparkles, CheckCircle2, Trophy, Mic, MicOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const SKILLS = ['React / Next.js', 'Calculus', 'Physics', 'UI/UX Design', 'Essay Writing'];

const LEADERBOARD = [
  { name: 'Alex M.', hours: 42, role: 'Developer' },
  { name: 'Sarah K.', hours: 38, role: 'Designer' },
  { name: 'David L.', hours: 31, role: 'Student' },
];

export default function CommunityPage() {
  const [matchState, setMatchState] = useState<'idle' | 'searching' | 'matched'>('idle');
  const [selectedSkill, setSelectedSkill] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isMuted, setIsMuted] = useState(false);
  const [feed, setFeed] = useState<{msg: string, time: string, type: 'status' | 'hype'}[]>([
    { msg: "Sarah joined the co-working room.", time: "Just now", type: "status" }
  ]);
  const [hypeSent, setHypeSent] = useState(false);

  useEffect(() => {
    let timer: any;
    if (matchState === 'searching') {
      timer = setTimeout(() => {
        setMatchState('matched');
      }, 3500);
    }
    return () => clearTimeout(timer);
  }, [matchState]);

  useEffect(() => {
    let interval: any;
    if (matchState === 'matched' && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [matchState, timeLeft]);

  useEffect(() => {
    if (matchState === 'matched') {
      const t1 = setTimeout(() => {
        setFeed(prev => [{ msg: `Sarah is also focusing on ${selectedSkill || 'Deep Work'}`, time: "Just now", type: 'status' }, ...prev]);
      }, 3000);
      
      const t2 = setTimeout(() => {
        setFeed(prev => [{ msg: "Sarah sent you some hype! 🙌", time: "Just now", type: 'hype' }, ...prev]);
      }, 12000);

      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [matchState, selectedSkill]);

  const handleSendHype = () => {
    setHypeSent(true);
    setFeed(prev => [{ msg: "You sent hype to Sarah! ⚡", time: "Just now", type: 'hype' }, ...prev]);
    setTimeout(() => setHypeSent(false), 2000);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 rounded-2xl">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Co-Working Circles</h1>
          <p className="text-sm font-semibold text-slate-500">Defeat social isolation. Sync up with builders worldwide.</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {matchState === 'idle' && (
          <motion.div key="idle" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
            
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
              <Radar className="w-16 h-16 text-indigo-500 mb-6" />
              <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-2">Find Your Focus Buddy</h2>
              <p className="text-slate-500 font-medium mb-8 max-w-md">Our AI pairs you with a peer studying the exact same topic.</p>
              
              <div className="w-full max-w-lg mb-8">
                <p className="text-sm font-bold text-slate-400 mb-3 text-left">SELECT YOUR FOCUS TOPIC:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {SKILLS.map(skill => (
                    <button 
                      key={skill}
                      onClick={() => setSelectedSkill(skill)}
                      className={`px-4 py-2 rounded-full text-sm font-bold transition-all border-2 ${selectedSkill === skill ? 'bg-indigo-100 border-indigo-500 text-indigo-700 dark:bg-indigo-900/50 dark:border-indigo-400 dark:text-indigo-300 shadow-sm' : 'bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400'}`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => setMatchState('searching')} 
                disabled={!selectedSkill}
                className={`px-8 py-4 rounded-full font-black tracking-wide text-lg transition-all flex items-center gap-2 ${selectedSkill ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/30 hover:-translate-y-1' : 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-800'}`}
              >
                <Sparkles className="w-5 h-5" /> Start Matchmaking
              </button>
            </div>

            {/* Leaderboard Section */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-slate-800 dark:text-slate-100">Weekly Top Focusers</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {LEADERBOARD.map((user, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 flex items-center justify-center font-black text-amber-900">
                      #{idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{user.name}</p>
                      <p className="text-xs font-semibold text-slate-500">{user.hours} hours logged</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        )}

        {matchState === 'searching' && (
          <motion.div key="search" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-32">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping" />
              <div className="bg-indigo-100 dark:bg-indigo-900/50 p-6 rounded-full relative">
                <Radar className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin" style={{ animationDuration: '3s' }} />
              </div>
            </div>
            <h3 className="mt-8 text-xl font-black text-slate-700 dark:text-slate-200 animate-pulse">Scanning global network...</h3>
            <p className="text-sm font-bold text-slate-500 mt-2">Finding a peer focusing on <span className="text-indigo-600 dark:text-indigo-400">"{selectedSkill}"</span></p>
          </motion.div>
        )}

        {matchState === 'matched' && (
          <motion.div key="matched" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Main Timer & Video Placeholder */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm text-center relative overflow-hidden">
                <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400 mb-6 hover:bg-rose-100">Live Session: {selectedSkill}</Badge>
                
                <div className="text-7xl md:text-9xl font-black text-slate-800 dark:text-slate-100 tracking-tighter tabular-nums mb-8">
                  {formatTime(timeLeft)}
                </div>
                
                <div className="flex items-center justify-center gap-8">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex flex-col items-center justify-center relative border-4 border-white dark:border-slate-900 shadow-md">
                      <span className="text-2xl font-black text-indigo-600">You</span>
                      <button onClick={() => setIsMuted(!isMuted)} className="absolute -bottom-2 -right-2 p-1.5 bg-slate-800 text-white rounded-full hover:bg-slate-700">
                        {isMuted ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                      </button>
                    </div>
                    {/* Audio Visualizer (You) */}
                    <div className="flex gap-1 h-3 items-end">
                      {!isMuted ? (
                        <>
                          <div className="w-1 bg-indigo-400 rounded-full animate-[bounce_1s_infinite] h-2"></div>
                          <div className="w-1 bg-indigo-400 rounded-full animate-[bounce_1.2s_infinite] h-3"></div>
                          <div className="w-1 bg-indigo-400 rounded-full animate-[bounce_0.8s_infinite] h-1"></div>
                        </>
                      ) : (
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Muted</div>
                      )}
                    </div>
                  </div>

                  <div className="w-20 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 animate-pulse w-full" />
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center relative border-4 border-white dark:border-slate-900 shadow-md">
                      <span className="text-2xl font-black text-amber-600">SK</span>
                    </div>
                    {/* Audio Visualizer (Sarah) */}
                    <div className="flex gap-1 h-3 items-end">
                      <div className="w-1 bg-amber-400 rounded-full animate-[bounce_0.9s_infinite] h-1"></div>
                      <div className="w-1 bg-amber-400 rounded-full animate-[bounce_1.1s_infinite] h-3"></div>
                      <div className="w-1 bg-amber-400 rounded-full animate-[bounce_1.3s_infinite] h-2"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button onClick={handleSendHype} disabled={hypeSent} className={`p-4 rounded-2xl font-black border-2 transition-all flex items-center justify-center gap-2 ${hypeSent ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-900/30 dark:border-emerald-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-slate-700 dark:text-slate-300'}`}>
                  {hypeSent ? <CheckCircle2 className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                  {hypeSent ? 'Hype Sent!' : 'Send Hype'}
                </button>
                <button onClick={() => { setMatchState('idle'); setSelectedSkill(''); }} className="p-4 rounded-2xl font-black border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all flex items-center justify-center gap-2">
                  <Hand className="w-5 h-5" /> Leave Session
                </button>
              </div>
            </div>

            {/* Side Feed */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col h-full max-h-[500px]">
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-6">
                <MessageSquare className="w-5 h-5" /> Async Check-ins
              </h3>
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                <AnimatePresence>
                  {feed.map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                      <p className={`text-sm font-bold ${item.type === 'hype' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        {item.msg}
                      </p>
                      <p className="text-xs font-semibold text-slate-400 mt-2">{item.time}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

