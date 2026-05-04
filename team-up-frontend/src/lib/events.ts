export interface EventDef {
  id: string;
  name: string;
  tagline: string;
  minSize: number;
  maxSize: number;
  emoji: string;
  accent: string; // tailwind utility for color tint
  description: string;
  contactName: string;
  contactPhone: string;
}

export const EVENTS: EventDef[] = [
  {
    id: "hackathon",
    name: "Hackathon",
    tagline: "Build. Ship. Win.",
    minSize: 3,
    maxSize: 4,
    emoji: "💻",
    accent: "from-indigo-500/30 to-violet-500/10",
    description: "A 24-hour coding marathon where you'll build innovative software solutions. Bring your best ideas to life and compete for top prizes. Hardware and APIs will be provided.",
    contactName: "Rahul Sharma",
    contactPhone: "+91 98765 43210",
  },
  {
    id: "ideathon",
    name: "Ideathon",
    tagline: "Pitch the next big idea.",
    minSize: 3,
    maxSize: 4,
    emoji: "💡",
    accent: "from-amber-500/30 to-orange-500/10",
    description: "An ideation competition focused on solving real-world problems. Prepare a presentation and pitch your concepts to our panel of judges. No coding required, just pure innovation.",
    contactName: "Sneha Patel",
    contactPhone: "+91 87654 32109",
  },
  {
    id: "shark_tank",
    name: "Shark Tank",
    tagline: "Convince the sharks.",
    minSize: 3,
    maxSize: 4,
    emoji: "🦈",
    accent: "from-cyan-500/30 to-blue-500/10",
    description: "Step into the tank and pitch your business model to investors. Focus on market viability, revenue models, and scalability. Secure mock-funding and win the grand prize.",
    contactName: "Amit Kumar",
    contactPhone: "+91 76543 21098",
  },
  {
    id: "nukkad_natak",
    name: "Nukkad Natak",
    tagline: "Street theatre, real impact.",
    minSize: 12,
    maxSize: 18,
    emoji: "🎭",
    accent: "from-rose-500/30 to-pink-500/10",
    description: "A traditional street play competition. Form a large group, pick a powerful social message, and perform in an open arena. Props are allowed but creativity is key.",
    contactName: "Priya Singh",
    contactPhone: "+91 65432 10987",
  },
  {
    id: "singing",
    name: "Singing",
    tagline: "Solo performance.",
    minSize: 1,
    maxSize: 1,
    emoji: "🎤",
    accent: "from-fuchsia-500/30 to-purple-500/10",
    description: "A solo vocal competition spanning multiple genres. Showcase your vocal range, stage presence, and musicality. Backing tracks or a single acoustic instrument are permitted.",
    contactName: "Rohan Desai",
    contactPhone: "+91 54321 09876",
  },
  {
    id: "dance",
    name: "Dance",
    tagline: "Move the crowd.",
    minSize: 5,
    maxSize: 7,
    emoji: "💃",
    accent: "from-emerald-500/30 to-teal-500/10",
    description: "A group dance competition. Synchronize your moves and set the stage on fire. All dance styles from classical to hip-hop are welcome. Bring your own mixed tracks.",
    contactName: "Ananya Reddy",
    contactPhone: "+91 43210 98765",
  },
];

export const getEvent = (id: string) => EVENTS.find((e) => e.id === id);
