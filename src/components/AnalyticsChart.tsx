import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { VictoryChart, VictoryBar, VictoryPie, VictoryArea } from 'victory-native';
import { AnalyticsData } from '../types/search';

const { width } = Dimensions.get('window');

interface AnalyticsChartProps {
  data: AnalyticsData;
  type: 'category' | 'trends' | 'sources' | 'performance';
}

export function AnalyticsChart({ data, type }: AnalyticsChartProps) {
  const chartWidth = width - 40;
  const chartHeight = 200;

  // Error boundary for chart rendering
  const renderSafeChart = (chartComponent: React.ReactNode) => {
    try {
      return chartComponent;
    } catch (error) {
      console.error('Chart rendering error:', error);
      return (
        <View className="items-center justify-center" style={{ height: chartHeight }}>
          <Text className="text-gray-500 dark:text-gray-400">Chart temporarily unavailable</Text>
        </View>
      );
    }
  };

  const renderCategoryChart = () => {
    const categoryData = Object.entries(data.searchesByCategory)
      .filter(([_, count]) => count > 0)
      .map(([category, count]) => ({
        x: category.replace('_', ' ').toUpperCase(),
        y: count,
        label: `${count}`
      }));

    if (categoryData.length === 0) {
      return (
        <View className="items-center justify-center" style={{ height: chartHeight }}>
          <Text className="text-gray-500 dark:text-gray-400">No search data available</Text>
        </View>
      );
    }

    return renderSafeChart(
      <VictoryChart
        width={chartWidth}
        height={chartHeight}
        padding={{ left: 60, top: 20, right: 20, bottom: 60 }}
      >
        <VictoryBar
          data={categoryData}
          style={{
            data: { fill: "#3B82F6" }
          }}
        />
      </VictoryChart>
    );
  };

  const renderTrendsChart = () => {
    // Mock trend data - in real app this would come from historical data
    const trendData = [
      { x: "Mon", y: 15 },
      { x: "Tue", y: 23 },
      { x: "Wed", y: 18 },
      { x: "Thu", y: 31 },
      { x: "Fri", y: 25 },
      { x: "Sat", y: 12 },
      { x: "Sun", y: 8 }
    ];

    return renderSafeChart(
      <VictoryChart
        width={chartWidth}
        height={chartHeight}
        padding={{ left: 60, top: 20, right: 20, bottom: 60 }}
      >
        <VictoryArea
          data={trendData}
          style={{
            data: { fill: "#10B981", fillOpacity: 0.3, stroke: "#10B981", strokeWidth: 2 }
          }}
        />
      </VictoryChart>
    );
  };

  const renderSourcesChart = () => {
    const sourceData = Object.entries(data.sourceDistribution)
      .slice(0, 6) // Top 6 sources
      .map(([source, count]) => ({
        x: source,
        y: count
      }));

    if (sourceData.length === 0) {
      return (
        <View className="items-center justify-center" style={{ height: chartHeight }}>
          <Text className="text-gray-500 dark:text-gray-400">No source data available</Text>
        </View>
      );
    }

    return renderSafeChart(
      <VictoryPie
        data={sourceData}
        width={chartWidth}
        height={chartHeight}
        colorScale={["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#F97316"]}
        innerRadius={50}
        labelRadius={({ innerRadius }) => (innerRadius as number) + 40}
      />
    );
  };

  const renderPerformanceChart = () => {
    // Mock performance data
    const performanceData = [
      { x: "Accuracy", y: data.accuracyRatings.length > 0 ? 
        data.accuracyRatings.reduce((a, b) => a + b, 0) / data.accuracyRatings.length : 85 },
      { x: "Speed", y: 78 },
      { x: "Relevance", y: 92 },
      { x: "Coverage", y: 88 },
      { x: "Freshness", y: 75 }
    ];

    return renderSafeChart(
      <VictoryChart
        width={chartWidth}
        height={chartHeight}
        padding={{ left: 60, top: 20, right: 20, bottom: 60 }}
        domain={{ y: [0, 100] }}
      >
        <VictoryBar
          data={performanceData}
          style={{
            data: { 
              fill: ({ datum }) => 
                datum.y > 85 ? "#10B981" : 
                datum.y > 70 ? "#F59E0B" : "#EF4444" 
            }
          }}
        />
      </VictoryChart>
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
          <View className="items-center justify-center" style={{ height: chartHeight }}>
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