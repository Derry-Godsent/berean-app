export interface Project {
  id: string;
  index: string;
  title: string;
  tagline: string;
  description: string;
  year: string;
  role: string;
  tags: string[];
  image: string;
  link: string;
}

export const projects: Project[] = [
  {
    id: "nexus",
    index: "01",
    title: "Nexus",
    tagline: "Real-time collaboration engine",
    description:
      "A CRDT-based multiplayer infrastructure that keeps 50k+ concurrent documents in sync with sub-16ms latency. Built the sync protocol, presence system and offline-first storage layer from scratch.",
    year: "2024",
    role: "Lead Engineer",
    tags: ["TypeScript", "Rust", "WebSockets", "CRDTs"],
    image: "images/project-nexus.jpg",
    link: "https://github.com",
  },
  {
    id: "forge",
    index: "02",
    title: "Forge",
    tagline: "Visual CI/CD pipeline builder",
    description:
      "A drag-and-drop pipeline composer that compiles to declarative YAML. Cut build-config time by 70% for 200+ internal teams, with a live DAG view and zero-downtime rollouts.",
    year: "2023",
    role: "Full-stack Engineer",
    tags: ["Go", "React", "gRPC", "Docker"],
    image: "images/project-forge.jpg",
    link: "https://github.com",
  },
  {
    id: "pulse",
    index: "03",
    title: "Pulse",
    tagline: "Observability platform",
    description:
      "A metrics and tracing platform rendering 1B+ events per day. Designed the query engine, the DSL, and a GPU-accelerated charting layer that streams 100k points without dropping frames.",
    year: "2023",
    role: "Frontend Architect",
    tags: ["TypeScript", "D3.js", "GraphQL", "ClickHouse"],
    image: "images/project-pulse.jpg",
    link: "https://github.com",
  },
  {
    id: "atlas",
    index: "04",
    title: "Atlas",
    tagline: "API federation gateway",
    description:
      "A schema-federated gateway unifying 30+ microservices behind a single GraphQL surface. Added request coalescing, response caching and circuit breaking — p99 dropped from 480ms to 90ms.",
    year: "2022",
    role: "Backend Engineer",
    tags: ["Node.js", "Redis", "Protobuf", "Kubernetes"],
    image: "images/project-atlas.jpg",
    link: "https://github.com",
  },
];

export interface MiniProject {
  title: string;
  description: string;
  tags: string[];
  link: string;
}

export const miniProjects: MiniProject[] = [
  {
    title: "fnkit",
    description: "Zero-dependency functional utilities for TypeScript. 4.2k stars.",
    tags: ["TypeScript", "OSS"],
    link: "https://github.com",
  },
  {
    title: "use-async",
    description: "A 2kb React hook library for race-safe data fetching.",
    tags: ["React", "Hooks"],
    link: "https://github.com",
  },
  {
    title: "lumen",
    description: "Terminal dashboard for live system metrics, written in Rust.",
    tags: ["Rust", "CLI"],
    link: "https://github.com",
  },
];

export interface ExperienceItem {
  period: string;
  role: string;
  company: string;
  type: string;
  description: string;
  current?: boolean;
}

export const experience: ExperienceItem[] = [
  {
    period: "2022 — NOW",
    role: "Senior Software Engineer",
    company: "Nova Systems",
    type: "WORK",
    description:
      "Leading the platform team of 6. Architected the real-time infrastructure powering 2M+ daily users, and drive the frontend performance guild across 4 product teams.",
    current: true,
  },
  {
    period: "2020 — 2022",
    role: "Software Engineer",
    company: "Vertex Labs",
    type: "WORK",
    description:
      "Built the CI/CD platform from first commit to 200+ teams. Owned the pipeline execution engine in Go and the visual editor in React.",
  },
  {
    period: "2018 — 2020",
    role: "Frontend Engineer",
    company: "PixelForge Studio",
    type: "WORK",
    description:
      "Shipped award-winning marketing sites and design systems for clients in fintech and AI. Obsessed over 60fps interactions and pixel-perfect builds.",
  },
  {
    period: "2014 — 2018",
    role: "B.S. Computer Science",
    company: "UC Berkeley",
    type: "EDUCATION",
    description:
      "Systems, distributed computing and graphics. TA'd CS 61B and led the open-source club.",
  },
];

export interface StackGroup {
  title: string;
  items: string[];
}

export const stack: StackGroup[] = [
  {
    title: "Frontend",
    items: ["TypeScript", "React", "Next.js", "Tailwind CSS", "Framer Motion", "WebGL / Three.js"],
  },
  {
    title: "Backend",
    items: ["Node.js", "Go", "Rust", "GraphQL", "PostgreSQL", "Redis"],
  },
  {
    title: "Infrastructure",
    items: ["AWS", "Docker", "Kubernetes", "Terraform", "Fly.io", "CI/CD"],
  },
  {
    title: "Practice",
    items: ["System Design", "Performance", "Testing", "Open Source", "DX Tooling", "Mentorship"],
  },
];

export const stats = [
  { value: 7, suffix: "+", label: "Years of experience" },
  { value: 48, suffix: "", label: "Projects shipped" },
  { value: 2, suffix: "M+", label: "Daily users served" },
  { value: 99, suffix: ".9%", label: "Uptime maintained" },
];

export const marqueeItems = [
  "React",
  "TypeScript",
  "Node.js",
  "Go",
  "Rust",
  "PostgreSQL",
  "GraphQL",
  "AWS",
  "Kubernetes",
  "Docker",
  "System Design",
  "Open Source",
];

export const email = "hello@julianvoss.dev";
