/**
 * TEMPORARY content source (Phase 2).
 *
 * Everything here was moved from the old `src/lib/profile.ts` and
 * `public/*.json`, so there is now one source of truth. Pages only talk to the
 * async getters at the bottom of this file. In Phase 5 those getters will call
 * the backend API instead, and no page component has to change.
 */
import type {
  About,
  Certification,
  Education,
  Experience,
  Hero,
  Profile,
  Project,
  SiteContent,
  SiteSettings,
  SkillCategory,
  SocialLink,
} from "./types";

const settings: SiteSettings = {
  siteTitle: "Pavani VLN Charan",
  seoTitle: "Pavani VLN Charan · Full-Stack Developer",
  seoDescription:
    "Full-stack developer in Hyderabad building secure, scalable web applications with React, TypeScript, Node.js and Express.",
  navItems: [
    { label: "About", href: "/#about" },
    { label: "Projects", href: "/projects" },
    { label: "Experience", href: "/experience" },
    { label: "Skills", href: "/skills" },
    { label: "Education", href: "/education" },
    { label: "Contact", href: "/contact" },
  ],
  footerText: "Designed and built with Next.js, TypeScript and Tailwind CSS.",
};

const profile: Profile = {
  fullName: "Pavani VLN Charan",
  initials: "PC",
  title: "Full-Stack Developer",
  yearsExperience: "3+ years",
  location: "Hyderabad, India",
  publicEmail: "pavanivlncharan@outlook.com",
  avatar: {
    url: "/images/profile.jpeg",
    width: 774,
    height: 927,
    alt: "Portrait of Pavani VLN Charan",
  },
  resumeUrl: "/documents/charanvlnpavani_cv.pdf",
};

const hero: Hero = {
  eyebrow: "Full-Stack Developer · Hyderabad, India",
  heading: "I build secure, scalable web applications, from interface to API.",
  subheading:
    "3+ years delivering end-to-end products with React, TypeScript, Node.js and Express: role-based access systems, multi-role B2B SaaS platforms and automation that saves teams real hours.",
  ctas: [
    { label: "View projects", href: "/projects", variant: "primary" },
    { label: "Get in touch", href: "/contact", variant: "secondary" },
  ],
};

const about: About = {
  biography: [
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

const socials: SocialLink[] = [
  { id: "github", label: "GitHub", url: "https://github.com/charanvlnpavani", icon: "github" },
  {
    id: "linkedin",
    label: "LinkedIn",
    url: "https://www.linkedin.com/in/charanvlnpavani/",
    icon: "linkedin",
  },
  { id: "x", label: "X (Twitter)", url: "https://x.com/charanvlnpavani", icon: "x" },
  { id: "email", label: "Email", url: "mailto:pavanivlncharan@outlook.com", icon: "mail" },
];

const experiences: Experience[] = [
  {
    id: "nxtwave",
    company: "NxtWave",
    designation: "Software Developer Engineer",
    employmentType: "Full-time",
    location: "Hyderabad, Telangana, India",
    startDate: "2025-09",
    endDate: "2025-12",
    isCurrent: false,
    responsibilities: [
      "Contributed to development of static and dynamic web applications using HTML, CSS, Bootstrap, JavaScript, and Python.",
      "Focused on debugging workflows and building data-driven features while maintaining clean code practices.",
    ],
    technologies: ["Python", "Bootstrap", "Tailwind CSS", "HTML5", "JavaScript", "MERN"],
  },
  {
    id: "logpilot",
    company: "Logpilot",
    designation: "SDE 1 · Frontend Developer",
    employmentType: "Full-time",
    location: "Germany · Remote",
    startDate: "2024-12",
    endDate: "2025-06",
    isCurrent: false,
    responsibilities: [
      "Developed responsive web applications using React.js and JavaScript that improved user engagement by 30%.",
      "Collaborated with cross-functional teams to implement user-centered design principles and improve usability.",
      "Engaged in continuous learning of modern web technologies to contribute innovative solutions.",
    ],
    technologies: ["Frontend Development", "React.js", "JavaScript"],
  },
  {
    id: "entro-labs",
    company: "Entro Labs IT Solutions Pvt Ltd",
    designation: "SDE 1 · Frontend Developer",
    employmentType: "Full-time",
    location: "Hyderabad, Telangana, India · On-site",
    startDate: "2024-04",
    endDate: "2024-10",
    isCurrent: false,
    responsibilities: [
      "Developed and integrated a robust role-based authentication system for a government school management project using PHP and MySQL.",
      "Engineered and launched a scalable multi-role B2B SaaS platform for property management, reducing administrative overhead by 20%.",
      "Created an automated system to generate downloadable PDF ID cards, reducing manual data entry efforts.",
    ],
    technologies: ["PHP", "MySQL", "B2B SaaS Development", "Authentication Systems"],
  },
  {
    id: "deepija-telecom",
    company: "Deepija Telecom Pvt Ltd",
    designation: "SDE 1 · Frontend Developer",
    employmentType: "Full-time",
    location: "Hyderabad, Telangana, India · On-site",
    startDate: "2023-02",
    endDate: "2024-03",
    isCurrent: false,
    responsibilities: [
      "Developed interactive dashboards and features that improved monitoring and administrative workflows.",
      "Collaborated with cross-functional teams to identify performance bottlenecks and implemented optimizations that improved overall application efficiency.",
    ],
    technologies: ["PHP", "MySQL", "Dashboard Development"],
  },
];

const projects: Project[] = [
  {
    id: "coffeequeue-pro",
    slug: "coffeequeue-pro",
    title: "CoffeeQueue Pro",
    summary:
      "A virtual queue for busy cafés: customers join online, see their live position and get updates without standing in line.",
    description: [
      "In busy café environments, long physical queues frustrate customers and reduce operational efficiency. CoffeeQueue Pro solves this by offering a virtual queue system where customers can join the queue online, see their real-time position, and receive updates without waiting in line, freeing them to relax, browse the café menu, or explore nearby areas while they wait.",
    ],
    technologies: [
      "React.js",
      "TypeScript",
      "Vite",
      "Tailwind CSS",
      "shadcn/ui",
      "Responsive Web Design",
      "Git & GitHub",
    ],
    category: "Web app",
    liveUrl: "https://coffeequeue-pro.vercel.app",
    // TODO(content): the old JSON pointed this at the employee-management
    // repo, which is the wrong project. Add the correct repo URL here.
    githubUrl: undefined,
    isFeatured: true,
    images: [],
  },
  {
    id: "ai-recipe-creator",
    slug: "ai-recipe-creator",
    title: "AI Recipe Creator",
    summary:
      "Generates complete recipes from natural-language prompts, tailored to available ingredients, diet, servings and cuisine.",
    description: [
      "AI Recipe Creator uses natural language prompts to generate complete recipes tailored to available ingredients, dietary restrictions, serving size, and cuisine style. It produces ingredient lists, step-by-step instructions, and optional shopping or nutrition info to make cooking faster and easier.",
    ],
    technologies: [
      "React.js",
      "TypeScript",
      "Vite",
      "Tailwind CSS",
      "shadcn/ui",
      "Responsive Web Design",
      "Git & GitHub",
    ],
    category: "Web app",
    liveUrl: "https://ai-recipe-creator-alpha.vercel.app/",
    githubUrl: "https://github.com/charanvlnpavani/ai_recipe_creator",
    isFeatured: true,
    images: [],
  },
  {
    id: "communication-app",
    slug: "communication-app",
    title: "Communication App",
    summary:
      "A responsive real-time chat interface with conversations, contacts and smooth interaction flows.",
    description: [
      "Built a responsive real-time communication platform using React.js and modern frontend practices. The app allows users to send and receive messages in a chat interface, view active conversations, manage contacts, and features an intuitive UI with smooth, user-friendly interaction flows.",
      "Backend functionality is simulated using local state and storage to prototype real-world UX.",
    ],
    technologies: ["React.js", "JavaScript", "CSS", "Responsive Design", "Local Storage"],
    category: "Web app",
    liveUrl: "https://home-task-cyan.vercel.app/",
    githubUrl: "https://github.com/charanvlnpavani/doctor-communicate",
    isFeatured: true,
    images: [],
  },
  {
    id: "property-management-saas",
    slug: "property-management-saas",
    title: "Property Management SaaS",
    summary:
      "A multi-role SaaS platform for property managers with role-based access control and automation features.",
    technologies: ["PHP", "MySQL", "Role-based access control"],
    category: "Professional work",
    isFeatured: false,
    images: [],
  },
  {
    id: "employee-management-id-system",
    slug: "employee-management-id-system",
    title: "Employee Management & ID System",
    summary:
      "B2B system for employee records and automated PDF ID card generation to streamline onboarding and operations.",
    technologies: ["PHP", "MySQL", "PDF generation"],
    category: "Professional work",
    isFeatured: false,
    images: [],
  },
];

const skillCategories: SkillCategory[] = [
  {
    id: "frontend",
    name: "Frontend",
    skills: ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Tailwind CSS", "Bootstrap"],
  },
  { id: "backend", name: "Backend", skills: ["Node.js", "Express.js", "PHP"] },
  { id: "database", name: "Database", skills: ["MongoDB", "MySQL"] },
  { id: "api", name: "APIs & Tools", skills: ["REST APIs", "Postman", "GitHub"] },
  {
    id: "ai-tools",
    name: "AI Tools",
    skills: ["ChatGPT", "GitHub Copilot", "Perplexity", "NotebookLM"],
  },
  { id: "other", name: "Foundations", skills: ["Data Structures & Algorithms"] },
].map((c) => ({
  ...c,
  skills: c.skills.map((name) => ({ id: `${c.id}-${name}`, name })),
}));

const education: Education[] = [
  {
    id: "mtech",
    institution: "PBR Visvodaya Institute of Technology & Science",
    degree: "M.Tech",
    field: "Computer Science and Engineering",
    endYear: 2023,
    courses: [],
  },
  {
    id: "btech",
    institution: "PBR Visvodaya Institute of Technology & Science",
    degree: "B.Tech",
    field: "Computer Science and Engineering",
    endYear: 2019,
    courses: [],
  },
  {
    id: "intermediate",
    institution: "Srinivasa Junior College",
    degree: "Intermediate",
    field: "M.P.C",
    endYear: 2015,
    courses: [],
  },
  {
    id: "ssc",
    institution: "Ratnam High School",
    degree: "10th Grade",
    field: "General Studies",
    endYear: 2013,
    courses: [],
  },
];

const certifications: Certification[] = [];

/* ------------------------------------------------------------------ */
/* Public getters: the only thing pages import.                        */
/* Async on purpose, so swapping in `fetch()` later changes nothing.   */
/* ------------------------------------------------------------------ */

const byNewest = (a: Experience, b: Experience) =>
  (b.endDate ?? "9999").localeCompare(a.endDate ?? "9999") ||
  b.startDate.localeCompare(a.startDate);

export async function getSiteContent(): Promise<SiteContent> {
  return { settings, profile, hero, about, socials };
}

export async function getProjects(): Promise<Project[]> {
  return projects;
}

export async function getFeaturedProjects(): Promise<Project[]> {
  return projects.filter((p) => p.isFeatured);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  return projects.find((p) => p.slug === slug) ?? null;
}

export async function getExperiences(): Promise<Experience[]> {
  return [...experiences].sort(byNewest);
}

export async function getSkillCategories(): Promise<SkillCategory[]> {
  return skillCategories;
}

export async function getEducation(): Promise<Education[]> {
  return [...education].sort((a, b) => b.endYear - a.endYear);
}

export async function getCertifications(): Promise<Certification[]> {
  return certifications;
}
