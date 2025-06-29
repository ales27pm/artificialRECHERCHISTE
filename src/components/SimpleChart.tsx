import React from 'react';
import { View, Text } from 'react-native';
import { AnalyticsData } from '../types/search';

interface SimpleChartProps {
  data: AnalyticsData;
  type: 'category' | 'trends' | 'sources' | 'performance';
}

export function SimpleChart({ data, type }: SimpleChartProps) {
  const renderCategoryChart = () => {
    const categoryData = Object.entries(data.searchesByCategory)
      .filter(([_, count]) => count > 0)
      .sort(([, a], [, b]) => b - a);

    if (categoryData.length === 0) {
      return (
        <View className="items-center justify-center py-8">
          <Text className="text-gray-500 dark:text-gray-400">No search data available</Text>
        </View>
      );
    }

    const maxCount = Math.max(...categoryData.map(([, count]) => count));

    return (
      <View className="space-y-3">
        {categoryData.map(([category, count]) => (
          <View key={category} className="space-y-1">
            <View className="flex-row justify-between items-center">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {category.replace('_', ' ').toUpperCase()}
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                {count}
              </Text>
            </View>
            <View className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
              <View 
                className="h-2 bg-blue-500 rounded-full"
                style={{ width: `${(count / maxCount) * 100}%` }}
              />
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderTrendsChart = () => {
    const trendData = [
      { label: "Mon", value: 15 },
      { label: "Tue", value: 23 },
      { label: "Wed", value: 18 },
      { label: "Thu", value: 31 },
      { label: "Fri", value: 25 },
      { label: "Sat", value: 12 },
      { label: "Sun", value: 8 }
    ];

    const maxValue = Math.max(...trendData.map(d => d.value));

    return (
      <View>
        <View className="flex-row items-end justify-between h-32 mb-2">
          {trendData.map((item, index) => (
            <View key={index} className="flex-1 items-center">
              <View 
                className="w-6 bg-green-500 rounded-t"
                style={{ height: (item.value / maxValue) * 100 }}
              />
            </View>
          ))}
        </View>
        <View className="flex-row justify-between">
          {trendData.map((item, index) => (
            <Text key={index} className="text-xs text-gray-500 dark:text-gray-400 flex-1 text-center">
              {item.label}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  const renderSourcesChart = () => {
    const sourceData = Object.entries(data.sourceDistribution)
      .slice(0, 6)
      .sort(([, a], [, b]) => b - a);

    if (sourceData.length === 0) {
      return (
        <View className="items-center justify-center py-8">
          <Text className="text-gray-500 dark:text-gray-400">No source data available</Text>
        </View>
      );
    }

    const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#F97316"];
    const total = sourceData.reduce((sum, [, count]) => sum + count, 0);

    return (
      <View className="space-y-3">
        {sourceData.map(([source, count], index) => (
          <View key={source} className="flex-row items-center">
            <View 
              className="w-4 h-4 rounded-full mr-3"
              style={{ backgroundColor: colors[index] }}
            />
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {source}
              </Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {((count / total) * 100).toFixed(1)}% ({count})
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderPerformanceChart = () => {
    const performanceData = [
      { label: "Accuracy", value: data.accuracyRatings.length > 0 ? 
        data.accuracyRatings.reduce((a, b) => a + b, 0) / data.accuracyRatings.length : 85 },
      { label: "Speed", value: 78 },
      { label: "Relevance", value: 92 },
      { label: "Coverage", value: 88 },
      { label: "Freshness", value: 75 }
    ];

    return (
      <View className="space-y-3">
        {performanceData.map((item, index) => {
          const color = item.value > 85 ? "bg-green-500" : 
                       item.value > 70 ? "bg-yellow-500" : "bg-red-500";
          return (
            <View key={index} className="space-y-1">
              <View className="flex-row justify-between items-center">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {item.label}
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  {item.value.toFixed(0)}%
                </Text>
              </View>
              <View className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                <View 
                  className={`h-2 rounded-full ${color}`}
                  style={{ width: `${item.value}%` }}
                />
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderChart = () => {
    switch (type) {
      case 'category':
        return renderCategoryChart();
      case 'trends':
        return renderTrendsChart();
      case 'sources':
        return renderSourcesChart();
      case 'performance':
        return renderPerformanceChart();
      default:
        return (
          <View className="items-center justify-center py-8">
            <Text className="text-gray-500 dark:text-gray-400">Unknown chart type</Text>
          </View>
        );
    }
  };

  return (
    <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4">
      {renderChart()}
    </View>
  );
}