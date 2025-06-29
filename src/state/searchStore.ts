import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SearchState, SearchQuery, SearchResult, SearchFilters, SearchReport, SearchCategory, AnalyticsData } from '../types/search';
import { searchService } from '../api/search-service';
import { v4 as uuidv4 } from 'uuid';

interface SearchStore extends SearchState {
  // Actions
  setCurrentQuery: (query: string) => void;
  setCurrentFilters: (filters: Partial<SearchFilters>) => void;
  setIsSearching: (isSearching: boolean) => void;
  
  // Results actions
  setResults: (results: SearchResult[]) => void;
  addResult: (result: SearchResult) => void;
  toggleResultSelection: (resultId: string) => void;
  clearSelectedResults: () => void;
  analyzeResult: (resultId: string, analysis: any) => void;
  
  // History actions
  addToHistory: (query: SearchQuery) => void;
  clearHistory: () => void;
  
  // Report actions
  createReport: (title: string, queries: string[], results: SearchResult[]) => void;
  updateReport: (reportId: string, updates: Partial<SearchReport>) => void;
  deleteReport: (reportId: string) => void;
  setActiveReport: (report: SearchReport | null) => void;
  
  // Analytics actions
  updateAnalytics: (data: Partial<AnalyticsData>) => void;
  recordSearch: (category: SearchCategory) => void;
  
  // UI actions
  setActiveTab: (tab: 'search' | 'results' | 'analytics' | 'reports') => void;
  setViewMode: (mode: 'list' | 'grid' | 'detailed') => void;
  
  // AI-powered actions
  generateInsights: (results: SearchResult[]) => Promise<void>;
  generateSmartSuggestions: (query: string, results: SearchResult[]) => Promise<string[]>;
  generateAdvancedReport: (query: string, results: SearchResult[]) => Promise<void>;
  
  // Utility actions
  reset: () => void;
}

const defaultAnalytics: AnalyticsData = {
  totalSearches: 0,
  searchesByCategory: {
    market_research: 0,
    competitive_analysis: 0,
    academic_research: 0,
    news_monitoring: 0,
    trend_analysis: 0,
    fact_checking: 0,
    investigation: 0,
    general: 0,
  },
  averageResultsPerSearch: 0,
  topQueries: [],
  sourceDistribution: {},
  timeSpentAnalyzing: 0,
  accuracyRatings: [],
};

const defaultFilters: SearchFilters = {
  contentType: 'all',
  depth: 'deep',
  language: 'en',
  sources: [],
  domains: [],
  excludeDomains: [],
};

export const useSearchStore = create<SearchStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentQuery: '',
      currentFilters: defaultFilters,
      isSearching: false,
      results: [],
      selectedResults: [],
      searchHistory: [],
      reports: [],
      activeReport: null,
      analytics: defaultAnalytics,
      activeTab: 'search',
      viewMode: 'list',

      // Query actions
      setCurrentQuery: (query: string) => set({ currentQuery: query }),
      
      setCurrentFilters: (filters: Partial<SearchFilters>) =>
        set(state => ({
          currentFilters: { ...state.currentFilters, ...filters }
        })),
      
      setIsSearching: (isSearching: boolean) => set({ isSearching }),

      // Results actions
      setResults: (results: SearchResult[]) => set({ results }),
      
      addResult: (result: SearchResult) =>
        set(state => ({
          results: [...state.results, result]
        })),
      
      toggleResultSelection: (resultId: string) =>
        set(state => ({
          selectedResults: state.selectedResults.includes(resultId)
            ? state.selectedResults.filter(id => id !== resultId)
            : [...state.selectedResults, resultId]
        })),
      
      clearSelectedResults: () => set({ selectedResults: [] }),
      
      analyzeResult: (resultId: string, analysis: any) =>
        set(state => ({
          results: state.results.map(result =>
            result.id === resultId
              ? { ...result, analyzed: true, analysis }
              : result
          )
        })),

      // History actions
      addToHistory: (query: SearchQuery) =>
        set(state => ({
          searchHistory: [query, ...state.searchHistory.slice(0, 99)] // Keep last 100
        })),
      
      clearHistory: () => set({ searchHistory: [] }),

      // Report actions
      createReport: (title: string, queries: string[], results: SearchResult[]) => {
        const report: SearchReport = {
          id: uuidv4(),
          title,
          queries,
          results,
          analysis: {
            totalSources: results.length,
            averageCredibility: results.reduce((acc, r) => acc + (r.metadata.credibilityScore || 0), 0) / results.length,
            sentimentDistribution: results.reduce((acc, r) => {
              const sentiment = r.metadata.sentiment || 'neutral';
              acc[sentiment] = (acc[sentiment] || 0) + 1;
              return acc;
            }, {} as Record<string, number>),
            topTopics: [],
            keyInsights: [],
            recommendations: [],
          },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        set(state => ({
          reports: [...state.reports, report],
          activeReport: report
        }));
      },
      
      updateReport: (reportId: string, updates: Partial<SearchReport>) =>
        set(state => ({
          reports: state.reports.map(report =>
            report.id === reportId
              ? { ...report, ...updates, updatedAt: Date.now() }
              : report
          )
        })),
      
      deleteReport: (reportId: string) =>
        set(state => ({
          reports: state.reports.filter(report => report.id !== reportId),
          activeReport: state.activeReport?.id === reportId ? null : state.activeReport
        })),
      
      setActiveReport: (report: SearchReport | null) => set({ activeReport: report }),

      // Analytics actions
      updateAnalytics: (data: Partial<AnalyticsData>) =>
        set(state => ({
          analytics: { ...state.analytics, ...data }
        })),
      
      recordSearch: (category: SearchCategory) =>
        set(state => ({
          analytics: {
            ...state.analytics,
            totalSearches: state.analytics.totalSearches + 1,
            searchesByCategory: {
              ...state.analytics.searchesByCategory,
              [category]: state.analytics.searchesByCategory[category] + 1
            }
          }
        })),

      // UI actions
      setActiveTab: (tab: 'search' | 'results' | 'analytics' | 'reports') => set({ activeTab: tab }),
      setViewMode: (mode: 'list' | 'grid' | 'detailed') => set({ viewMode: mode }),

      // AI-powered actions
      generateInsights: async (results: SearchResult[]) => {
        try {
          const insights = await searchService.generateResearchInsights(results);
          set(state => ({
            analytics: {
              ...state.analytics,
              // Store insights in analytics for display
            }
          }));
        } catch (error) {
          console.error('Failed to generate insights:', error);
        }
      },

      generateSmartSuggestions: async (query: string, results: SearchResult[]) => {
        try {
          return await searchService.generateSmartSuggestions(query, results);
        } catch (error) {
          console.error('Failed to generate smart suggestions:', error);
          return [];
        }
      },

      generateAdvancedReport: async (query: string, results: SearchResult[]) => {
        try {
          const reportData = await searchService.generateSearchReport(query, results);
          const report: SearchReport = {
            id: uuidv4(),
            title: `AI-Generated Report: ${query}`,
            queries: [query],
            results,
            analysis: {
              totalSources: results.length,
              averageCredibility: results.reduce((acc, r) => acc + (r.metadata.credibilityScore || 0), 0) / results.length,
              sentimentDistribution: results.reduce((acc, r) => {
                const sentiment = r.metadata.sentiment || 'neutral';
                acc[sentiment] = (acc[sentiment] || 0) + 1;
                return acc;
              }, {} as Record<string, number>),
              topTopics: [],
              keyInsights: reportData.keyInsights,
              recommendations: reportData.recommendations,
            },
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          
          set(state => ({
            reports: [...state.reports, report],
            activeReport: report
          }));
        } catch (error) {
          console.error('Failed to generate advanced report:', error);
        }
      },

      // Utility actions
      reset: () => set({
        currentQuery: '',
        currentFilters: defaultFilters,
        isSearching: false,
        results: [],
        selectedResults: [],
        activeTab: 'search',
        viewMode: 'list',
      }),
    }),
    {
      name: 'search-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        searchHistory: state.searchHistory,
        reports: state.reports,
        analytics: state.analytics,
      }),
    }
  )
);