/* ============================================================
   dr5hn OS — ask.js
   A tiny scripted assistant. No backend, no keys — a curated
   knowledge base + lightweight fuzzy matching. Fitting, since
   Darshan builds AI agents for a living.

   window.ASK.match(query) -> { answer, score, id } | fallback
   ============================================================ */
(function () {
  "use strict";

  var entries = [
    {
      id: "greeting",
      kw: ["hi", "hello", "hey", "yo", "sup", "hiya", "howdy"],
      a: "Hey — I'm dr5hn-ai, a little assistant Darshan scripted. Ask me about his AI experience, the Country-State-City project, his skills, or whether he's open to work.",
    },
    {
      id: "who-ai",
      kw: ["who are you", "what are you", "are you real", "are you ai", "are you a bot", "chatgpt", "llm"],
      a: "I'm a tiny scripted agent Darshan built into this site — no live model behind me, just a curated knowledge base. On-brand though: he builds real AI agents (RAG, MCP, multi-agent orchestration) for a living.",
    },
    {
      id: "open-to-work",
      kw: ["open to work", "hiring", "hire", "available", "availability", "job", "opportunity", "opportunities", "looking for", "role", "work with", "engagement"],
      a: "Yes — Darshan is open to interesting AI + product work, both full-time and (especially) fractional: Fractional AI/Engineering Lead, Fractional Architect, Fractional Code Reviewer, and AI adoption & advisory. Best way to start a conversation: run `contact` (GitHub / LinkedIn / Twitter).",
    },
    {
      id: "fractional",
      kw: ["fractional", "part time", "part-time", "advisory", "advisor", "consult", "consulting", "consultant", "retainer", "freelance", "contract", "interim", "moonlight", "few hours", "day a week"],
      a: "Fractional engagements are a great fit. Darshan takes on: Fractional AI/Engineering Lead, Fractional Architect, Fractional Code Reviewer, and AI adoption & advisory — bringing senior, ships-in-production experience without a full-time hire. Run `contact` and let's scope it.",
    },
    {
      id: "ai-exp",
      kw: ["ai experience", "ai work", "artificial intelligence", "agents", "agent", "rag", "machine learning", "ml", "genai", "gen ai", "mcp", "vector", "embeddings", "prompt"],
      a: "He's Head of AI & Innovations at SOZO Design. Recent work: an internal AI briefing agent (OpenAI Assistants, Tavily, SSE streaming), a RAG chatbot with an n8n → Supabase vector pipeline, Figma-MCP → Claude Code design-to-code automation, and an AI-tool standardisation framework. Measured 15–40% faster dev and 60–80% faster docs from AI adoption. Run `skills` for the full AI stack.",
    },
    {
      id: "ai-tools",
      kw: ["ai tools", "claude", "cursor", "copilot", "gpt", "openai", "gemini", "what tools", "n8n", "tooling"],
      a: "Daily drivers: Claude Code, Cursor, OpenAI Assistants API, n8n for workflow automation, Supabase (pgvector) and Pinecone for vectors, Tavily for research, plus GPT / Claude / Gemini / Copilot across tasks. He even built `ccm` — a Claude Code manager.",
    },
    {
      id: "csc",
      kw: ["csc", "country state city", "countrystatecity", "geo", "geographic", "database", "dataset", "countries", "cities", "open data", "geodata"],
      a: "Country-State-City is the open geo-data platform he maintains: 250 countries, 5,299 states, 153,768 cities in 11+ formats, billions of API requests served, 40k+ developers. There's a whole ecosystem — DB, API, manager, CLI, export tool, encyclopedia, npm + Python packages. Run `csc` for the live dashboard.",
    },
    {
      id: "skills",
      kw: ["skills", "strongest", "best at", "good at", "expertise", "strength", "specialty", "specialise", "specialize", "core"],
      a: "Strongest in: AI engineering (agents, RAG, MCP), full-stack (PHP/Laravel, Node, React/Next.js, TypeScript), and DevOps/automation (GitHub Actions, Docker). 10+ years shipping production apps and leading teams. Run `skills` for the full toolbox.",
    },
    {
      id: "stack",
      kw: ["stack", "technologies", "tech stack", "languages", "frameworks", "what do you use", "backend", "frontend"],
      a: "Backend: PHP 8 / Laravel, Node.js, Python, Express. Frontend: TypeScript, React, Next.js, Tailwind. Data: MySQL, MongoDB, Redis, Postgres, Neo4j, pgvector. DevOps: GitHub Actions, Docker, AWS, Vercel. Run `skills` for the categorised list.",
    },
    {
      id: "leadership",
      kw: ["leadership", "lead", "team", "manage", "manager", "mentor", "mentoring", "people"],
      a: "He's led teams of 4–5 across backend, frontend and mobile — owning architecture, code reviews and deployments, and mentoring on Claude Code, Figma MCP and debugging. He was promoted into Head of AI & Innovations and nominated for Employee of the Year.",
    },
    {
      id: "why-hire",
      kw: ["why hire", "why you", "what makes you", "pitch", "sell yourself", "why should"],
      a: "Rare combination: a senior full-stack engineer who actually ships AI in production, plus open-source credibility (a platform 40k+ devs depend on), plus the leadership to roll AI adoption across a team with measured results. He turns emerging AI into practical tools that make teams faster.",
    },
    {
      id: "experience",
      kw: ["experience", "years", "how long", "background", "career", "history", "senior"],
      a: "10+ years. Freelance (2015) → agency dev → Senior Engineer & Technical Lead at Vistaar → Senior Full-Stack → Head of AI & Innovations at SOZO Design. Run `work` for the full timeline.",
    },
    {
      id: "location",
      kw: ["location", "where", "based", "remote", "relocate", "relocation", "timezone", "country", "city", "live"],
      a: "Based in Mumbai, India 🇮🇳 — he already works day-to-day with teams across the UK and US, so remote / distributed is home turf.",
    },
    {
      id: "open-source",
      kw: ["open source", "oss", "github", "contribute", "contributor", "maintainer"],
      a: "His flagship is the Country-State-City database — 9k+ stars, 127+ contributors, 40k+ developers, billions of API requests. He also ships dev tools (ccm, Teamwork CLI), GitHub Actions, and npm/PyPI packages. Run `projects` or `contact` for links.",
    },
    {
      id: "projects",
      kw: ["projects", "portfolio", "built", "what have you built", "show me", "products", "ilovejson"],
      a: "Highlights: the Country-State-City ecosystem, iLoveJSON (28+ JSON tools), an AI briefing agent, and dev tools like ccm. Run `projects` to browse them, or `open <name>` for detail.",
    },
    {
      id: "education",
      kw: ["education", "degree", "study", "studied", "college", "university", "qualification"],
      a: "Master of Computer Application (IGNOU, Delhi) and a B.Sc. in Information Technology (Mumbai University). Run `education` for dates.",
    },
    {
      id: "salary",
      kw: ["salary", "rate", "cost", "pay", "compensation", "budget", "price", "charge", "day rate"],
      a: "That's best discussed directly — it depends on scope and engagement type. Run `contact` and let's talk specifics.",
    },
    {
      id: "game",
      kw: ["game", "snake", "play", "fun", "easter egg"],
      a: "Yep — run `play snake` for a round of Snake where you collect cities from the CSC database. Darshan's shipped games before too (Phaser, Firebase). You're literally inside one of his builds right now.",
    },
    {
      id: "contact",
      kw: ["contact", "reach", "get in touch", "connect", "message", "talk", "email", "linkedin", "twitter"],
      a: "Run `contact` for the links — GitHub, LinkedIn and Twitter (@dr5hn). That's the fastest way to reach him.",
    },
  ];

  var suggestions = [
    "are you open to work?",
    "do you do fractional roles?",
    "what's your AI experience?",
    "tell me about CSC",
    "why should we hire you?",
  ];

  var fallback =
    "I don't have a scripted answer for that one yet. Try asking about his AI experience, the CSC project, his skills, or whether he's open to work — or run `help` to explore the rest.";

  function norm(s) { return (" " + String(s).toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ") + " "); }

  window.ASK = {
    suggestions: suggestions,
    fallback: fallback,
    match: function (query) {
      var q = norm(query);
      var best = null, bestScore = 0;
      entries.forEach(function (e) {
        var score = 0;
        e.kw.forEach(function (k) {
          var nk = " " + k.toLowerCase() + " ";
          if (q.indexOf(nk) !== -1) score += (k.indexOf(" ") !== -1 ? 3 : 2); // phrases weigh more
          else if (k.indexOf(" ") === -1 && q.indexOf(" " + k) !== -1) score += 1; // prefix-ish
        });
        if (score > bestScore) { bestScore = score; best = e; }
      });
      if (best && bestScore > 0) return { answer: best.a, id: best.id, score: bestScore };
      return { answer: fallback, id: "fallback", score: 0 };
    },
  };
})();
