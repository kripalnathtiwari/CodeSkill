import { Code2, MonitorPlay, Users, Sun, Code, Layers, Brain, Terminal, Database, ShieldAlert, Cpu } from "lucide-react";

export const COURSES_DATA = {
  // SUMMER TRAINING BOOTCAMPS
  "st-1": {
    id: "st-1",
    category: "summer",
    title: "Full Stack Web Development Summer Bootcamp",
    description: "Intensive 8-week summer training covering React, Node.js, Express, and MongoDB. Build 4 real-world projects.",
    duration: "8 Weeks",
    level: "Beginner to Intermediate",
    students: "1.2k+",
    seats: "15 Seats Left",
    partner: "CodeSkill",
    price: "₹4,999",
    tags: ["MERN Stack", "Projects", "Live Classes"],
    trainer: {
      name: "Aditya Verma",
      role: "Senior Full Stack Architect",
      company: "Ex-Amazon",
      experience: "10+ Years",
      rating: "4.9",
      students: "15,000+",
      bio: "Full-stack architect with a track record of deploying distributed web applications and mentoring thousands of aspiring software engineers.",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"
    },
    icon: MonitorPlay,
    color: "from-primary to-sky-400",
    image: "/images/fullstack.png",
    bullets: [
      "Master the MERN stack from the ground up.",
      "Build production-ready web applications with secure authentication.",
      "Deploy apps using Docker and modern CI/CD pipelines.",
      "Includes 4 real-world projects to showcase on your portfolio."
    ],
    modules: [
      { title: "HTML, CSS & Modern JavaScript", desc: "Build responsive UIs and learn ES6+ features, async programming, and DOM manipulation." },
      { title: "React.js Mastery", desc: "Hooks, Context API, Redux Toolkit, and building complex single-page applications." },
      { title: "Node.js & Express API Design", desc: "RESTful architecture, middleware, JWT auth, and server-side logic." },
      { title: "MongoDB & Mongoose", desc: "NoSQL database design, aggregations, schemas, and performance tuning." },
      { title: "Deployment & DevOps Basics", desc: "Dockerizing apps, GitHub Actions, and deploying to AWS/Vercel." }
    ],
    skills: ["HTML5", "TailwindCSS", "React 18", "Node.js", "Express", "MongoDB", "Redux", "Docker", "AWS"],
    techIcons: [Code2, Terminal, Database, Layers]
  },
  "st-2": {
    id: "st-2",
    category: "summer",
    title: "Data Science & AI Summer Program",
    description: "Master Python, Machine Learning, and Neural Networks this summer. Includes guaranteed internship assistance.",
    duration: "10 Weeks",
    level: "Intermediate",
    students: "850+",
    seats: "8 Seats Left",
    partner: "CodeSkill",
    price: "₹5,499",
    tags: ["Python", "AI/ML", "Internship"],
    trainer: {
      name: "Dr. Rohan Mehrotra",
      role: "Lead AI Researcher & ML Specialist",
      company: "Ex-Google DeepMind",
      experience: "8+ Years",
      rating: "4.95",
      students: "12,000+",
      bio: "Ph.D. in Machine Learning specializing in deep neural networks, computer vision, and scalable production AI pipelines.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300"
    },
    icon: Sun,
    color: "from-amber-500 to-orange-400",
    image: "/images/datascience.png",
    bullets: [
      "Master Python libraries: Pandas, NumPy, Scikit-Learn.",
      "Build predictive models using advanced Machine Learning algorithms.",
      "Deep dive into Neural Networks and Deep Learning with PyTorch.",
      "Guaranteed internship assistance upon top performance."
    ],
    modules: [
      { title: "Python for Data Science", desc: "Data manipulation, EDA, and statistical analysis using Pandas and Seaborn." },
      { title: "Machine Learning Foundations", desc: "Regression, Classification, Clustering, and PCA." },
      { title: "Deep Learning & Neural Networks", desc: "Building CNNs and RNNs using PyTorch and TensorFlow." },
      { title: "Generative AI Basics", desc: "Introduction to Transformers and LLM fine-tuning." }
    ],
    skills: ["Python", "Pandas", "Scikit-Learn", "PyTorch", "TensorFlow", "Statistics", "Data Viz"],
    techIcons: [Brain, Cpu, Database]
  },

  // FEATURED / STANDARD COURSES
  "c-1": {
    id: "c-1",
    category: "featured",
    title: "Data Science & Machine Learning",
    description: "Master Python, Neural Networks, and AI algorithms. Build real-world predictive models and deep learning pipelines.",
    duration: "Self-paced (60+ hours)",
    level: "Intermediate",
    students: "12.4k+",
    seats: "Unlimited",
    partner: "CodeSkill",
    price: "₹3,999",
    tags: ["Python", "AI / ML", "Data Science"],
    trainer: {
      name: "Dr. Rohan Mehrotra",
      role: "Lead AI Researcher & ML Specialist",
      company: "Ex-Google DeepMind",
      experience: "8+ Years",
      rating: "4.95",
      students: "12,000+",
      bio: "Ph.D. in Machine Learning specializing in deep neural networks, computer vision, and scalable production AI pipelines.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300"
    },
    icon: Brain,
    color: "from-amber-500 to-orange-400",
    image: "/images/datascience.png",
    bullets: [
      "Master the end-to-end lifecycle: design, build, and deploy ML solutions.",
      "Advance from Python to deep learning pipelines.",
      "Evaluate and deploy AI systems to the cloud."
    ],
    modules: [
      { title: "Applied Python & Statistics", desc: "Learn essential math, probability, and Python data manipulation." },
      { title: "Predictive Modeling", desc: "Supervised and unsupervised learning techniques." },
      { title: "Deep Learning Engineering", desc: "Architectural design of Deep Neural Networks." },
      { title: "MLOps & Deployment", desc: "Packaging ML models using Docker, FastAPI, and Kubernetes." }
    ],
    skills: ["Python", "Machine Learning", "Deep Learning", "MLOps", "FastAPI", "Docker"],
    techIcons: [Brain, Database, Terminal]
  },
  "c-2": {
    id: "c-2",
    category: "featured",
    title: "Full Stack Web Development",
    description: "End-to-end MERN stack engineering. Build scalable architectures, modern UIs, and robust RESTful backends.",
    duration: "Self-paced (80+ hours)",
    level: "Advanced",
    students: "18.1k+",
    seats: "Unlimited",
    partner: "CodeSkill",
    price: "₹3,499",
    tags: ["React", "Node.js", "Full Stack"],
    trainer: {
      name: "Sneha Kapoor",
      role: "Principal Frontend Engineer",
      company: "Microsoft MVP",
      experience: "9+ Years",
      rating: "4.9",
      students: "18,000+",
      bio: "Specialist in React ecosystem, micro-frontends, high-performance UI engineering, and modern design systems.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300"
    },
    icon: MonitorPlay,
    color: "from-primary to-sky-400",
    image: "/images/fullstack.png",
    bullets: [
      "Master modern UI design with React and Tailwind CSS.",
      "Build high-performance REST and GraphQL APIs.",
      "Scale your database architectures using MongoDB and Redis."
    ],
    modules: [
      { title: "Advanced Frontend Architecture", desc: "Next.js, Server Components, and advanced state management." },
      { title: "Backend Systems", desc: "Node.js event loop, Microservices, and API Gateways." },
      { title: "Database Engineering", desc: "Indexing, Sharding, caching with Redis, and complex NoSQL aggregations." },
      { title: "System Security", desc: "OAuth 2.0, JWT, Rate Limiting, and OWASP Top 10 prevention." }
    ],
    skills: ["React", "Next.js", "Node.js", "Redis", "MongoDB", "GraphQL", "Web Security"],
    techIcons: [MonitorPlay, Database, ShieldAlert]
  },
  "c-3": {
    id: "c-3",
    category: "featured",
    title: "Cloud Architecture & System Design",
    description: "Learn how to design scalable, distributed systems like Netflix and Uber using AWS, Docker, and Kubernetes.",
    duration: "Self-paced (40+ hours)",
    level: "Expert",
    students: "9.3k+",
    seats: "Unlimited",
    partner: "CodeSkill",
    price: "₹4,499",
    tags: ["AWS", "Scalability", "Backend"],
    trainer: {
      name: "Vikram Malhotra",
      role: "Staff Systems Engineer",
      company: "Ex-Uber / Netflix",
      experience: "12+ Years",
      rating: "5.0",
      students: "9,000+",
      bio: "Specializes in high-throughput distributed systems, fault-tolerant cloud architecture, and microservices scaling.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300"
    },
    icon: Users,
    color: "from-purple-500 to-indigo-400",
    image: "/images/cloud.png",
    bullets: [
      "Learn distributed systems theory and practical applications.",
      "Design systems capable of handling millions of concurrent users.",
      "Master container orchestration with Kubernetes."
    ],
    modules: [
      { title: "Distributed Systems Theory", desc: "CAP Theorem, Consistency Models, and Consensus Algorithms." },
      { title: "Scalability Patterns", desc: "Load Balancing, Caching strategies, Database partitioning." },
      { title: "Cloud Native Infrastructure", desc: "AWS deep dive: EC2, S3, RDS, Lambda, and VPC architecture." },
      { title: "Kubernetes Orchestration", desc: "Pods, Deployments, Services, and Helm Charts." }
    ],
    skills: ["System Design", "AWS", "Kubernetes", "Docker", "Microservices", "Kafka"],
    techIcons: [Layers, Cpu, Users]
  },

  // OTHER SELF-PACED COURSES
  "dsa-1": {
    id: "dsa-1",
    category: "standard",
    title: "Advanced Data Structures & Algorithms",
    description: "Crack product-based companies with this comprehensive DSA course covering dynamic programming, graphs, and trees.",
    duration: "Self-paced (40+ hours)",
    level: "Advanced",
    students: "5.4k+",
    seats: "Unlimited",
    partner: "CodeSkill",
    price: "₹2,499",
    tags: ["C++ / Java", "Interview Prep", "Algorithms"],
    trainer: {
      name: "Kunal Shah",
      role: "Competitive Programming Master",
      company: "Codeforces Candidate Master",
      experience: "7+ Years",
      rating: "4.95",
      students: "22,000+",
      bio: "Cracked multiple ACM-ICPC regionals and helped over 20,000 students crack coding rounds at top tech companies.",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300"
    },
    icon: Code2,
    color: "from-rose-500 to-pink-400",
    image: "/images/dsa.png",
    bullets: [
      "Master highly complex data structures like Segment Trees and Tries.",
      "Develop a deep intuition for Dynamic Programming.",
      "Ace technical interviews at FAANG companies."
    ],
    modules: [
      { title: "Foundational Data Structures", desc: "Arrays, Linked Lists, Stacks, Queues, and Hashing." },
      { title: "Trees & Graphs", desc: "BST, AVL, DFS, BFS, Dijkstra's, and Minimum Spanning Trees." },
      { title: "Dynamic Programming", desc: "Memoization, Tabulation, Knapsack, and LCS patterns." },
      { title: "Advanced Topics", desc: "Segment Trees, Fenwick Trees, and String Algorithms (KMP, Rabin-Karp)." }
    ],
    skills: ["C++", "Java", "Algorithms", "Dynamic Programming", "Graph Theory", "Problem Solving"],
    techIcons: [Code2, Brain, Terminal]
  },
  "sd-1": {
    id: "sd-1",
    category: "standard",
    title: "System Design Masterclass",
    description: "Learn how to design scalable, distributed systems like Netflix, Uber, and Twitter from ex-FAANG engineers.",
    duration: "Self-paced (25+ hours)",
    level: "Expert",
    students: "3.1k+",
    seats: "Unlimited",
    partner: "CodeSkill",
    price: "₹3,999",
    tags: ["Architecture", "Scalability", "Backend"],
    trainer: {
      name: "Vikram Malhotra",
      role: "Staff Systems Engineer",
      company: "Ex-Uber / Netflix",
      experience: "12+ Years",
      rating: "5.0",
      students: "9,000+",
      bio: "Specializes in high-throughput distributed systems, fault-tolerant cloud architecture, and microservices scaling.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300"
    },
    icon: Users,
    color: "from-purple-500 to-indigo-400",
    image: "/images/system_design.png",
    bullets: [
      "Deconstruct real-world architectures of global platforms.",
      "Master scaling databases, caching layers, and load balancers.",
      "Aces the most complex backend system design interviews."
    ],
    modules: [
      { title: "System Design Basics", desc: "Client-server model, proxies, latency, throughput, and CAP theorem." },
      { title: "Databases & Caching", desc: "Relational vs NoSQL, Sharding, Replication, Memcached, and Redis." },
      { title: "Distributed Systems", desc: "Message Queues (Kafka), Pub/Sub, and Event-driven architectures." },
      { title: "Real-world Case Studies", desc: "Designing Uber, Netflix, WhatsApp, and Twitter." }
    ],
    skills: ["System Design", "Microservices", "Kafka", "Redis", "Database Sharding", "Load Balancing"],
    techIcons: [Layers, Database, Users]
  },
  "react-1": {
    id: "react-1",
    category: "standard",
    title: "React.js Frontend Engineering",
    description: "Deep dive into React internals, state management (Redux, Zustand), and performance optimization techniques.",
    duration: "Self-paced (15+ hours)",
    level: "Intermediate",
    students: "2.8k+",
    seats: "Unlimited",
    partner: "CodeSkill",
    price: "₹1,999",
    tags: ["React", "Frontend", "UI/UX"],
    trainer: {
      name: "Sneha Kapoor",
      role: "Principal Frontend Engineer",
      company: "Microsoft MVP",
      experience: "9+ Years",
      rating: "4.9",
      students: "18,000+",
      bio: "Specialist in React ecosystem, micro-frontends, high-performance UI engineering, and modern design systems.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300"
    },
    icon: MonitorPlay,
    color: "from-rose-500 to-pink-400",
    image: "/images/react.png",
    bullets: [
      "Understand the inner workings of React's Virtual DOM and Reconciliation.",
      "Master state management patterns using Redux Toolkit and Context API.",
      "Build blazing fast interfaces with proven performance optimization."
    ],
    modules: [
      { title: "React Fundamentals", desc: "Components, Props, State, and Component Lifecycle (Hooks)." },
      { title: "Advanced Hooks & Patterns", desc: "useMemo, useCallback, Custom Hooks, and HOCs." },
      { title: "State Management", desc: "Context API, Redux Toolkit, Zustand, and React Query." },
      { title: "Performance & Testing", desc: "Code Splitting, Lazy Loading, Jest, and React Testing Library." }
    ],
    skills: ["React 18", "Redux", "TypeScript", "Tailwind CSS", "Jest", "Frontend Architecture"],
    techIcons: [MonitorPlay, Terminal, Code]
  }
};

export const getAllCourses = () => {
  let customCourses: any[] = [];
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("admin_custom_courses");
      if (saved) customCourses = JSON.parse(saved);
    } catch (e) {}
  }
  return [...Object.values(COURSES_DATA), ...customCourses];
};

export const getCoursesByCategory = (cat: string) => getAllCourses().filter(c => c.category === cat);

export const getCourseById = (id: string) => {
  if (COURSES_DATA[id as keyof typeof COURSES_DATA]) {
    return COURSES_DATA[id as keyof typeof COURSES_DATA];
  }
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("admin_custom_courses");
      if (saved) {
        const parsed = JSON.parse(saved);
        const found = parsed.find((c: any) => String(c.id) === String(id));
        if (found) return found;
      }
    } catch (e) {}
  }
  return undefined;
};
