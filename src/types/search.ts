export interface SearchQuery {
  id: string;
  query: string;
  filters: SearchFilters;
  timestamp: number;
  category: SearchCategory;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface SearchFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  sources?: string[];
  language?: string;
  contentType?: 'articles' | 'research' | 'news' | 'academic' | 'social' | 'all';
  depth?: 'surface' | 'deep' | 'comprehensive';
  domains?: string[];
  excludeDomains?: string[];
}

export interface SearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
  source: string;
  timestamp: number;
  relevanceScore: number;
  category: string;
  metadata: {
    author?: string;
    publishDate?: string;
    readingTime?: number;
    credibilityScore?: number;
    sentiment?: 'positive' | 'negative' | 'neutral';
  };
  tags: string[];
  analyzed: boolean;
  analysis?: SearchAnalysis;
}

export interface SearchAnalysis {
  summary: string;
  keyPoints: string[];
  entities: string[];
  topics: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  credibilityAssessment: string;
  biasDetection?: string;
  factualAccuracy?: number;
}

export interface SearchReport {
  id: string;
  title: string;
  queries: string[];
  results: SearchResult[];
  analysis: {
    totalSources: number;
    averageCredibility: number;
    sentimentDistribution: Record<string, number>;
    topTopics: string[];
    keyInsights: string[];
    recommendations: string[];
  };
  createdAt: number;
  updatedAt: number;
}

export interface AnalyticsData {
  totalSearches: number;
  searchesByCategory: Record<SearchCategory, number>;
  averageResultsPerSearch: number;
  topQueries: string[];
  sourceDistribution: Record<string, number>;
  timeSpentAnalyzing: number;
  accuracyRatings: number[];
}

export type SearchCategory = 
  | 'market_research' 
  | 'competitive_analysis' 
  | 'academic_research' 
  | 'news_monitoring' 
  | 'trend_analysis' 
  | 'fact_checking' 
  | 'investigation' 
  | 'general';

export interface SearchState {
  // Current search
  currentQuery: string;
  currentFilters: SearchFilters;
  isSearching: boolean;
  
  // Results
  results: SearchResult[];
  selectedResults: string[];
  
  // History
  searchHistory: SearchQuery[];
  
  // Reports
  reports: SearchReport[];
  activeReport: SearchReport | null;
  
  // Analytics
  analytics: AnalyticsData;
  
  // UI State
  activeTab: 'search' | 'results' | 'analytics' | 'reports';
  viewMode: 'list' | 'grid' | 'detailed';
}