import React, { useState } from 'react';
import { View, ScrollView, Text, Pressable, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SearchBar } from '../components/SearchBar';
import { SearchFilters } from '../components/SearchFilters';
import { SearchResultCard } from '../components/SearchResultCard';
import { DiagnosticModal } from '../components/DiagnosticModal';
import { useSearchStore } from '../state/searchStore';
import { searchService } from '../api/search-service';
import { SearchQuery, SearchCategory } from '../types/search';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '../utils/cn';
import { testSearch } from '../utils/searchTest';
import { testSearchFixes } from '../utils/test-search-fix';

export function SearchScreen() {
  const {
    currentQuery,
    currentFilters,
    isSearching,
    results,
    selectedResults,
    setIsSearching,
    setResults,
    addToHistory,
    recordSearch,
    createReport,
    clearSelectedResults,
    setActiveTab,
    generateSmartSuggestions,
    generateAdvancedReport
  } = useSearchStore();

  const [showFilters, setShowFilters] = useState(false);
  const [searchCategory, setSearchCategory] = useState<SearchCategory>('general');
  const [smartSuggestions, setSmartSuggestions] = useState<string[]>([]);
  const [showSmartSuggestions, setShowSmartSuggestions] = useState(false);
  const [aiStatus, setAiStatus] = useState<'available' | 'limited' | 'unavailable'>('available');
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  const categories: Array<{ key: SearchCategory; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
    { key: 'market_research', label: 'Market Research', icon: 'bar-chart' },
    { key: 'competitive_analysis', label: 'Competitive Analysis', icon: 'analytics' },
    { key: 'academic_research', label: 'Academic Research', icon: 'school' },
    { key: 'news_monitoring', label: 'News Monitoring', icon: 'newspaper' },
    { key: 'trend_analysis', label: 'Trend Analysis', icon: 'trending-up' },
    { key: 'fact_checking', label: 'Fact Checking', icon: 'checkmark-circle' },
    { key: 'investigation', label: 'Investigation', icon: 'search' },
    { key: 'general', label: 'General', icon: 'globe' },
  ];

  const performSearch = async (query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const searchQuery: SearchQuery = {
        id: uuidv4(),
        query: query.trim(),
        filters: currentFilters,
        timestamp: Date.now(),
        category: searchCategory,
        priority: 'medium'
      };

      // Add to history
      addToHistory(searchQuery);
      recordSearch(searchCategory);

      // Perform search
      const searchResults = await searchService.search({
        query: query.trim(),
        filters: currentFilters,
        maxResults: 20
      });

      // Validate search results
      if (!Array.isArray(searchResults)) {
        throw new Error('Invalid search results format');
      }

      setResults(searchResults);
      
      if (searchResults.length === 0) {
        Alert.alert(
          'No Results Found',
          'Try adjusting your search terms or filters for better results.',
          [{ text: 'OK' }]
        );
      } else {
        // Switch to results tab
        setActiveTab('results');
        // Reset AI status on successful search
        setAiStatus('available');
        
        // Show success message if AI features are limited
        if (aiStatus === 'limited') {
          Alert.alert(
            'Search Completed',
            `Found ${searchResults.length} results using enhanced fallback search.`,
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('Search failed:', error);
      
      // Try to provide fallback results even when search fails
      try {
        console.log('Attempting fallback search...');
        const fallbackResults = await searchService.search({
          query: 'data mining tools research intelligence',
          filters: currentFilters,
          maxResults: 5
        });
        
        if (Array.isArray(fallbackResults) && fallbackResults.length > 0) {
          setResults(fallbackResults);
          setAiStatus('limited');
          Alert.alert(
            'Limited Search Results',
            `Search encountered issues but found ${fallbackResults.length} fallback results. AI features are currently limited.`,
            [{ text: 'OK' }]
          );
          return;
        }
      } catch (fallbackError) {
        console.error('Fallback search also failed:', fallbackError);
      }
      
      // Check if it's an AI-related error
      if (error.message?.includes('429') || error.message?.includes('credits')) {
        setAiStatus('limited');
        Alert.alert(
          'AI Services Limited',
          'AI features are currently limited due to high demand. Please try the suggested searches below or try again later.',
          [{ text: 'OK' }]
        );
      } else if (error.message?.includes('map') || error.message?.includes('undefined')) {
        setAiStatus('limited');
        Alert.alert(
          'Search Service Issue',
          'There was a technical issue with the search service. Please try one of the suggested searches below.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Search Failed',
          'There was an error performing your search. Please check your connection and try again.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsSearching(false);
    }
  };

  const createReportFromSelected = () => {
    if (selectedResults.length === 0) {
      Alert.alert(
        'No Results Selected',
        'Please select some search results to create a report.',
        [{ text: 'OK' }]
      );
      return;
    }

    const selectedResultObjects = results.filter(r => selectedResults.includes(r.id));
    const reportTitle = `${currentQuery} - Research Report`;
    
    createReport(reportTitle, [currentQuery], selectedResultObjects);
    clearSelectedResults();
    
    Alert.alert(
      'Report Created',
      'Your research report has been created successfully.',
      [
        { text: 'Continue Searching', style: 'cancel' },
        { text: 'View Report', onPress: () => setActiveTab('reports') }
      ]
    );
  };

  const loadSmartSuggestions = async () => {
    if (results.length === 0) return;
    
    try {
      const suggestions = await generateSmartSuggestions(currentQuery, results);
      setSmartSuggestions(suggestions);
      setShowSmartSuggestions(true);
    } catch (error) {
      console.error('Failed to load smart suggestions:', error);
    }
  };

  const createAIReport = async () => {
    if (results.length === 0) {
      Alert.alert('No Results', 'Please perform a search first to generate an AI report.');
      return;
    }

    try {
      await generateAdvancedReport(currentQuery, results);
      Alert.alert(
        'AI Report Generated',
        'Your comprehensive AI-powered research report has been created.',
        [
          { text: 'Continue Searching', style: 'cancel' },
          { text: 'View Report', onPress: () => setActiveTab('reports') }
        ]
      );
    } catch (error) {
      console.error('Failed to create AI report:', error);
      Alert.alert('Error', 'Failed to generate AI report. Please try again.');
    }
  };

  const runSearchTest = async () => {
    try {
      const success = await testSearch();
      const apiStatus = searchService.getApiStatus();
      const workingApis = apiStatus.summary.workingApis.join(', ');
      const failedApis = apiStatus.summary.failedApis.join(', ');
      
      const statusMessage = `Search test: ${success ? 'SUCCESS' : 'FAILED'}\n\n` +
        `Working APIs: ${workingApis || 'None'}\n` +
        `Failed APIs: ${failedApis || 'None'}\n\n` +
        'Check console for detailed logs.';
      
      Alert.alert('Search Test Results', statusMessage, [{ text: 'OK' }]);
    } catch (error) {
      Alert.alert('Test Error', 'Failed to run search test.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">
              Intelligence Search
            </Text>
            {aiStatus === 'limited' && (
              <Pressable 
                onPress={() => setShowDiagnostics(true)}
                className="flex-row items-center mt-1"
              >
                <Ionicons name="warning" size={14} color="#F59E0B" />
                <Text className="text-xs text-yellow-600 dark:text-yellow-400 ml-1 underline">
                  AI features limited - tap for diagnostics
                </Text>
              </Pressable>
            )}
          </View>
          <View className="flex-row space-x-2">
            {__DEV__ && (
              <>
                <Pressable
                  onPress={runSearchTest}
                  className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20"
                  accessibilityLabel="Run search test"
                >
                  <Ionicons name="bug" size={20} color="#F97316" />
                </Pressable>
                <Pressable
                  onPress={() => testSearchFixes()}
                  className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20"
                  accessibilityLabel="Test search fixes"
                >
                  <Ionicons name="flask" size={20} color="#10B981" />
                </Pressable>
              </>
            )}
            <Pressable
              onPress={() => setActiveTab('analytics')}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"
            >
              <Ionicons name="stats-chart" size={20} color="#6B7280" />
            </Pressable>
          </View>
        </View>

        <SearchBar onSearch={performSearch} className="mb-4" />

        {/* Category Selection */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="mb-4"
        >
          <View className="flex-row space-x-2">
            {categories.map(category => (
              <Pressable
                key={category.key}
                onPress={() => setSearchCategory(category.key)}
                className={cn(
                  "flex-row items-center px-4 py-2 rounded-full border mr-2",
                  searchCategory === category.key
                    ? "bg-blue-600 border-blue-600"
                    : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                )}
              >
                <Ionicons 
                  name={category.icon} 
                  size={16} 
                  color={searchCategory === category.key ? 'white' : '#6B7280'} 
                />
                <Text
                  className={cn(
                    "ml-2 text-sm font-medium",
                    searchCategory === category.key
                      ? "text-white"
                      : "text-gray-700 dark:text-gray-300"
                  )}
                >
                  {category.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => setShowFilters(true)}
            className="flex-row items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
          >
            <Ionicons name="options" size={16} color="#6B7280" />
            <Text className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Filters
            </Text>
          </Pressable>

          <View className="flex-row space-x-2">
            {results.length > 0 && (
              <Pressable
                onPress={loadSmartSuggestions}
                className="flex-row items-center px-3 py-2 bg-purple-600 rounded-lg"
              >
                <Ionicons name="bulb" size={16} color="white" />
                <Text className="ml-2 text-sm font-medium text-white">
                  AI Insights
                </Text>
              </Pressable>
            )}
            
            {results.length > 0 && (
              <Pressable
                onPress={createAIReport}
                className="flex-row items-center px-3 py-2 bg-green-600 rounded-lg"
              >
                <Ionicons name="analytics" size={16} color="white" />
                <Text className="ml-2 text-sm font-medium text-white">
                  AI Report
                </Text>
              </Pressable>
            )}

            {selectedResults.length > 0 && (
              <Pressable
                onPress={createReportFromSelected}
                className="flex-row items-center px-3 py-2 bg-blue-600 rounded-lg"
              >
                <Ionicons name="document-text" size={16} color="white" />
                <Text className="ml-2 text-sm font-medium text-white">
                  Report ({selectedResults.length})
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-6 py-4">
        {isSearching ? (
          <View className="items-center justify-center py-12">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="text-gray-600 dark:text-gray-400 mt-4 text-center">
              Searching the deep web for insights...
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-500 mt-2 text-center">
              Analyzing data sources and mining relevant information
            </Text>
          </View>
        ) : results.length > 0 ? (
          <>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                Search Results ({results.length})
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                {currentQuery}
              </Text>
            </View>
            
            {results.map(result => (
              <SearchResultCard
                key={result.id}
                result={result}
                showSelection={true}
                onPress={() => {
                  // Handle result press - could open web view or detailed view
                }}
              />
            ))}
          </>
        ) : (
          <View>
            {/* Smart AI Suggestions */}
            {showSmartSuggestions && smartSuggestions.length > 0 && (
              <View className="mb-6">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                    🤖 AI-Powered Research Suggestions
                  </Text>
                  <Pressable
                    onPress={() => setShowSmartSuggestions(false)}
                    className="p-1"
                  >
                    <Ionicons name="close" size={20} color="#6B7280" />
                  </Pressable>
                </View>
                {smartSuggestions.map((suggestion, index) => (
                  <Pressable
                    key={index}
                    onPress={() => performSearch(suggestion)}
                    className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mb-2 border border-purple-200 dark:border-purple-800"
                  >
                    <Text className="text-purple-800 dark:text-purple-200 font-medium">
                      {suggestion}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
            
            <View className="items-center justify-center py-16">
            <Ionicons name="search" size={64} color="#D1D5DB" />
            <Text className="text-xl font-semibold text-gray-600 dark:text-gray-400 mt-4 text-center">
              Advanced Research Engine
            </Text>
            <Text className="text-gray-500 dark:text-gray-500 mt-2 text-center px-8">
              Search across deep web sources, academic databases, and specialized research platforms
            </Text>
            
            <View className="mt-8 space-y-3">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                Quick Search Suggestions:
              </Text>
              {[
                'data mining tools 2025',
                'competitive intelligence platforms',
                'web scraping frameworks',
                'business analytics software'
              ].map((suggestion, index) => (
                <Pressable
                  key={index}
                  onPress={() => performSearch(suggestion)}
                  className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg mx-4"
                >
                  <Text className="text-blue-700 dark:text-blue-300 text-center">
                    {suggestion}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
        )}
      </ScrollView>

      <SearchFilters
        visible={showFilters}
        onClose={() => setShowFilters(false)}
      />

      <DiagnosticModal
        visible={showDiagnostics}
        onClose={() => setShowDiagnostics(false)}
      />
    </SafeAreaView>
  );
}