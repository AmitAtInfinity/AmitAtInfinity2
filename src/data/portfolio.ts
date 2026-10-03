// ============================================================
// PORTFOLIO DATA — edit this file to update all content
// ============================================================

export const OWNER = {
  name: "Amit Kumar Patel",
  tagline: "B.Tech CCE Student",
  bio: "Currently pursuing B.Tech in Computer and Communication Engineering (CCE) at Amrita Vishwa Vidyapeetham.",
  email: "amitkumarpatel6024@gmail.com",
  github: "https://github.com/amitk", 
  linkedin: "https://www.linkedin.com/in/amit-patel-7b573b303/",
  leetcode: "https://leetcode.com/u/AmitKumarPatel",
  resume: "/resume.pdf",
}

export const SKILLS = {
  languages: ["Java", "Python", "C", "SQL"],
  concepts: ["Data Structures & Algorithms", "Object-Oriented Design", "Database Management", "RESTful APIs"],
  tools: ["Git/GitHub", "CI/CD", "Agile/Scrum", "AI-assisted tools"],
  databases: ["MySQL", "PostgreSQL", "MongoDB"],
  soft_skills: ["Communication", "Teamwork", "Problem-Solving", "Adaptability", "Time Management"],
}

export const PROJECTS = [
  {
    id: "proj-1",
    title: "Library Management System",
    description: "Designed and implemented a full-featured library management application supporting book uploading, lending, renewal, and return tracking. Designed a normalized relational database schema with optimized SQL queries.",
    technologies: ["Java", "MySQL", "JDBC", "OOP"],
    github: "https://github.com/amitk/library-system",
    demo: null,
    featured: true,
  },
  {
    id: "proj-2",
    title: "Lost and Found App",
    description: "Developed a full-stack web application allowing users to report, search, and claim lost or found items on a campus community with matching algorithms based on category and location.",
    technologies: ["Python", "Flask", "SQL", "REST API"],
    github: "https://github.com/amitk/lost-and-found",
    demo: null,
    featured: true,
  },
  {
    id: "proj-3",
    title: "Personal Expense Tracker",
    description: "Built a console/desktop application to add, categorize, and track daily expenses, with monthly summaries pulled from a MySQL database. Managed development using Git feature branches and issue tracking.",
    technologies: ["Java", "MySQL", "Git", "GitHub"],
    github: "https://github.com/amitk/expense-tracker",
    demo: null,
    featured: false,
  },
]

export const RESEARCH = []

export const EXPERIENCE = [
  {
    id: "exp-1",
    role: "Software Development Intern",
    company: "Bharat Heavy Electricals Limited (BHEL) - DTG Block",
    duration: "April 2026 – May 2026",
    description: "Gained hands-on exposure to internal application design. Worked on database design and handling for a Library Management System, assisting with book cataloging and borrowing workflows. Learned code review practices and debugging techniques for data consistency.",
    technologies: ["Database Design", "SQL", "System Design", "Debugging"],
  },
]

export const ACHIEVEMENTS = [
  { id: "ach-harbor",    title: "Sailor",          description: "You left the harbor.",     icon: "⚓", secret: false },
  { id: "ach-lighthouse",title: "Enlightened",     description: "You found the Lighthouse.", icon: "🔦", secret: false },
  { id: "ach-skills",   title: "Jack of All",      description: "You explored Skills Island.", icon: "⚙️", secret: false },
  { id: "ach-projects", title: "Architect",        description: "You reached Projects Island.", icon: "🏔️", secret: false },
  { id: "ach-research", title: "Scholar",          description: "You found the Research Island.", icon: "📜", secret: false },
  { id: "ach-wreck",    title: "Deep Diver",       description: "You found the Shipwreck.",  icon: "🚢", secret: false },
  { id: "ach-treasure", title: "Treasure Hunter",  description: "You found the Treasure Chest.", icon: "💎", secret: false },
  { id: "ach-horizon",  title: "At The Horizon",   description: "You reached the edge of the world.", icon: "🌅", secret: false },
  { id: "ach-bermuda",  title: "Lost at Sea",      description: "You sailed into the Bermuda Triangle.", icon: "☠️", secret: true },
  { id: "ach-secret",   title: "Explorer",         description: "You found a secret area.",  icon: "🗺️", secret: true },
  { id: "ach-speed",    title: "Full Throttle",    description: "You hit maximum speed.",    icon: "💨", secret: true },
]

// World map destinations — used by WorldMap UI and trigger zones
export const DESTINATIONS = [
  { id: "harbor",    label: "Harbor",          section: "Home",         icon: "⚓", position: [0, 0, 0] as [number, number, number] },
  { id: "lighthouse",label: "Lighthouse",      section: "About Me",     icon: "🔦", position: [-80, 0, -60] as [number, number, number] },
  { id: "skills",    label: "Skills Island",   section: "Skills",       icon: "⚙️", position: [0, 0, -130] as [number, number, number] },
  { id: "projects",  label: "Projects Island", section: "Projects",     icon: "🏔️", position: [-20, 0, -250] as [number, number, number] },
  { id: "research",  label: "Research Island", section: "Research",     icon: "📜", position: [80, 0, -200] as [number, number, number] },
  { id: "wreck",     label: "Shipwreck",       section: "Experience",   icon: "🚢", position: [0, 0, -350] as [number, number, number] },
  { id: "treasure",  label: "Treasure Chest",  section: "Achievements", icon: "💎", position: [-120, 0, -300] as [number, number, number] },
  { id: "horizon",   label: "Horizon",         section: "Contact",      icon: "🌅", position: [0, 0, -500] as [number, number, number] },
  { id: "secret",    label: "???",             section: "Secret",       icon: "❓", position: [150, 0, -180] as [number, number, number] },
]
