import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useNetwork } from '@/lib/hooks/useNetwork'
import { BrainCircuit, Gamepad2, Zap, Globe, X, Sparkles, Trophy, CheckCircle2, ChevronRight, Target, Smile, Flame, Grid3X3, RefreshCcw, Atom } from 'lucide-react'

// --- FALLBACK CONTENT GENERATOR (If network fails) ---
function generateFallbackContent(title: string) {
  return {
    game: {
      title: 'Focus Challenge',
      questions: [
        { q: `Level 1: What is the first step to tackle "${title.substring(0,10)}"?`, opts: ['Procrastinate', 'Break it down', 'Panic', 'Skip it'], ans: 'Break it down', exp: 'Breaking tasks down reduces cognitive load.' },
        { q: 'Level 2: What is the Pomodoro technique?', opts: ['A tomato sauce recipe', '25 mins work / 5 mins break', 'Working 4 hours straight', 'Multitasking'], ans: '25 mins work / 5 mins break', exp: 'It maintains high focus while preventing burnout.' },
        { q: 'Boss Level: How do you beat task paralysis?', opts: ['Wait for motivation', 'Do the smallest possible action right now', 'Drink more coffee', 'Scroll social media'], ans: 'Do the smallest possible action right now', exp: 'Action creates momentum, which creates motivation.' }
      ]
    },
    summary: ['Open the relevant document/tool.', 'Set a timer for 5 minutes.', 'Commit to doing just the first tiny step.'],
    world: [
      { domain: 'Productivity', text: 'This exact strategy is used by top CEOs to manage massive cognitive loads.' },
      { domain: 'Neuroscience', text: 'Taking small actions releases dopamine, which rewires your brain to enjoy the task.' }
    ],
    eli5: `Imagine ${title} is like building a giant Lego spaceship. You can't build it all at once! You just need to find the very first piece and click it in. Let's find that first piece! ðŸš€ðŸ§¸`,
    hype: `Listen up, captain! ðŸ´â€â˜ ï¸ The procrastination monster is trying to steal your treasure! Grab your sword (or keyboard), take a deep breath, and let's crush this task right now! YARRR! âš”ï¸ðŸ”¥`
  }
}

export function InterventionButton({ taskTitle }: { taskTitle: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [view, setView] = useState<'menu' | 'game' | 'summary' | 'world' | 'eli5' | 'hype' | 'tictactoe' | 'chainreaction'>('menu')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  const [content, setContent] = useState<any>(null)
  
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [score, setScore] = useState(0)
  const [gameFinished, setGameFinished] = useState(false)
  const { isOnline, isLowResource } = useNetwork()

  // Tic-Tac-Toe State
  const [board, setBoard] = useState(Array(9).fill(null))
  const [isXNext, setIsXNext] = useState(true)
  const [winner, setWinner] = useState<string | null>(null)

  useEffect(() => { setMounted(true) }, [])

  const handleAction = async (action: 'game' | 'summary' | 'world' | 'eli5' | 'hype' | 'tictactoe' | 'chainreaction') => {
    if (action === 'tictactoe') {
      setView('tictactoe')
      setBoard(Array(9).fill(null))
      setIsXNext(true)
      setWinner(null)
      return
    }
    if (action === 'chainreaction') {
      setView('chainreaction')
      return
    }
    
    setLoading(true)
    
    try {
      const res = await fetch('/api/intervention', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskTitle })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        setContent(generateFallbackContent(taskTitle))
      } else {
        setContent(data)
      }
    } catch (err) {
      console.error(err)
      setContent(generateFallbackContent(taskTitle))
    }
    
    setLoading(false)
    setView(action)

    if (action === 'game') {
      setCurrentQuestionIdx(0)
      setSelectedOption(null)
      setShowExplanation(false)
      setScore(0)
      setGameFinished(false)
    }
  }

  const handleGuess = (option: string) => {
    if (showExplanation) return
    setSelectedOption(option)
    setShowExplanation(true)
    
    if (option === content.game.questions[currentQuestionIdx].ans) {
      setScore(prev => prev + 1)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIdx < content.game.questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1)
      setSelectedOption(null)
      setShowExplanation(false)
    } else {
      setGameFinished(true)
    }
  }

  const checkWinner = (squares: any[]) => {
    const lines = [[0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], [2,4,6]]
    for (let i = 0; i < lines.length; i++) {
      const [a,b,c] = lines[i]
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) return squares[a]
    }
    return null
  }

  const handleTicTacClick = (i: number) => {
    if (board[i] || winner || !isXNext) return;
    const newBoard = [...board];
    newBoard[i] = 'X';
    setBoard(newBoard);
    setIsXNext(false);
    
    const newWinner = checkWinner(newBoard);
    if (newWinner) { setWinner(newWinner); return; }
    if (!newBoard.includes(null)) { setWinner('Draw'); return; }

    // AI Move (Simple Random)
    setTimeout(() => {
      const empty = newBoard.map((v, idx) => v === null ? idx : null).filter(v => v !== null) as number[];
      if (empty.length > 0) {
        const aiMove = empty[Math.floor(Math.random() * empty.length)];
        const aiBoard = [...newBoard];
        aiBoard[aiMove] = 'O';
        setBoard(aiBoard);
        setIsXNext(true);
        const aiWinner = checkWinner(aiBoard);
        if (aiWinner) {
          setWinner(aiWinner);
        } else if (!aiBoard.includes(null)) {
          setWinner('Draw');
        }
      }
    }, 500);
  }

  return (
    <>
      <button 
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(true); }}
        className="transition-all duration-300 p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 shrink-0 border border-indigo-200 dark:border-indigo-500/30 flex items-center gap-2 shadow-sm mr-2 z-10 relative"
      >
        <BrainCircuit className="h-4 w-4" />
        <span className="text-[10px] font-bold uppercase tracking-wider inline-block">Fix Boredom</span>
      </button>

      {mounted && createPortal(
        <AnimatePresence>
          {isOpen && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" />
              
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col"
              >
                <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="flex items-center gap-2 px-2">
                    <Sparkles className="h-4 w-4 text-indigo-500" />
                    <span className="font-bold text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">Intervention Engine</span>
                  </div>
                  <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-6 min-h-[350px] flex flex-col justify-center">
                  {loading ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-4 text-indigo-500 py-16">
                      <BrainCircuit className="h-14 w-14 animate-pulse" />
                      <p className="font-bold text-sm animate-pulse tracking-wide uppercase">Generating personalized intervention...</p>
                    </div>
                  ) : view === 'menu' ? (
                    <div className="space-y-4">
                      <h3 className="text-xl font-black text-slate-800 dark:text-slate-200 mb-6 leading-snug">
                        Looks like you are disengaged.<br/>What sounds better right now?
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <ActionCard icon={Gamepad2} title="Play a Game" desc="3-Level Interactive Challenge" color="emerald" onClick={() => handleAction('game')} />
                        <ActionCard icon={Zap} title="5-Minute TL;DR" desc="Actionable Micro-steps" color="amber" onClick={() => handleAction('summary')} />
                        <ActionCard icon={Globe} title="Real World Use" desc="Practical Applications" color="blue" onClick={() => handleAction('world')} />
                        <ActionCard icon={Smile} title="ELI5" desc="Explain like I am 5" color="pink" onClick={() => handleAction('eli5')} />
                        <ActionCard icon={Flame} title="Roast Me" desc="Aggressive Motivation" color="rose" onClick={() => handleAction('hype')} />
                        <ActionCard icon={Grid3X3} title="Tic Tac Toe" desc="Quick Brain Break" color="emerald" onClick={() => handleAction('tictactoe')} />
                        <ActionCard icon={Atom} title="Chain Reaction" desc="Explosive Strategy Game" color="amber" onClick={() => handleAction('chainreaction')} />
                      </div>
                    </div>
                  ) : view === 'chainreaction' ? (
                    <div className="space-y-4 w-full flex flex-col items-center">
                      <div className="flex w-full justify-between items-center px-2">
                        <Badge color="amber">Chain Reaction</Badge>
                        <a href="https://playchainreaction.ai.studio/" target="_blank" rel="noreferrer" className="text-xs font-bold text-indigo-500 hover:text-indigo-600 underline">
                          Open in New Tab
                        </a>
                      </div>
                      {!isOnline || isLowResource ? <div className="w-full h-[400px] flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"><p className="text-slate-500 font-bold text-sm text-center px-6">🚀 High-bandwidth games are disabled in Low-Resource Mode to save data.</p></div> : <iframe 
                        src={!isOnline || isLowResource ? "" : "https://playchainreaction.ai.studio/"} 
                        className="w-full h-[400px] rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner bg-white"
                        title="Chain Reaction Game"
                      />}
                    </div>
                  ) : view === 'tictactoe' ? (
                    <div className="space-y-6 w-full flex flex-col items-center py-4">
                      <Badge color="emerald">Tic Tac Toe</Badge>
                      <div className="flex justify-between items-center w-full max-w-[240px] mb-2 px-2">
                        <span className="font-bold text-slate-700 dark:text-slate-300">You: X</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">AI: O</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {board.map((cell, idx) => (
                          <button 
                            key={idx} 
                            onClick={() => handleTicTacClick(idx)}
                            className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-4xl font-black text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 shadow-sm"
                          >
                            {cell}
                          </button>
                        ))}
                      </div>
                      
                      <div className="h-10 mt-2 flex items-center justify-center">
                        {winner && (
                          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-3">
                            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                              {winner === 'Draw' ? "It's a draw!" : `${winner} Wins!`}
                            </span>
                            <button onClick={() => { setBoard(Array(9).fill(null)); setWinner(null); setIsXNext(true); }} className="p-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-800 transition-colors">
                              <RefreshCcw className="w-4 h-4" />
                            </button>
                          </motion.div>
                        )}
                        {!winner && !isXNext && (
                          <span className="text-sm font-bold text-slate-500 animate-pulse">AI is thinking...</span>
                        )}
                      </div>
                    </div>
                  ) : view === 'game' && content ? (
                    <div className="space-y-6 w-full">
                      {!gameFinished ? (
                        <>
                          <div className="flex justify-between items-center">
                            <Badge color="emerald">{content.game.title}</Badge>
                            <span className="text-xs font-black text-slate-400 tracking-widest uppercase">Score: {score}/{content.game.questions.length}</span>
                          </div>
                          
                          <div className="space-y-2">
                            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200">{content.game.questions[currentQuestionIdx].q}</h4>
                          </div>

                          <div className="space-y-3">
                            {content.game.questions[currentQuestionIdx].opts.map((opt: string, i: number) => {
                              const isSelected = selectedOption === opt;
                              const isCorrect = opt === content.game.questions[currentQuestionIdx].ans;
                              
                              let btnClass = "border-slate-200 dark:border-slate-700 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20";
                              if (showExplanation) {
                                if (isCorrect) btnClass = "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300";
                                else if (isSelected && !isCorrect) btnClass = "border-rose-400 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 opacity-70";
                                else btnClass = "border-slate-200 dark:border-slate-700 opacity-50";
                              }

                              return (
                                <button
                                  key={i}
                                  disabled={showExplanation}
                                  onClick={() => handleGuess(opt)}
                                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all font-semibold ${btnClass}`}
                                >
                                  {opt}
                                </button>
                              )
                            })}
                          </div>

                          <AnimatePresence>
                            {showExplanation && (
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-2">
                                <div className={`p-4 rounded-2xl flex items-start gap-3 ${selectedOption === content.game.questions[currentQuestionIdx].ans ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300' : 'bg-rose-50 text-rose-800 dark:bg-rose-900/20 dark:text-rose-300'}`}>
                                  {selectedOption === content.game.questions[currentQuestionIdx].ans ? <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" /> : <X className="h-5 w-5 shrink-0 mt-0.5" />}
                                  <div>
                                    <p className="font-black text-sm uppercase tracking-wide mb-1">{selectedOption === content.game.questions[currentQuestionIdx].ans ? 'Correct!' : 'Not quite'}</p>
                                    <p className="text-sm font-medium opacity-90">{content.game.questions[currentQuestionIdx].exp}</p>
                                  </div>
                                </div>
                                
                                <button onClick={handleNextQuestion} className="mt-4 w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 text-white p-4 rounded-xl font-bold transition-colors">
                                  {currentQuestionIdx < content.game.questions.length - 1 ? 'Next Question' : 'Finish Challenge'}
                                  <ChevronRight className="h-4 w-4" />
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </>
                      ) : (
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-8">
                          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Trophy className="h-10 w-10 text-emerald-500" />
                          </div>
                          <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-2">Challenge Complete!</h3>
                          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 mt-6 border border-slate-100 dark:border-slate-700">
                            <p className="text-base font-bold text-emerald-600/80 dark:text-emerald-400/80 mt-2">
                              You scored {score} out of {content.game.questions.length}!
                            </p>
                            <p className="text-sm font-semibold text-emerald-600/60 dark:text-emerald-400/60 mt-1">Your brain is now primed and ready to focus.</p>
                          </div>
                          <button onClick={() => setIsOpen(false)} className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-xl font-black text-lg transition-all shadow-xl shadow-emerald-500/20">
                            Return to Task
                          </button>
                        </motion.div>
                      )}
                    </div>
                  ) : view === 'summary' && content ? (
                    <div className="space-y-6 w-full">
                       <Badge color="amber">Micro-Learning Action Plan</Badge>
                       <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">Break it down.</h3>
                       <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                         Feeling paralyzed? Follow these {content.summary.length} simple, low-effort steps to build momentum on "{taskTitle}":
                       </p>
                       
                       <div className="space-y-3 mt-4">
                         {content.summary.map((step: string, i: number) => (
                           <div key={i} className="group flex items-start gap-4 p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-700 transition-colors shadow-sm">
                              <div className="shrink-0 w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400 font-black text-sm">{i+1}</div>
                              <span className="text-[15px] leading-relaxed font-bold text-slate-700 dark:text-slate-200 pt-1">{step}</span>
                           </div>
                         ))}
                       </div>
                    </div>
                  ) : view === 'world' && content ? (
                    <div className="space-y-6 w-full">
                       <Badge color="blue">The Big Picture</Badge>
                       <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">Why does this actually matter?</h3>
                       <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                         Here is how concepts from "{taskTitle}" are used in the real world to build the future:
                       </p>
                       
                       <div className="grid gap-4 mt-4">
                         {content.world.map((item: any, i: number) => (
                           <div key={i} className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/50">
                             <div className="flex items-center gap-2 mb-2">
                               <Target className="w-5 h-5 text-blue-500" />
                               <span className="font-black text-blue-800 dark:text-blue-300 tracking-wide uppercase text-xs">{item.domain}</span>
                             </div>
                             <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
                               {item.text}
                             </p>
                           </div>
                         ))}
                       </div>
                    </div>
                  ) : view === 'eli5' && content ? (
                    <div className="space-y-6 w-full text-center py-6">
                      <Badge color="pink">Explain Like I am 5</Badge>
                      <div className="mx-auto w-24 h-24 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center mb-4">
                        <Smile className="h-12 w-12 text-pink-500" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 px-4 leading-relaxed">
                        {content.eli5}
                      </h3>
                    </div>
                  ) : view === 'hype' && content ? (
                    <div className="space-y-6 w-full text-center py-6">
                      <Badge color="rose">Roast and Hype Mode</Badge>
                      <div className="mx-auto w-24 h-24 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mb-4">
                        <Flame className="h-12 w-12 text-rose-500" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 px-4 leading-relaxed italic">
                        {content.hype}
                      </h3>
                    </div>
                  ) : null}
                </div>
                
                {/* Footer */}
                {view !== 'menu' && !loading && (
                  <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                    <button onClick={() => setView('menu')} className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 flex items-center gap-2 transition-colors">
                      <ChevronRight className="h-4 w-4 rotate-180" /> Back to options
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}

function ActionCard({ icon: Icon, title, desc, color, onClick }: any) {
  const colors: Record<string, string> = {
    emerald: 'hover:border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/50',
    amber: 'hover:border-amber-400 bg-amber-50/50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800/50',
    blue: 'hover:border-blue-400 bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800/50',
    pink: 'hover:border-pink-400 bg-pink-50/50 dark:bg-pink-900/10 border-pink-100 dark:border-pink-800/50',
    rose: 'hover:border-rose-400 bg-rose-50/50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-800/50',
  }
  const textColors: Record<string, string> = {
    emerald: 'text-emerald-600 dark:text-emerald-400',
    amber: 'text-amber-600 dark:text-amber-400',
    blue: 'text-blue-600 dark:text-blue-400',
    pink: 'text-pink-600 dark:text-pink-400',
    rose: 'text-rose-600 dark:text-rose-400',
  }

  return (
    <button onClick={onClick} className={`group p-6 rounded-3xl border-2 text-left transition-all hover:-translate-y-1 shadow-sm hover:shadow-md ${colors[color]}`}>
      <div className={`mb-4 ${textColors[color]}`}>
        <Icon className="h-10 w-10" />
      </div>
      <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-1">{title}</h3>
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{desc}</p>
    </button>
  )
}

function Badge({ children, color }: any) {
  const colors: Record<string, string> = {
    emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
    amber: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    pink: 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300',
    rose: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300',
  }
  return <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-2 ${colors[color]}`}>{children}</span>
}


