/* ============================================================
   dr5hn OS — content layer
   All of Darshan's resume, structured as explorable game data.

   SINGLE SOURCE OF TRUTH for numbers = the `M` constant below.
   Edit a value once here and it updates everywhere it's shown.
   (The `csc` stat grid also pulls live numbers from the CSC API
    + GitHub API at runtime, so it never needs manual updates.)
   ============================================================ */
(function () {
  // ---- the only place to ever touch a metric -----------------
  var M = {
    years: "10+ years",
    requests: "5B+",         // API requests served (live-overridden in the csc grid)
    developers: "50k+",      // developers using CSC
    stars: "9k+",            // GitHub stars (live-overridden)
    forks: "3k+",            // GitHub forks (live-overridden)
    contributors: "127+",    // GitHub contributors (live-overridden)
    cities: "153,768",       // (live-overridden)
    projects: "50+",         // shipped projects
  };
  // compact one-liner reused in a couple of places
  M.ossLine = M.stars + " ★ · " + M.contributors + " contributors · " + M.developers + " devs";

  window.DATA = {
    metrics: M,

    identity: {
      name: "Darshan Gada",
      handle: "dr5hn",
      title: "AI Engineer · Technical Innovation Leader · Open Source Contributor",
      location: "Mumbai, India",
      years: M.years,
      tagline:
        "Full-stack engineer turned AI builder. I ship AI agents, design system architecture, " +
        "and developer tooling — and I maintain open-source geo-data that " + M.developers +
        " developers run in production.",
    },

    // Core sections that count toward the discovery meter
    coreCommands: ["whoami", "work", "projects", "csc", "skills", "contact"],

    links: {
      github: "https://github.com/dr5hn/",
      linkedin: "https://www.linkedin.com/in/dr5hn/",
      twitter: "https://twitter.com/dr5hn/",
    },

    // What kind of engagements Darshan is open to — surfaced in `contact`,
    // the `ask` agent, and the finale. Edit here once; it shows everywhere.
    availability: {
      blurb: "Open to interesting AI + product work — full-time, and especially fractional engagements.",
      fractional: [
        "Fractional AI / Engineering Lead",
        "Fractional Architect",
        "Fractional Code Reviewer",
        "AI adoption & advisory",
      ],
    },

    about: [
      "Hi — I'm Darshan (you'll see me as dr5hn most places).",
      "I've spent " + M.years + " as a full-stack engineer, and these days I specialise in",
      "AI-powered product development, technical leadership, and developer tooling.",
      "",
      "I build AI agents, architect design systems, and lead teams that ship",
      "production-grade web apps. I also maintain the Country-State-City database —",
      "an open geo-data platform that's served billions of API requests.",
      "",
      "I like turning emerging AI capability into practical tools that make teams faster.",
    ],

    // neofetch-style "system specs" — the person as a machine
    neofetch: {
      os: "Mumbai, India",
      host: "SOZO Design (Cheltenham · London)",
      kernel: "AI Engineer",
      uptime: M.years + " in production",
      shell: "Head of AI & Innovations · Technical Innovation Leader",
      packages: M.projects + " shipped projects",
      cpu: "Full-stack · AI · DevOps",
      memory: "countries-states-cities-database",
      open_source: M.ossLine,
    },

    work: [
      {
        role: "Head of AI & Innovations",
        company: "SOZO Design",
        url: "https://sozodesign.co.uk/",
        period: "2025 — Present",
        note: "Promoted from Senior Full Stack Developer. Award-winning UK digital agency.",
        bullets: [
          "Built an internal AI briefing agent — PDF analysis, web research (Tavily), SSE streaming, multi-format export. Next.js 16, React 19, OpenAI Assistants API, Supabase.",
          "Built a RAG-based AI chatbot WordPress plugin with an n8n ingestion pipeline (Google Drive sync → PDF extraction → embeddings → Supabase vector storage).",
          "Designed an AI tool standardisation framework: approval process, privacy guidelines, evaluation periods, team adoption.",
          "Measured productivity gains: 15–40% on block dev, 60–80% on documentation through AI adoption.",
          "Integrated Figma MCP with Claude Code for automated design-to-code workflows.",
          "Nominated for Employee of the Year.",
        ],
      },
      {
        role: "Senior Full Stack Developer",
        company: "SOZO Design",
        url: "https://sozodesign.co.uk/",
        period: "2021 — 2024",
        note: "Led technical architecture across 10+ client projects.",
        bullets: [
          "Architected WoodScanner v2: a white-label marketplace with dynamic styling (CSS variables + ACF + shell scripts).",
          "Adopted the Radicle WordPress framework across the team; standardised on Tailwind CSS.",
          "Led migration from Bitbucket to GitHub; established GitHub Actions across 50+ plugins.",
          "Built Teamwork CLI — an npm package replacing scattered scripts for project & desk management.",
        ],
      },
      {
        role: "Technical Lead",
        company: "Vistaar Digital Communications",
        url: "https://vistaardigital.com/",
        period: "2020 — 2021",
        note: "Led a team of 5 (backend, frontend, mobile).",
        bullets: [
          "Full ownership of architecture, code reviews, and deployments.",
          "Saved 15% of team effort through GitHub Actions automation.",
          "Cut debugging time by 50% via structured training.",
        ],
      },
      {
        role: "Senior Software Engineer",
        company: "Vistaar Digital Communications",
        url: "https://vistaardigital.com/",
        period: "2018 — 2020",
        note: "Built products across many stacks for US clients & Indian pharma.",
        bullets: [
          "Laravel, Node.js, React, Angular, Flutter, Django.",
          "Key builds: WeOne (Neo4j graph earnings algorithm), Slingshot (test-prep PWA), Enablr (pharma eDetailing).",
          "DevOps on Linode & AWS; Dockerised dev environments.",
        ],
      },
      {
        role: "Web Developer",
        company: "Adevole",
        url: "",
        period: "2017 — 2018",
        note: "Digital agency serving entrepreneurs.",
        bullets: [
          "PHP, Laravel, WordPress, CodeIgniter builds.",
          "API integrations: Google Adwords/Adsense, Leadsquared, Moodle, Cashfree, Facebook, IATA.",
        ],
      },
      {
        role: "Freelance Web Developer",
        company: "Self-employed",
        url: "",
        period: "2015 — 2017",
        note: "Where it started.",
        bullets: ["Static and WordPress sites for clients across India."],
      },
    ],

    // The crown jewel — live numbers fetched at runtime, evergreen fallbacks here
    csc: {
      name: "Country · State · City",
      url: "https://countrystatecity.in",
      statsApi: "https://api.countrystatecity.in/stats",
      ghRepo: "dr5hn/countries-states-cities-database",
      blurb:
        "An open-source geo-data ecosystem I maintain. The core dataset, a freemium API, " +
        "an export tool, an encyclopedia, npm + Python packages, and automated changelogs.",
      stats: [
        { label: "Cities", value: 153768, suffix: "", key: "cities" },
        { label: "States", value: 5308, suffix: "", key: "states" },
        { label: "Countries", value: 250, suffix: "", key: "countries" },
        { label: "API requests served", value: 5.1, suffix: "B+", key: "totalRequests" },
        { label: "Developers served", value: 50, suffix: "K+" },
        { label: "GitHub stars", value: 9300, suffix: "+", gh: "stars" },
        { label: "Forks", value: 3000, suffix: "+", gh: "forks" },
        { label: "Contributors", value: 127, suffix: "+", gh: "contributors" },
      ],
      formats: ["JSON", "CSV", "XML", "YAML", "SQL", "PostgreSQL", "SQLite", "SQL Server", "MongoDB", "DuckDB", "GeoJSON"],
      pieces: [
        "Core dataset in 11 formats — PHP, Python, MySQL, GitHub Actions",
        "Freemium API — Express, Prisma, Redis, Bull queues, GitHub OAuth",
        "Export tool — field-level selection, credit pricing, ZIP downloads",
        "Encyclopedia — Next.js 16, React 19",
        "Changelog — automated tracking of 157k+ changes",
        "npm + Python packages — TypeScript, Pydantic",
      ],
    },

    // Flagship-first: the CSC ecosystem, then products, then tools.
    projects: [
      {
        id: "csc-db",
        name: "CSC Database",
        tag: "CSC Ecosystem · flagship",
        url: "https://github.com/dr5hn/countries-states-cities-database",
        desc: "The open dataset behind everything — 250 countries, 5,299 states, 153,768 cities in 11+ formats. A PR auto-generates every export via GitHub Actions. (Run `csc` for the live dashboard.)",
        tech: ["PHP", "Python", "MySQL", "GitHub Actions"],
      },
      {
        id: "csc-api",
        name: "CSC API",
        tag: "CSC Ecosystem",
        url: "https://countrystatecity.in",
        desc: "Freemium REST API with a dashboard, API keys, and usage management. Free tier for prototyping, paid tiers for production.",
        tech: ["Express", "Prisma", "Redis", "Bull", "GitHub OAuth", "Zod"],
      },
      {
        id: "csc-export",
        name: "CSC Export Tool",
        tag: "CSC Ecosystem",
        url: "https://export.countrystatecity.in",
        desc: "Build tailored datasets in your browser — pick country, region, format, and fields, then download. 8 output formats, credit-based pricing.",
        tech: ["React 19", "Express", "MongoDB", "Redis", "JSZip"],
      },
      {
        id: "csc-manager",
        name: "CSC Manager",
        tag: "CSC Ecosystem",
        url: "https://manager.countrystatecity.in",
        desc: "Community Manager — a web UI to browse the data and submit corrections through a streamlined review process.",
        tech: ["React", "Node.js", "Review workflow"],
      },
      {
        id: "csc-cli",
        name: "CSC CLI",
        tag: "CSC Ecosystem",
        url: "https://cli.countrystatecity.in",
        desc: "Search, explore, and generate code from geographic data — right in your terminal. `csc search \"tokyo\"`, `csc explore`.",
        tech: ["TypeScript", "Node.js", "CLI"],
      },
      {
        id: "csc-encyclopedia",
        name: "CSC Encyclopedia",
        tag: "CSC Ecosystem",
        url: "https://countrystatecity.org",
        desc: "A geographic encyclopedia — country profiles and insights built on the CSC dataset.",
        tech: ["Next.js 16", "React 19", "Tailwind", "Lucide"],
      },
      {
        id: "csc-docs",
        name: "CSC Docs",
        tag: "CSC Ecosystem",
        url: "https://docs.countrystatecity.in",
        desc: "Complete API documentation and integration guides for the whole ecosystem.",
        tech: ["Mintlify", "MDX"],
      },
      {
        id: "csc-npm",
        name: "CSC npm packages",
        tag: "CSC Ecosystem · packages",
        url: "https://www.npmjs.com/package/@countrystatecity/countries",
        desc: "@countrystatecity/countries & /timezones — zero-dependency, fully typed, offline-first, tree-shakeable. 427 timezones, 100% IANA coverage.",
        tech: ["TypeScript", "tsup", "Vitest"],
      },
      {
        id: "csc-python",
        name: "CSC Python package",
        tag: "CSC Ecosystem · packages",
        url: "https://pypi.org/project/countrystatecity-countries/",
        desc: "countrystatecity-countries — fully typed Pydantic models for Python, offline-first.",
        tech: ["Pydantic", "pytest", "mypy", "ruff"],
      },
      {
        id: "ilovejson",
        name: "iLoveJSON",
        tag: "Product",
        url: "https://ilovejson.com",
        desc: "28+ JSON tools in one place — 20 bidirectional converters plus beautify, diff, merge, query, and faker. Inspired by iLovePDF.",
        tech: ["Next.js", "Prisma", "NextAuth", "Radix UI", "Tailwind"],
      },
      {
        id: "ccm",
        name: "ccm",
        tag: "Dev tool",
        url: "https://github.com/dr5hn/ccm",
        desc: "Claude Code Manager — a power-user toolkit for Claude Code: multi-account switching with OS keychain integration (macOS, Linux, WSL).",
        tech: ["Shell", "Bash", "Keychain"],
      },
    ],

    skills: {
      "AI / ML": ["AI Agents", "RAG Architecture", "Prompt Engineering", "Multi-Agent Orchestration", "Vector Search", "Embeddings", "AI Evaluation", "MCP"],
      "AI Tooling": ["Claude Code", "Cursor", "n8n", "OpenAI Assistants", "Supabase Vectors", "Tavily", "GitHub Copilot", "Pinecone"],
      "Backend": ["PHP 8", "Laravel", "Node.js", "Python", "Express", "FastAPI", "Django"],
      "Frontend": ["TypeScript", "React", "Next.js", "Alpine.js", "Three.js / R3F", "Motion", "Radix UI", "Tailwind"],
      "Databases": ["MySQL", "MongoDB", "Redis", "PostgreSQL", "Neo4j", "Elasticsearch", "pgvector"],
      "DevOps": ["GitHub Actions", "Docker", "AWS", "Vercel", "Kinsta", "Linode", "Playwright", "Cypress"],
    },

    achievements: [
      "Maintainer of countries-states-cities-database — " + M.ossLine + ", " + M.requests + " API requests served.",
      "Promoted to Head of AI & Innovations; nominated for Employee of the Year.",
      "Documented 15–40% dev-time savings and 60–80% documentation-time savings from AI adoption.",
      "Saved ~80% of DevOps effort on WeOne & Slingshot via GitHub Actions automation.",
      "Improved WeOne API responses 50% with a Redis in-memory cache.",
      "Achieved a 100% SEO score for Windrush Car Storage through performance work.",
      "Raised test coverage from 0% → 75% on Enablr and 40% → 75% on Kirkus Reviews.",
    ],

    education: [
      { degree: "Master of Computer Application", school: "IGNOU University, Delhi", period: "2014 — 2017" },
      { degree: "B.Sc. Information Technology", school: "Mumbai University", period: "2008 — 2011" },
    ],
  };
})();
