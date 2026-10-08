import { NextResponse } from 'next/server'

// Hackathon Secret: Silent Heuristic Fallback
function generateDynamicFallback(taskTitle: string) {
  const t = taskTitle.toLowerCase()
  let titleStr = taskTitle.length > 20 ? taskTitle.substring(0,20) + "..." : taskTitle;

  if (t.includes('code') || t.includes('react') || t.includes('dev') || t.includes('app') || t.includes('program')) {
    return {
      game: {
        title: 'Bug Hunter Pro',
        questions: [
          { q: 'Level 1: What is the very first step in writing software?', opts: ['Read the docs', 'Start typing blindly', 'Panic', 'Copy-paste'], ans: 'Read the docs', exp: 'Good developers plan and read before typing.' },
          { q: 'Level 2: What is the best way to debug an issue?', opts: ['Delete everything', 'Console.log / Debugger', 'Guessing', 'Ignoring it'], ans: 'Console.log / Debugger', exp: 'Tracking variable states is key.' },
          { q: 'Boss Level: Why do we break code into smaller components?', opts: ['To make it look longer', 'Reusability and readability', 'To confuse others', 'No reason'], ans: 'Reusability and readability', exp: 'Modularity makes large systems maintainable.' }
        ]
      },
      summary: ['Open the documentation.', 'Find one simple code snippet.', 'Run it and break it intentionally.'],
      world: [
        { domain: 'Tech Industry', text: 'Software engineers use these exact problem-solving steps to build global platforms.' },
        { domain: 'Cybersecurity', text: 'Breaking down code logically is how hackers find vulnerabilities.' }
      ],
      eli5: `Imagine coding ${titleStr} is like playing with magical Lego blocks. You type special words, and the computer builds whatever you tell it to! Let's snap the first block into place. 🧱✨`,
      hype: `Wake up, hacker! 🕶️ The matrix isn't going to code itself. Stop staring at the blank screen, hit the keyboard, and let's build something epic! 💻🔥`
    }
  } 
  
  if (t.includes('math') || t.includes('calc') || t.includes('algebra') || t.includes('equation')) {
    return {
      game: {
        title: 'The Enigma Code',
        questions: [
          { q: 'Level 1: What is the most important part of solving a math problem?', opts: ['Using a calculator', 'Understanding the core formula', 'Guessing', 'Skipping steps'], ans: 'Understanding the core formula', exp: 'Formulas are the building blocks of math.' },
          { q: 'Level 2: If a train travels 60 mph for 1.5 hours, how far does it go?', opts: ['75 miles', '80 miles', '90 miles', '100 miles'], ans: '90 miles', exp: 'Distance = Speed * Time (60 * 1.5 = 90).' },
          { q: 'Boss Level: Why is algebra useful in real life?', opts: ['It is not', 'Finding unknown values in logic/finance', 'Just for exams', 'To count apples'], ans: 'Finding unknown values in logic/finance', exp: 'Algebra is the foundation of algorithms and finance.' }
        ]
      },
      summary: ['Write down the ONE core formula needed.', 'Solve just the easiest practice problem.', 'Watch a 3-minute video on the hardest step.'],
      world: [
        { domain: 'Space Exploration', text: 'NASA relies on complex calculus to map satellite trajectories.' },
        { domain: 'Finance', text: 'Algorithmic trading uses advanced math models to predict stock market shifts.' }
      ],
      eli5: `Math is just like solving a fun puzzle! ${titleStr} is like finding a secret hidden number using special clues. Let's be detectives and find the clue! 🔍🧩`,
      hype: `Listen up, Einstein! 🧠 Numbers don't lie, but your excuses do. Grab your pencil, write down the formula, and let's crush this equation right now! ✍️⚡`
    }
  }

  if (t.includes('science') || t.includes('physic') || t.includes('chem') || t.includes('thermo') || t.includes('bio')) {
    return {
      game: {
        title: 'Quantum Quiz',
        questions: [
          { q: 'Level 1: What is the foundation of all scientific discovery?', opts: ['Guessing', 'The Scientific Method', 'Reading textbooks', 'Sleeping'], ans: 'The Scientific Method', exp: 'Observation, Hypothesis, Experiment, Conclusion.' },
          { q: 'Level 2: What does Thermodynamics study?', opts: ['How cold ice is', 'Energy, heat, and work', 'Just engines', 'How fast cars go'], ans: 'Energy, heat, and work', exp: 'It is the study of energy transfer.' },
          { q: 'Boss Level: Why does entropy (chaos) always increase?', opts: ['Because of magic', '2nd Law of Thermodynamics', 'Because humans are messy', 'It doesn\'t'], ans: '2nd Law of Thermodynamics', exp: 'The universe naturally moves towards disorder.' }
        ]
      },
      summary: ['Review the main glossary terms.', 'Look at the diagrams (ignore text for now).', 'Explain the concept out loud in plain English.'],
      world: [
        { domain: 'Healthcare', text: 'Biological breakthroughs lead directly to life-saving treatments.' },
        { domain: 'Engineering', text: 'Physics and thermodynamics dictate how airplanes and engines work.' }
      ],
      eli5: `Science is like learning the secret rules of the universe! ${titleStr} is just explaining how energy and magic invisible forces make things move and change! 🌌🔬`,
      hype: `Put your lab coat on, scientist! 🥼 The universe is waiting to be understood. Stop procrastinating and let's figure out how this reality actually works! 🚀🔥`
    }
  }

  return {
    game: {
      title: 'Focus Challenge',
      questions: [
        { q: `Level 1: What is the first step to tackle "${titleStr}"?`, opts: ['Procrastinate', 'Break it down', 'Panic', 'Skip it'], ans: 'Break it down', exp: 'Breaking tasks down reduces cognitive load.' },
        { q: 'Level 2: What is the Pomodoro technique?', opts: ['A tomato sauce recipe', '25 mins work / 5 mins break', 'Working 4 hours straight', 'Multitasking'], ans: '25 mins work / 5 mins break', exp: 'It maintains high focus while preventing burnout.' },
        { q: 'Boss Level: How do you beat task paralysis?', opts: ['Wait for motivation', 'Do the smallest possible action right now', 'Drink more coffee', 'Scroll social media'], ans: 'Do the smallest possible action right now', exp: 'Action creates momentum, which creates motivation.' }
      ]
    },
    summary: ['Open the relevant document/tool.', 'Set a timer for 5 minutes.', 'Commit to doing just the first tiny step.'],
    world: [
      { domain: 'Productivity', text: 'This exact strategy is used by top CEOs to manage massive cognitive loads.' },
      { domain: 'Psychology', text: 'Taking small actions releases dopamine, which rewires your brain.' }
    ],
    eli5: `Imagine ${titleStr} is like building a giant Lego spaceship. You can't build it all at once! You just need to find the very first piece and click it in. Let's find that piece! 🚀🧸`,
    hype: `Listen up, captain! 🏴‍☠️ The procrastination monster is stealing your time! Take a deep breath, and let's crush this task right now! YARRR! ⚔️🔥`
  }
}

export async function POST(request: Request) {
  try {
    const { taskTitle } = await request.json()
    const apiKey = process.env.GEMINI_API_KEY
    const fallbackJSON = generateDynamicFallback(taskTitle)

    if (!apiKey) {
      return NextResponse.json(fallbackJSON)
    }

    const prompt = `You are an adaptive AI engagement engine for a student productivity app. 
    The student is bored or overwhelmed by: "${taskTitle}".
    Generate an engaging intervention for them.
    
    Reply ONLY with valid JSON strictly matching this exact structure (no markdown):
    {
      "game": {
        "title": "A gamified title for a 3-question challenge related to the topic",
        "questions": [
          {
            "q": "Level 1 Question (Easy)",
            "opts": ["A", "B", "C", "D"],
            "ans": "Correct option",
            "exp": "Explanation"
          },
          {
            "q": "Level 2 Question (Medium)",
            "opts": ["A", "B", "C", "D"],
            "ans": "Correct option",
            "exp": "Explanation"
          },
          {
            "q": "Boss Level Question (Hard)",
            "opts": ["A", "B", "C", "D"],
            "ans": "Correct option",
            "exp": "Explanation"
          }
        ]
      },
      "summary": ["Step 1", "Step 2", "Step 3"],
      "world": [
        { "domain": "Domain 1", "text": "Real world app 1" },
        { "domain": "Domain 2", "text": "Real world app 2" }
      ],
      "eli5": "Explain the core concept of the task as if speaking to a 5-year-old child. Use cute analogies.",
      "hype": "A funny, highly energetic motivational message to hype them up."
    }`

    const modelsToTry = ['gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-3.8-flash']
    
    for (const model of modelsToTry) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json", temperature: 0.7 }
          })
        })
        
        if (response.ok) {
          const data = await response.json()
          const rawText = data.candidates[0].content.parts[0].text
          const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim()
          return NextResponse.json(JSON.parse(cleanedText))
        }
      } catch (err) {
        console.warn(`Model ${model} failed. Trying next...`)
      }
    }

    // If all models fail (503s), return the smart dynamic fallback!
    return NextResponse.json(fallbackJSON)

  } catch (error: any) {
    console.error('Intervention API Error:', error)
    return NextResponse.json({
      game: { title: "Error", questions: [{ q: "Fix bug", opts: ["Yes"], ans: "Yes", exp: "Yes" }] },
      summary: ["Try again later"],
      world: [{ domain: "Tech", text: "APIs go down." }],
      eli5: "The robots are sleeping.",
      hype: "Wake up the robots!"
    })
  }
}
