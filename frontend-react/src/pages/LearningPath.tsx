import React, { useState } from 'react';
import { 
  Compass, 
  CheckCircle2, 
  Circle, 
  Clock, 
  BookOpen, 
  ArrowRight, 
  ExternalLink, 
  Layers, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Code2, 
  Database, 
  Terminal, 
  BrainCircuit, 
  ShieldCheck, 
  Laptop,
  Check
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface PathMilestone {
  title: string;
  duration: string;
  topics: string[];
  practiceLink?: string;
  practiceLabel?: string;
}

interface LearningPathItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  badge: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  description: string;
  skills: string[];
  icon: any;
  accent: string;
  milestones: PathMilestone[];
}

const LEARNING_PATHS: LearningPathItem[] = [
  {
    id: 'full-stack-web',
    title: 'Full Stack Web Development',
    subtitle: 'From frontend fundamentals to scalable backend architecture',
    category: 'Web Engineering',
    badge: 'Most Popular',
    difficulty: 'Beginner',
    duration: '14 Weeks',
    icon: Laptop,
    accent: 'emerald',
    description: 'A structured roadmap covering HTML/CSS, Modern JavaScript, React 18, Node.js, Express, PostgreSQL/MongoDB, and cloud deployments.',
    skills: ['HTML/CSS', 'Tailwind CSS', 'JavaScript (ES6+)', 'React', 'Node.js', 'Express', 'PostgreSQL', 'Docker'],
    milestones: [
      {
        title: 'Phase 1: Web Foundation & Modern JavaScript',
        duration: 'Weeks 1-3',
        topics: ['HTML5 semantic structure & responsive design', 'CSS Grid, Flexbox, Tailwind CSS', 'Modern JS: Promises, Async/Await, ES Modules', 'DOM manipulation & Event driven programming'],
        practiceLink: '/dashboard/practice',
        practiceLabel: 'Practice DSA Basics'
      },
      {
        title: 'Phase 2: Modern Frontend with React & State Management',
        duration: 'Weeks 4-7',
        topics: ['Component lifecycle, custom hooks, useEffect/useMemo', 'Client-side routing with React Router', 'Context API & TanStack Query for server state', 'Forms, validation, and component libraries'],
        practiceLink: '/dashboard/projects',
        practiceLabel: 'Build Web Projects'
      },
      {
        title: 'Phase 3: Backend APIs & Database Architecture',
        duration: 'Weeks 8-11',
        topics: ['RESTful API architecture with Node.js & Express', 'Relational database schema design (PostgreSQL/Prisma)', 'Authentication with JWT, Cookies, and bcrypt', 'Middleware, error handling, and rate limiting'],
        practiceLink: '/dashboard/compiler',
        practiceLabel: 'Test in Compiler'
      },
      {
        title: 'Phase 4: Full Stack Integration & Cloud Deployment',
        duration: 'Weeks 12-14',
        topics: ['Connecting React client to Express server', 'Deployment pipelines: Vercel, Render, Docker', 'Security headers, CORS, and production optimization', 'Capstone Project for resume portfolio'],
        practiceLink: '/dashboard/projects',
        practiceLabel: 'Submit Final Project'
      }
    ]
  },
  {
    id: 'dsa-to-faang',
    title: 'DSA & Competitive Programming Master Track',
    subtitle: 'Top-tier problem solving from beginner to FAANG-ready',
    category: 'Computer Science',
    badge: 'Placement Essential',
    difficulty: 'Intermediate',
    duration: '12 Weeks',
    icon: Terminal,
    accent: 'blue',
    description: 'Systematic progression through Arrays, Strings, Two Pointers, Trees, Graphs, Dynamic Programming, and High-Frequency Interview Problems.',
    skills: ['Arrays & Strings', 'Hashing', 'Recursion & Backtracking', 'Trees & BST', 'Graphs', 'Dynamic Programming', 'Tries'],
    milestones: [
      {
        title: 'Stage 1: Core Fundamentals & Time-Space Complexity',
        duration: 'Weeks 1-2',
        topics: ['Big-O Analysis (time & space)', 'Arrays & Strings basics', 'Two Pointers & Sliding Window techniques', 'HashMaps & HashSets patterns'],
        practiceLink: '/dashboard/practice',
        practiceLabel: 'Solve Foundation DSA'
      },
      {
        title: 'Stage 2: Linear Data Structures & Recursion',
        duration: 'Weeks 3-5',
        topics: ['Singly & Doubly Linked Lists', 'Stacks, Queues, Monotonic Stack pattern', 'Recursion fundamentals & Backtracking (Subsets, Permutations)', 'Binary Search and search-space reductions'],
        practiceLink: '/dashboard/practice',
        practiceLabel: 'Practice Stacks & Trees'
      },
      {
        title: 'Stage 3: Non-Linear Structures: Trees & Graphs',
        duration: 'Weeks 6-9',
        topics: ['Binary Trees, BST properties & traversals', 'Heap / PriorityQueue & Top-K elements', 'Graph representations (Adj List/Matrix)', 'BFS, DFS, Dijkstra, Topological Sort, Cycle Detection'],
        practiceLink: '/dashboard/practice/company-problems',
        practiceLabel: 'Solve Company Graphs'
      },
      {
        title: 'Stage 4: Dynamic Programming & Advanced Patterns',
        duration: 'Weeks 10-12',
        topics: ['1D DP (Climbing stairs, House Robber)', '2D Grid DP & Knapsack variations', 'Longest Common Subsequence & Edit Distance', 'Greedy algorithms, Tries & Interval scheduling'],
        practiceLink: '/dashboard/tests',
        practiceLabel: 'Take Timed DSA Test'
      }
    ]
  },
  {
    id: 'ai-data-science',
    title: 'AI, Machine Learning & Data Science',
    subtitle: 'Data analytics, predictive modeling, and applied AI applications',
    category: 'Artificial Intelligence',
    badge: 'High Demand',
    difficulty: 'Intermediate',
    duration: '16 Weeks',
    icon: BrainCircuit,
    accent: 'purple',
    description: 'Master Python for data analytics, scientific computing with NumPy & Pandas, Scikit-Learn machine learning pipelines, and LLM integrations.',
    skills: ['Python 3', 'NumPy & Pandas', 'Data Visualization', 'Machine Learning', 'Scikit-Learn', 'Feature Engineering', 'LLM API Integration'],
    milestones: [
      {
        title: 'Step 1: Python for Data Science & EDA',
        duration: 'Weeks 1-4',
        topics: ['Advanced Python: generators, comprehensions, OOP', 'NumPy vectorization & matrix operations', 'Pandas dataframes: cleaning, merging, grouping', 'Data visualization with Matplotlib & Seaborn'],
        practiceLink: '/dashboard/compiler',
        practiceLabel: 'Run Python Code'
      },
      {
        title: 'Step 2: Classical Machine Learning & Feature Engineering',
        duration: 'Weeks 5-9',
        topics: ['Supervised Learning: Linear Regression, Logistic Regression', 'Decision Trees, Random Forests, XGBoost', 'Model evaluation: Precision, Recall, ROC-AUC, F1-Score', 'Cross-validation, Hyperparameter tuning with GridSearch'],
        practiceLink: '/dashboard/projects',
        practiceLabel: 'View ML Project Ideas'
      },
      {
        title: 'Step 3: Neural Networks & Deep Learning Intro',
        duration: 'Weeks 10-13',
        topics: ['Perceptrons, Multilayer Perceptrons (MLP)', 'Loss functions, Backpropagation, Gradient Descent', 'Convolutional Neural Networks (CNN) for image tasks', 'Transfer learning fundamentals'],
        practiceLink: '/dashboard/projects',
        practiceLabel: 'Build Deep Learning App'
      },
      {
        title: 'Step 4: GenAI & Applied LLM Systems',
        duration: 'Weeks 14-16',
        topics: ['Embeddings, Vector Databases & RAG pipelines', 'Prompt Engineering & Function Calling with Gemini/OpenAI', 'Deploying ML models as REST APIs using FastAPI', 'Portfolio showcase with Streamlit or React frontend'],
        practiceLink: '/dashboard/career',
        practiceLabel: 'Explore AI Roles'
      }
    ]
  },
  {
    id: 'devops-cloud',
    title: 'Cloud Computing & DevOps Engineering',
    subtitle: 'Infrastructure as Code, CI/CD, Containerization & Microservices',
    category: 'Cloud Infrastructure',
    badge: 'Industry Essential',
    difficulty: 'Advanced',
    duration: '10 Weeks',
    icon: Database,
    accent: 'amber',
    description: 'Learn Linux internals, Docker containers, Kubernetes orchestration, automated GitHub Actions CI/CD workflows, and AWS cloud basics.',
    skills: ['Linux Shell', 'Git Workflows', 'Docker', 'Kubernetes', 'CI/CD Pipelines', 'AWS / Cloud', 'Monitoring'],
    milestones: [
      {
        title: 'Phase 1: Linux Administration & Shell Scripting',
        duration: 'Weeks 1-2',
        topics: ['File systems, permissions, process management', 'Bash scripting for automated tasks', 'Networking fundamentals: DNS, TCP/IP, SSH keys', 'Git branching workflows & merge strategies'],
        practiceLink: '/dashboard/compiler',
        practiceLabel: 'Shell Practice'
      },
      {
        title: 'Phase 2: Containerization with Docker',
        duration: 'Weeks 3-5',
        topics: ['Docker engine architecture & image layers', 'Writing production-ready multi-stage Dockerfiles', 'Docker Compose for multi-container microservices', 'Volume management, networking & container security'],
        practiceLink: '/dashboard/projects',
        practiceLabel: 'Build Microservice'
      },
      {
        title: 'Phase 3: CI/CD Pipelines & Cloud Deployment',
        duration: 'Weeks 6-8',
        topics: ['Continuous Integration with GitHub Actions', 'Automated testing and linting triggers', 'Cloud hosting: EC2, S3, RDS, CloudFront', 'Environment secret rotation and secure config management'],
        practiceLink: '/dashboard/career/resume-maker',
        practiceLabel: 'Add to Resume'
      },
      {
        title: 'Phase 4: Kubernetes & Observability',
        duration: 'Weeks 9-10',
        topics: ['Pods, Deployments, ReplicaSets & Services', 'Ingress controllers & TLS certificates', 'Health checks, auto-scaling & rolling updates', 'Logging & monitoring principles (Prometheus/Grafana)'],
        practiceLink: '/dashboard/tests',
        practiceLabel: 'Test DevOps Skills'
      }
    ]
  }
];

export default function LearningPath() {
  const [selectedPath, setSelectedPath] = useState<string>(LEARNING_PATHS[0].id);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('codeskill_learning_path_progress');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const activePath = LEARNING_PATHS.find(p => p.id === selectedPath) || LEARNING_PATHS[0];

  const toggleStep = (stepKey: string) => {
    setCompletedSteps(prev => {
      const updated = { ...prev, [stepKey]: !prev[stepKey] };
      localStorage.setItem('codeskill_learning_path_progress', JSON.stringify(updated));
      return updated;
    });
  };

  const getProgress = (pathId: string) => {
    const path = LEARNING_PATHS.find(p => p.id === pathId);
    if (!path) return 0;
    const total = path.milestones.length;
    let completed = 0;
    path.milestones.forEach((_, idx) => {
      if (completedSteps[`${pathId}-${idx}`]) completed++;
    });
    return Math.round((completed / total) * 100);
  };

  return (
    <div className="w-full space-y-8 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-emerald-500/5 p-8 md:p-12 rounded-[2rem] border border-primary/20 shadow-sm">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wide uppercase">
              <Compass className="w-4 h-4" />
              <span>Structured Tech Roadmaps</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-text-primary dark:text-white tracking-tight leading-tight">
              Learning <span className="text-primary">Paths</span>
            </h1>

            <p className="text-text-secondary dark:text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">
              Follow curated, phase-by-phase curriculums designed to take you from core fundamentals to job-ready engineering competence. Track your milestone completion step-by-step.
            </p>
          </div>

          <div className="hidden lg:flex items-center justify-center relative w-52 h-52 shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-emerald-500/20 rounded-[2rem] transform rotate-6 animate-pulse" />
            <div className="absolute inset-0 bg-surface dark:bg-slate-800 rounded-[2rem] border border-border shadow-xl transform -rotate-3 flex flex-col items-center justify-center p-6 transition-transform hover:rotate-0 duration-500">
              <Compass className="w-16 h-16 text-primary mb-2" />
              <span className="text-xs font-bold uppercase tracking-wider text-text-primary">Zero to Hero</span>
            </div>
          </div>
        </div>
      </div>

      {/* Path Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {LEARNING_PATHS.map((path) => {
          const isSelected = path.id === selectedPath;
          const progress = getProgress(path.id);
          const Icon = path.icon;

          return (
            <button
              key={path.id}
              onClick={() => setSelectedPath(path.id)}
              className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-sm ring-2 ring-primary -translate-y-1'
                  : 'border-border dark:border-border/80 hover:border-primary/40 bg-surface dark:bg-slate-900/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-text-muted">
                    {path.duration}
                  </span>
                </div>

                <h3 className={`font-bold text-base leading-snug mb-1 ${
                  isSelected ? 'text-primary' : 'text-text-primary dark:text-white'
                }`}>
                  {path.title}
                </h3>

                <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                  {path.subtitle}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border/60">
                <div className="flex items-center justify-between text-xs text-text-muted font-medium mb-1.5">
                  <span>Progress</span>
                  <span className="font-bold text-primary">{progress}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Roadmap Details */}
      <div className="bg-surface dark:bg-slate-900 rounded-3xl border border-border dark:border-border shadow-sm p-6 sm:p-8 space-y-8">
        {/* Path Summary Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/80">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                {activePath.category}
              </span>
              <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-text-secondary dark:text-slate-300">
                Level: {activePath.difficulty}
              </span>
              <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                {activePath.badge}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-text-primary dark:text-white">
              {activePath.title}
            </h2>
            <p className="text-sm sm:text-base text-text-secondary dark:text-slate-300 max-w-3xl leading-relaxed">
              {activePath.description}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-background dark:bg-slate-800/80 p-4 rounded-2xl border border-border shrink-0">
            <div>
              <div className="text-xs uppercase tracking-wider text-text-muted font-bold">Track Duration</div>
              <div className="text-xl font-black text-primary">{activePath.duration}</div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <div className="text-xs uppercase tracking-wider text-text-muted font-bold">Milestones</div>
              <div className="text-xl font-black text-text-primary dark:text-white">{activePath.milestones.length} Phases</div>
            </div>
          </div>
        </div>

        {/* Skills Gained */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Key Skills & Technologies Covered</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {activePath.skills.map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-background dark:bg-slate-800 text-text-primary dark:text-slate-200 border border-border dark:border-slate-700 shadow-2xs"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Milestones Stepper */}
        <div className="space-y-6 pt-4">
          <h3 className="text-lg sm:text-xl font-black text-text-primary dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            <span>Step-by-Step Curriculum</span>
          </h3>

          <div className="space-y-4">
            {activePath.milestones.map((milestone, index) => {
              const stepKey = `${activePath.id}-${index}`;
              const isDone = !!completedSteps[stepKey];

              return (
                <div
                  key={index}
                  className={`p-5 sm:p-6 rounded-2xl border transition-all ${
                    isDone
                      ? 'border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/10'
                      : 'border-border dark:border-border/80 bg-background/50 dark:bg-slate-800/30'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {/* Checkbox Button */}
                      <button
                        onClick={() => toggleStep(stepKey)}
                        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                          isDone
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                            : 'border-2 border-slate-300 dark:border-slate-600 hover:border-primary text-transparent'
                        }`}
                        title={isDone ? 'Mark as Incomplete' : 'Mark as Completed'}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>

                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-primary/10 text-primary">
                            {milestone.duration}
                          </span>
                          <h4 className={`text-base sm:text-lg font-bold ${
                            isDone ? 'line-through text-text-muted' : 'text-text-primary dark:text-white'
                          }`}>
                            {milestone.title}
                          </h4>
                        </div>

                        {/* Topics Bullets */}
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                          {milestone.topics.map((topic, tIdx) => (
                            <li key={tIdx} className="flex items-start gap-2 text-xs sm:text-sm text-text-secondary dark:text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2" />
                              <span>{topic}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Action link */}
                    {milestone.practiceLink && (
                      <Link
                        to={milestone.practiceLink}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-primary text-white shadow-xs hover:bg-primary-hover transition-colors shrink-0 self-start sm:self-auto"
                      >
                        <span>{milestone.practiceLabel || 'Start Practice'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

