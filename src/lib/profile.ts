export type Experience = {
  company: string;
  role: string;
  timeframe: string;
  bullets: string[];
  location?: string;
  employmentType?: string;
  skills?: string[];
  summary?: string;
};

export type Project = {
  title: string;
  summary: string;
  link?: string;
};

export type Education = {
  institution: string;
  degree: string;
  timeframe: string;
  location?: string;
  summary?: string;
  courses?: string[];
};

const PROFILE = {
  name: "Pavani VLN Charan",
  headline: "Full-Stack Developer at LogPilot",
  location: "Hyderabad, India",
  summary:
    "I am a Full-Stack Developer at LogPilot with experience in building scalable, secure, and user-centric web applications. I specialize in JavaScript, React.js, Node JS, Mongo DB, Express JS , Tailwind CSS and REST APIs, delivering complete end-to-end solutions from frontend interfaces to backend systems. I have developed and integrated role-based authentication and authorization systems for enterprise and government applications, ensuring secure multi-user access. I have also engineered a multi-role B2B SaaS platform for property management and built a B2B employee management system with automated PDF ID card generation, improving operational efficiency.I am passionate about clean code, performance optimization, and learning modern full-stack technologies. I enjoy collaborating with cross-functional teams to build reliable products that solve real-world problems.",
  specializations: [
    "Role-based authentication & authorization",
    "B2B SaaS platforms",
    "Automated PDF generation & ID systems",
    "Performance optimization",
  ],
  skills: [
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js",
    "Express",
    "MongoDB",
    "Tailwind CSS",
    "REST APIs",
    "Authentication",
  ],
  experiences: [
    {
      company: "NxtWave",
      role: "Software Developer Engineer",
      timeframe: "Sep 2025 - Present",
      employmentType: "Full-time",
      location: "Hyderabad, Telangana, India",
      bullets: [
        "Contributed to development of static and dynamic web applications using HTML, CSS, Bootstrap, JavaScript, and Python.",
        "Focused on debugging workflows and building data-driven features while maintaining clean code practices.",
      ],
      skills: [
        "Python",
        "Bootstrap",
        "Tailwind CSS",
        "HTML5",
        "JavaScript",
        "MERN",
      ],
    },
    {
      company: "Logpilot",
      role: "SDE - 1 — Frontend Developer",
      timeframe: "Dec 2024 - Sep 2025",
      employmentType: "Full-time",
      location: "Germany · Remote",
      bullets: [
        "Developed responsive web applications using React.js and JavaScript that improved user engagement by 30%.",
        "Collaborated with cross-functional teams to implement user-centered design principles and improve usability.",
        "Engaged in continuous learning of modern web technologies to contribute innovative solutions.",
      ],
      skills: ["Frontend Development", "React.js", "JavaScript"],
    },
    {
      company: "Entro Labs IT Solutions Pvt Ltd",
      role: "SDE - 1 — Frontend Developer",
      timeframe: "Apr 2024 - Oct 2024",
      employmentType: "Full-time",
      location: "Hyderabad, Telangana, India · On-site",
      bullets: [
        "Developed and integrated a robust role-based authentication system for a government school management project using PHP and MySQL.",
        "Engineered and launched a scalable multi-role B2B SaaS platform for property management, reducing administrative overhead by 20%.",
        "Created an automated system to generate downloadable PDF ID cards, reducing manual data entry efforts.",
      ],
      skills: [
        "PHP",
        "MySQL",
        "B2B SaaS Development",
        "Authentication Systems",
      ],
    },
    {
      company: "Deepija Telecom Pvt Ltd",
      role: "SDE - 1 — Frontend Developer",
      timeframe: "Feb 2023 - Mar 2024",
      employmentType: "Full-time",
      location: "Hyderabad, Telangana, India · On-site",
      bullets: [
        "Developed interactive dashboards and features that improved monitoring and administrative workflows.",
        "Collaborated with cross-functional teams to identify performance bottlenecks and implemented optimizations that improved overall application efficiency.",
      ],
      skills: ["PHP", "MySQL", "Dashboard Development"],
    },
  ] as Experience[],
  projects: [
    {
      title: "Property Management SaaS",
      summary:
        "A multi-role SaaS platform for property managers with role-based access control and automation features.",
    },
    {
      title: "Employee Management & ID System",
      summary:
        "B2B system for employee records and automated PDF ID card generation to streamline onboarding and operations.",
    },
  ] as Project[],

  education: [
    {
      institution: "PBR Visvodaya Institute of Technology & Science",
      degree: "M.Tech — Computer Science and Engineering",
      timeframe: "2023",
    },
    {
      institution: "PBR Visvodaya Institute of Technology & Science",
      degree: "B.Tech — Computer Science and Engineering",
      timeframe: "2019",
    },
    {
      institution: "Srinivasa Junior College",
      degree: "Intermediate — M.P.C",
      timeframe: "2015",
    },
    {
      institution: "Ratnam High School",
      degree: "10th Grade — General Studies",
      timeframe: "2013",
    },
  ] as Education[],

  interests:
    "Passionate about clean code, continuous learning of modern full-stack technologies, and collaborating with teams to solve real-world problems.",
};

export default PROFILE;
