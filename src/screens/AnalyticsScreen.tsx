import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SimpleChart } from '../components/SimpleChart';
import { useSearchStore } from '../state/searchStore';
import { cn } from '../utils/cn';

export function AnalyticsScreen() {
  const { analytics, searchHistory } = useSearchStore();
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('week');

  const periods = [
    { key: 'day', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
  ] as const;

  const getAnalyticsCards = () => [
    {
      title: 'Total Searches',
      value: analytics.totalSearches.toString(),
      change: '+12%',
      changeType: 'positive' as const,
      icon: 'search' as const,
      color: 'bg-blue-500'
    },
    {
      title: 'Avg Results/Search',
      value: analytics.averageResultsPerSearch.toFixed(1),
      change: '+5%',
      changeType: 'positive' as const,
      icon: 'bar-chart' as const,
      color: 'bg-green-500'
    },
    {
      title: 'Analysis Time',
      value: `${Math.round(analytics.timeSpentAnalyzing / 60)}m`,
      change: '-8%',
      changeType: 'negative' as const,
      icon: 'time' as const,
      color: 'bg-purple-500'
    },
    {
      title: 'Accuracy Score',
      value: `${analytics.accuracyRatings.length > 0 ? 
        Math.round(analytics.accuracyRatings.reduce((a, b) => a + b, 0) / analytics.accuracyRatings.length) : 87}%`,
      change: '+3%',
      changeType: 'positive' as const,
      icon: 'checkmark-circle' as const,
      color: 'bg-orange-500'
    }
  ];

  const getTopQueries = () => {
    const queryCount = searchHistory.reduce((acc, search) => {
      acc[search.query] = (acc[search.query] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(queryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([query, count]) => ({ query, count }));
  };

  const getCategoryInsights = () => {
    const totalSearches = Object.values(analytics.searchesByCategory).reduce((a, b) => a + b, 0);
    
    return Object.entries(analytics.searchesByCategory)
      .filter(([, count]) => count > 0)
      .map(([category, count]) => ({
        category: category.replace('_', ' ').toUpperCase(),
        count,
        percentage: totalSearches > 0 ? Math.round((count / totalSearches) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            Analytics Dashboard
          </Text>
          <Pressable className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
            <Ionicons name="download" size={20} color="#6B7280" />
          </Pressable>
        </View>

        {/* Period Selector */}
        <View className="flex-row bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {periods.map(period => (
            <Pressable
              key={period.key}
              onPress={() => setSelectedPeriod(period.key)}
              className={cn(
                "flex-1 py-2 px-4 rounded-md",
                selectedPeriod === period.key
                  ? "bg-white dark:bg-gray-600 shadow-sm"
                  : ""
              )}
            >
              <Text
                className={cn(
                  "text-center text-sm font-medium",
                  selectedPeriod === period.key
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-600 dark:text-gray-400"
                )}
              >
                {period.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Metrics Cards */}
        <View className="px-6 py-4">
          <View className="flex-row flex-wrap -mx-2">
            {getAnalyticsCards().map((card, index) => (
              <View key={index} className="w-1/2 px-2 mb-4">
                <View className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <View className="flex-row items-center justify-between mb-2">
                    <View className={cn("w-8 h-8 rounded-lg items-center justify-center", card.color)}>
                      <Ionicons name={card.icon} size={16} color="white" />
                    </View>
                    <Text
                      className={cn(
                        "text-xs font-medium",
                        card.changeType === 'positive' 
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      )}
                    >
                      {card.change}
                    </Text>
                  </View>
                  <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {card.value}
                  </Text>
                  <Text className="text-sm text-gray-500 dark:text-gray-400">
                    {card.title}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Charts Section */}
        <View className="px-6">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Search Analytics
          </Text>

          {/* Search by Category Chart */}
          <View className="mb-6">
            <Text className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
              Searches by Category
            </Text>
            <SimpleChart data={analytics} type="category" />
          </View>

          {/* Search Trends Chart */}
          <View className="mb-6">
            <Text className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Trends
            </Text>
            <SimpleChart data={analytics} type="trends" />
          </View>

          {/* Source Distribution Chart */}
          <View className="mb-6">
            <Text className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
              Source Distribution
            </Text>
            <SimpleChart data={analytics} type="sources" />
          </View>

          {/* Performance Metrics Chart */}
          <View className="mb-6">
            <Text className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
              Performance Metrics
            </Text>
            <SimpleChart data={analytics} type="performance" />
          </View>
        </View>

        {/* Insights Section */}
        <View className="px-6 pb-6">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Insights & Trends
          </Text>

          {/* Top Queries */}
          <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 border border-gray-200 dark:border-gray-700">
            <Text className="text-base font-medium text-gray-900 dark:text-white mb-3">
              Top Search Queries
            </Text>
            {getTopQueries().length > 0 ? (
              getTopQueries().map((item, index) => (
                <View key={index} className="flex-row items-center justify-between py-2">
                  <View className="flex-1">
                    <Text className="text-gray-900 dark:text-white font-medium">
                      {item.query}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-sm text-gray-500 dark:text-gray-400 mr-2">
                      {item.count} searches
                    </Text>
                    <View className="w-12 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                      <View 
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ width: `${(item.count / Math.max(...getTopQueries().map(q => q.count))) * 100}%` }}
                      />
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <Text className="text-gray-500 dark:text-gray-400 text-center py-4">
                No search data available
              </Text>
            )}
          </View>

          {/* Category Breakdown */}
          <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 border border-gray-200 dark:border-gray-700">
            <Text className="text-base font-medium text-gray-900 dark:text-white mb-3">
              Research Categories
            </Text>
            {getCategoryInsights().length > 0 ? (
              getCategoryInsights().map((item, index) => (
                <View key={index} className="flex-row items-center justify-between py-2">
                  <Text className="text-gray-900 dark:text-white font-medium">
                    {item.category}
                  </Text>
                  <View className="flex-row items-center">
                    <Text className="text-sm text-gray-500 dark:text-gray-400 mr-2">
                      {item.percentage}%
                    </Text>
                    <Text className="text-xs text-gray-400">
                      ({item.count})
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text className="text-gray-500 dark:text-gray-400 text-center py-4">
                No category data available
              </Text>
            )}
          </View>

          {/* AI Insights */}
          <View className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <View className="flex-row items-center mb-3">
              <Ionicons name="bulb" size={20} color="#3B82F6" />
              <Text className="text-base font-medium text-blue-900 dark:text-blue-100 ml-2">
                AI Insights
              </Text>
            </View>
            <View className="space-y-2">
              <Text className="text-sm text-blue-800 dark:text-blue-200">
                • Your search patterns show a strong focus on data mining and analytics tools
              </Text>
              <Text className="text-sm text-blue-800 dark:text-blue-200">
                • Consider exploring competitive intelligence platforms for deeper insights
              </Text>
              <Text className="text-sm text-blue-800 dark:text-blue-200">
                • Peak search activity occurs on weekdays, suggesting professional research usage
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}