// Content schema definitions for the portfolio application

export interface HeroContent {
  title: string;
  subtitle: string;
  description: string;
  cta: {
    text: string;
    url: string;
  };
  backgroundGradient: 'blue_purple' | 'blue_indigo' | 'purple_pink' | 'minimal';
  metrics: Array<{
    label: string;
    value: string;
    icon: 'sparkles' | 'trending' | 'award' | 'users' | 'target' | 'dollar' | 'star' | 'crown';
    color: 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'red';
  }>;
  cards: Array<{
    title: string;
    description: string;
    icon: 'sparkles' | 'trending' | 'award' | 'users' | 'target' | 'dollar' | 'star' | 'crown';
    color: 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'red';
  }>;
}

export interface AboutContent {
  title: string;
  description: string;
  highlights: string[];
}

export interface SkillsContent {
  title: string;
  description: string;
  categories: Array<{
    name: string;
    skills: string[];
  }>;
}

export interface TimelineContent {
  title: string;
  description: string;
  events: Array<{
    year: string;
    title: string;
    description: string;
    company?: string;
  }>;
}

export interface ContactContent {
  title: string;
  description: string;
  email: string;
  social: Array<{
    platform: string;
    url: string;
    icon: string;
  }>;
}