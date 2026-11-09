/**
 * Content migrated from the original portfolio (src/lib/profile.ts and
 * public/*.json). After seeding, the database is the single source of truth;
 * edit everything in the admin panel, not here.
 */

export const profile = {
  fullName: "Pavani VLN Charan",
  headline: "Full-Stack Developer",
  yearsExperience: "3+ years",
  location: "Hyderabad, India",
  email: "pavanivlncharan@outlook.com",
  phone: "",
  heroEyebrow: "Full-Stack Developer · Hyderabad, India",
  heroHeading: "I build secure, scalable web applications, from interface to API.",
  heroSubheading:
    "3+ years delivering end-to-end products with React, TypeScript, Node.js and Express: role-based access systems, multi-role B2B SaaS platforms and automation that saves teams real hours.",
  heroCtas: [
    { label: "View projects", href: "/projects", variant: "primary" },
    { label: "Get in touch", href: "/contact", variant: "secondary" },
  ],
  summary:
    "Full-Stack Developer with 3+ years of experience building scalable, secure, user-centric web applications with JavaScript, TypeScript, React, Node.js, Express, MongoDB and REST APIs. Built role-based authentication for enterprise and government projects, a multi-role B2B SaaS platform for property management, and automated PDF ID-card generation that cut manual data entry.",
  about: [
    "I am a Full-Stack Developer with experience in building scalable, secure, and user-centric web applications. I specialize in JavaScript, React.js, Node.js, MongoDB, Express.js, Tailwind CSS, and REST APIs, delivering complete end-to-end solutions from frontend interfaces to backend systems.",
    "I have developed and integrated role-based authentication and authorization systems for enterprise and government applications, ensuring secure multi-user access. I have also engineered a multi-role B2B SaaS platform for property management and built a B2B employee management system with automated PDF ID card generation, improving operational efficiency.",
    "I am passionate about clean code, performance optimization, and learning modern full-stack technologies. I enjoy collaborating with cross-functional teams to build reliable products that solve real-world problems.",
  ],
  specializations: [
    "Role-based authentication & authorization",
    "B2B SaaS platforms",
    "Automated PDF generation & ID systems",
    "Performance optimization",
  ],
  interests:
    "Passionate about clean code, continuous learning of modern full-stack technologies, and collaborating with teams to solve real-world problems.",
};

export const settings = {
  siteTitle: "Pavani VLN Charan",
  seoTitle: "Pavani VLN Charan · Full-Stack Developer",
  seoDescription:
    "Full-stack developer in Hyderabad building secure, scalable web applications with React, TypeScript, Node.js and Express.",
  siteUrl: "http://localhost:3000",
  footerText: "Designed and built with Next.js, TypeScript and Tailwind CSS.",
  defaultTheme: "system",
  navItems: [
    { label: "About", href: "/#about" },
    { label: "Projects", href: "/projects" },
    { label: "Experience", href: "/experience" },
    { label: "Skills", href: "/skills" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ],
  homeSections: [
    { key: "about", visible: true },
    { key: "projects", visible: true },
    { key: "experience", visible: true },
    { key: "skills", visible: true },
    { key: "education", visible: true },
    { key: "certifications", visible: true },
    { key: "achievements", visible: true },
    { key: "blog", visible: true },
    { key: "contact", visible: true },
  ],
};

export const socials = [
  { label: "GitHub", url: "https://github.com/charanvlnpavani", icon: "github" },
  { label: "LinkedIn", url: "https://www.linkedin.com/in/charanvlnpavani/", icon: "linkedin" },
  { label: "X (Twitter)", url: "https://x.com/charanvlnpavani", icon: "x" },
  { label: "Email", url: "mailto:pavanivlncharan@outlook.com", icon: "mail" },
];

export const skillCategories: { name: string; skills: string[] }[] = [
  { name: "Frontend", skills: ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Tailwind CSS", "Bootstrap"] },
  { name: "Backend", skills: ["Node.js", "Express.js", "PHP"] },
  { name: "Database", skills: ["MongoDB", "MySQL"] },
  { name: "APIs & Tools", skills: ["REST APIs", "Postman", "GitHub"] },
  { name: "AI Tools", skills: ["ChatGPT", "GitHub Copilot", "Perplexity", "NotebookLM"] },
  { name: "Foundations", skills: ["Data Structures & Algorithms"] },
];

export const experiences = [
  {
    company: "NxtWave",
    designation: "Software Developer Engineer",
    employmentType: "Full-time",
    location: "Hyderabad, Telangana, India",
    startDate: "2025-09",
    endDate: "2025-12",
    responsibilities: [
      "Contributed to development of static and dynamic web applications using HTML, CSS, Bootstrap, JavaScript, and Python.",
      "Focused on debugging workflows and building data-driven features while maintaining clean code practices.",
    ],
    technologies: ["Python", "Bootstrap", "Tailwind CSS", "HTML5", "JavaScript", "MERN"],
  },
  {
    company: "Logpilot",
    designation: "SDE 1 · Frontend Developer",
    employmentType: "Full-time",
    location: "Germany · Remote",
    startDate: "2024-12",
    endDate: "2025-06",
    responsibilities: [
      "Developed responsive web applications using React.js and JavaScript that improved user engagement by 30%.",
      "Collaborated with cross-functional teams to implement user-centered design principles and improve usability.",
      "Engaged in continuous learning of modern web technologies to contribute innovative solutions.",
    ],
    technologies: ["Frontend Development", "React.js", "JavaScript"],
  },
  {
    company: "Entro Labs IT Solutions Pvt Ltd",
    designation: "SDE 1 · Frontend Developer",
    employmentType: "Full-time",
    location: "Hyderabad, Telangana, India · On-site",
    startDate: "2024-04",
    endDate: "2024-10",
    responsibilities: [
      "Developed and integrated a robust role-based authentication system for a government school management project using PHP and MySQL.",
      "Engineered and launched a scalable multi-role B2B SaaS platform for property management, reducing administrative overhead by 20%.",
      "Created an automated system to generate downloadable PDF ID cards, reducing manual data entry efforts.",
    ],
    technologies: ["PHP", "MySQL", "B2B SaaS Development", "Authentication Systems"],
  },
  {
    company: "Deepija Telecom Pvt Ltd",
    designation: "SDE 1 · Frontend Developer",
    employmentType: "Full-time",
    location: "Hyderabad, Telangana, India · On-site",
    startDate: "2023-02",
    endDate: "2024-03",
    responsibilities: [
      "Developed interactive dashboards and features that improved monitoring and administrative workflows.",
      "Collaborated with cross-functional teams to identify performance bottlenecks and implemented optimizations that improved overall application efficiency.",
    ],
    technologies: ["PHP", "MySQL", "Dashboard Development"],
  },
];

export const projects = [
  {
    slug: "coffeequeue-pro",
    title: "CoffeeQueue Pro",
    summary:
      "A virtual queue for busy cafés: customers join online, see their live position and get updates without standing in line.",
    description: [
      "In busy café environments, long physical queues frustrate customers and reduce operational efficiency. CoffeeQueue Pro solves this by offering a virtual queue system where customers can join the queue online, see their real-time position, and receive updates without waiting in line, freeing them to relax, browse the café menu, or explore nearby areas while they wait.",
    ],
    technologies: ["React.js", "TypeScript", "Vite", "Tailwind CSS", "shadcn/ui", "Responsive Web Design", "Git & GitHub"],
    category: "Web app",
    liveUrl: "https://coffeequeue-pro.vercel.app",
    // The old data linked this to the employee-management repo (wrong project).
    // Add the correct repository in the admin panel.
    githubUrl: null,
    isFeatured: true,
  },
  {
    slug: "ai-recipe-creator",
    title: "AI Recipe Creator",
    summary:
      "Generates complete recipes from natural-language prompts, tailored to available ingredients, diet, servings and cuisine.",
    description: [
      "AI Recipe Creator uses natural language prompts to generate complete recipes tailored to available ingredients, dietary restrictions, serving size, and cuisine style. It produces ingredient lists, step-by-step instructions, and optional shopping or nutrition info to make cooking faster and easier.",
    ],
    technologies: ["React.js", "TypeScript", "Vite", "Tailwind CSS", "shadcn/ui", "Responsive Web Design", "Git & GitHub"],
    category: "Web app",
    liveUrl: "https://ai-recipe-creator-alpha.vercel.app/",
    githubUrl: "https://github.com/charanvlnpavani/ai_recipe_creator",
    isFeatured: true,
  },
  {
    slug: "communication-app",
    title: "Communication App",
    summary: "A responsive real-time chat interface with conversations, contacts and smooth interaction flows.",
    description: [
      "Built a responsive real-time communication platform using React.js and modern frontend practices. The app allows users to send and receive messages in a chat interface, view active conversations, manage contacts, and features an intuitive UI with smooth, user-friendly interaction flows.",
      "Backend functionality is simulated using local state and storage to prototype real-world UX.",
    ],
    technologies: ["React.js", "JavaScript", "CSS", "Responsive Design", "Local Storage"],
    category: "Web app",
    liveUrl: "https://home-task-cyan.vercel.app/",
    githubUrl: "https://github.com/charanvlnpavani/doctor-communicate",
    isFeatured: true,
  },
  {
    slug: "property-management-saas",
    title: "Property Management SaaS",
    summary: "A multi-role SaaS platform for property managers with role-based access control and automation features.",
    description: [],
    technologies: ["PHP", "MySQL", "Role-based access control"],
    category: "Professional work",
    liveUrl: null,
    githubUrl: null,
    isFeatured: false,
  },
  {
    slug: "employee-management-id-system",
    title: "Employee Management & ID System",
    summary:
      "B2B system for employee records and automated PDF ID card generation to streamline onboarding and operations.",
    description: [],
    technologies: ["PHP", "MySQL", "PDF generation"],
    category: "Professional work",
    liveUrl: null,
    githubUrl: null,
    isFeatured: false,
  },
];

export const education = [
  { institution: "PBR Visvodaya Institute of Technology & Science", degree: "M.Tech", field: "Computer Science and Engineering", endYear: 2023 },
  { institution: "PBR Visvodaya Institute of Technology & Science", degree: "B.Tech", field: "Computer Science and Engineering", endYear: 2019 },
  // School-level entries stay on the website but are left off the resume by default.
  { institution: "Srinivasa Junior College", degree: "Intermediate", field: "M.P.C", endYear: 2015, includeInResume: false },
  { institution: "Ratnam High School", degree: "10th Grade", field: "General Studies", endYear: 2013, includeInResume: false },
];

export const resumeSettings = {
  template: "classic",
  fileName: "Pavani_VLN_Charan_Resume.pdf",
  sectionOrder: ["summary", "skills", "experience", "projects", "education", "certifications", "achievements"],
  sections: { summary: true, skills: true, experience: true, projects: true, education: true, certifications: true, achievements: true },
  maxProjects: 3,
  maxBulletsPerRole: 4,
  includePortfolioUrl: true,
};
