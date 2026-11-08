import { BlogPost } from '../components/BlogsPage';
import { BLOG_POSTS_BATTERY } from './blogPostsBattery';
import { BLOG_POSTS_MAINTENANCE } from './blogPostsMaintenance';
import { BLOG_POSTS_GENERAL } from './blogPostsGeneral';

export const BLOG_CATEGORIES = [
  'All',
  '🔋 Battery & Chemistry',
  '🔧 Maintenance & Repairs',
  '⚡ Tariffs & Charging',
  '🛵 Buyer Guides',
  '📦 Gig Economy',
  '☀️ Solar & Green'
] as const;

export type BlogCategoryType = typeof BLOG_CATEGORIES[number];

// Combine all SEO blog posts in curated order
export const ALL_BLOG_POSTS: BlogPost[] = [
  ...BLOG_POSTS_GENERAL.filter(b => b.featured),
  ...BLOG_POSTS_BATTERY,
  ...BLOG_POSTS_MAINTENANCE,
  ...BLOG_POSTS_GENERAL.filter(b => !b.featured)
];

// Helper to get total count per category
export const getCategoryCount = (category: string): number => {
  if (category === 'All') return ALL_BLOG_POSTS.length;
  return ALL_BLOG_POSTS.filter(p => p.category === category).length;
};
