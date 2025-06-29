import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSearchStore } from '../state/searchStore';
import { SearchReport } from '../types/search';
import { cn } from '../utils/cn';

export function ReportsScreen() {
  const { 
    reports, 
    activeReport, 
    setActiveReport, 
    updateReport, 
    deleteReport,
    results,
    selectedResults,
    currentQuery,
    createReport,
    clearSelectedResults
  } = useSearchStore();

  const [showCreateReport, setShowCreateReport] = useState(false);
  const [newReportTitle, setNewReportTitle] = useState('');

  const handleCreateReport = () => {
    if (!newReportTitle.trim()) {
      Alert.alert('Error', 'Please enter a report title');
      return;
    }

    if (selectedResults.length === 0) {
      Alert.alert('Error', 'Please select some search results first');
      return;
    }

    const selectedResultObjects = results.filter(r => selectedResults.includes(r.id));
    createReport(newReportTitle.trim(), [currentQuery], selectedResultObjects);
    clearSelectedResults();
    setNewReportTitle('');
    setShowCreateReport(false);
    
    Alert.alert('Success', 'Report created successfully!');
  };

  const handleDeleteReport = (reportId: string) => {
    Alert.alert(
      'Delete Report',
      'Are you sure you want to delete this report?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteReport(reportId)
        }
      ]
    );
  };

  const handleExportReport = async (report: SearchReport) => {
    try {
      const reportContent = generateReportContent(report);
      await Share.share({
        message: reportContent,
        title: report.title
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to export report');
    }
  };

  const generateReportContent = (report: SearchReport): string => {
    const content = `
# ${report.title}

## Executive Summary
Generated on: ${new Date(report.createdAt).toLocaleDateString()}
Total Sources: ${report.analysis.totalSources}
Average Credibility: ${(report.analysis.averageCredibility * 100).toFixed(1)}%

## Search Queries
${report.queries.map(q => `- ${q}`).join('\n')}

## Key Findings
${report.analysis.keyInsights.map(insight => `• ${insight}`).join('\n')}

## Top Sources
${report.results.slice(0, 10).map((result, index) => `
${index + 1}. ${result.title}
   Source: ${result.source}
   URL: ${result.url}
   Credibility: ${((result.metadata.credibilityScore || 0) * 100).toFixed(1)}%
   
   ${result.snippet}
`).join('\n')}

## Recommendations
${report.analysis.recommendations.map(rec => `• ${rec}`).join('\n')}

## Methodology
This report was generated using advanced AI-powered search and analysis techniques, incorporating data from multiple sources including academic databases, news organizations, and specialized research platforms.
    `.trim();

    return content;
  };

  const ReportCard = ({ report }: { report: SearchReport }) => (
    <Pressable
      onPress={() => setActiveReport(activeReport?.id === report.id ? null : report)}
      className={cn(
        "bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 border",
        activeReport?.id === report.id 
          ? "border-blue-500 dark:border-blue-400" 
          : "border-gray-200 dark:border-gray-700"
      )}
    >
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1 mr-3">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            {report.title}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Created {new Date(report.createdAt).toLocaleDateString()}
          </Text>
        </View>
        
        <View className="flex-row items-center space-x-2">
          <Pressable
            onPress={() => handleExportReport(report)}
            className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20"
          >
            <Ionicons name="share-outline" size={16} color="#3B82F6" />
          </Pressable>
          <Pressable
            onPress={() => handleDeleteReport(report.id)}
            className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20"
          >
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
          </Pressable>
        </View>
      </View>

      <View className="flex-row items-center space-x-4 mb-3">
        <View className="flex-row items-center">
          <Ionicons name="document-text" size={14} color="#6B7280" />
          <Text className="text-sm text-gray-600 dark:text-gray-400 ml-1">
            {report.results.length} sources
          </Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="star" size={14} color="#F59E0B" />
          <Text className="text-sm text-gray-600 dark:text-gray-400 ml-1">
            {(report.analysis.averageCredibility * 100).toFixed(0)}% credibility
          </Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="search" size={14} color="#6B7280" />
          <Text className="text-sm text-gray-600 dark:text-gray-400 ml-1">
            {report.queries.length} queries
          </Text>
        </View>
      </View>

      {activeReport?.id === report.id && (
        <View className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
          {/* Sentiment Distribution */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sentiment Analysis
            </Text>
            <View className="flex-row space-x-2">
              {Object.entries(report.analysis.sentimentDistribution).map(([sentiment, count]) => (
                <View key={sentiment} className="flex-row items-center">
                  <View className={cn(
                    "w-3 h-3 rounded-full mr-1",
                    sentiment === 'positive' ? 'bg-green-500' :
                    sentiment === 'negative' ? 'bg-red-500' : 'bg-gray-500'
                  )} />
                  <Text className="text-xs text-gray-600 dark:text-gray-400">
                    {sentiment}: {count}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Top Sources Preview */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Top Sources
            </Text>
            {report.results.slice(0, 3).map((result, index) => (
              <View key={result.id} className="flex-row items-center py-1">
                <Text className="text-xs text-gray-500 dark:text-gray-500 w-4">
                  {index + 1}.
                </Text>
                <Text className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                  {result.title}
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-500">
                  {result.source}
                </Text>
              </View>
            ))}
            {report.results.length > 3 && (
              <Text className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                +{report.results.length - 3} more sources
              </Text>
            )}
          </View>

          {/* Queries */}
          <View>
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Queries
            </Text>
            {report.queries.map((query, index) => (
              <View key={index} className="bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg mb-1">
                <Text className="text-sm text-gray-700 dark:text-gray-300">
                  {query}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            Research Reports
          </Text>
          <Pressable
            onPress={() => setShowCreateReport(true)}
            className="flex-row items-center px-4 py-2 bg-blue-600 rounded-lg"
          >
            <Ionicons name="add" size={16} color="white" />
            <Text className="ml-2 text-sm font-medium text-white">
              New Report
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        {/* Create Report Form */}
        {showCreateReport && (
          <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 border border-gray-200 dark:border-gray-700">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Create New Report
            </Text>
            <TextInput
              value={newReportTitle}
              onChangeText={setNewReportTitle}
              placeholder="Enter report title..."
              placeholderTextColor="#9CA3AF"
              className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white mb-3"
            />
            <Text className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Selected Results: {selectedResults.length}
            </Text>
            <View className="flex-row space-x-2">
              <Pressable
                onPress={handleCreateReport}
                className="flex-1 bg-blue-600 py-3 rounded-lg items-center"
              >
                <Text className="text-white font-medium">Create Report</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setShowCreateReport(false);
                  setNewReportTitle('');
                }}
                className="flex-1 bg-gray-300 dark:bg-gray-600 py-3 rounded-lg items-center"
              >
                <Text className="text-gray-700 dark:text-gray-300 font-medium">Cancel</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Reports List */}
        {reports.length > 0 ? (
          <>
            <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Your Reports ({reports.length})
            </Text>
            {reports
              .sort((a, b) => b.updatedAt - a.updatedAt)
              .map(report => (
                <ReportCard key={report.id} report={report} />
              ))
            }
          </>
        ) : (
          <View className="items-center justify-center py-16">
            <Ionicons name="document-text-outline" size={64} color="#D1D5DB" />
            <Text className="text-xl font-semibold text-gray-600 dark:text-gray-400 mt-4 text-center">
              No Reports Yet
            </Text>
            <Text className="text-gray-500 dark:text-gray-500 mt-2 text-center px-8">
              Create comprehensive research reports from your search results to organize and share your findings
            </Text>
            <Pressable
              onPress={() => setShowCreateReport(true)}
              className="mt-6 bg-blue-600 px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-medium">Create First Report</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}