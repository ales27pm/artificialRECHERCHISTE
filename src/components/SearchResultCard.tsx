import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SearchResult } from '../types/search';
import { useSearchStore } from '../state/searchStore';
import { searchService } from '../api/search-service';
import { cn } from '../utils/cn';

interface SearchResultCardProps {
  result: SearchResult;
  onPress?: () => void;
  showSelection?: boolean;
}

export function SearchResultCard({ result, onPress, showSelection }: SearchResultCardProps) {
  const { selectedResults, toggleResultSelection, analyzeResult } = useSearchStore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const isSelected = selectedResults.includes(result.id);

  const handleAnalyze = async () => {
    if (result.analyzed || isAnalyzing) return;
    
    setIsAnalyzing(true);
    try {
      const analysis = await searchService.analyzeResult(result);
      analyzeResult(result.id, analysis);
    } catch (error) {
      console.error('Failed to analyze result:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      market_research: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      competitive_analysis: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      academic_research: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      news_monitoring: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      trend_analysis: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      fact_checking: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
      investigation: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
      general: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
    };
    return colors[category] || colors.general;
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'happy-outline';
      case 'negative': return 'sad-outline';
      default: return 'remove-outline';
    }
  };

  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 border",
        isSelected 
          ? "border-blue-500 dark:border-blue-400" 
          : "border-gray-200 dark:border-gray-700",
        "shadow-sm"
      )}
    >
      {/* Header */}
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1 mr-3">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white leading-6">
            {result.title}
          </Text>
          <View className="flex-row items-center mt-2 flex-wrap">
            <Text className="text-sm text-blue-600 dark:text-blue-400 mr-3">
              {result.source}
            </Text>
            <View className={cn("px-2 py-1 rounded-full mr-2", getCategoryColor(result.category))}>
              <Text className="text-xs font-medium">
                {result.category.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
        
        {showSelection && (
          <Pressable
            onPress={() => toggleResultSelection(result.id)}
            className={cn(
              "w-6 h-6 rounded border-2 items-center justify-center",
              isSelected 
                ? "bg-blue-600 border-blue-600" 
                : "border-gray-400"
            )}
          >
            {isSelected && (
              <Ionicons name="checkmark" size={14} color="white" />
            )}
          </Pressable>
        )}
      </View>

      {/* Snippet */}
      <Text className="text-gray-700 dark:text-gray-300 text-sm leading-5 mb-3">
        {result.snippet}
      </Text>

      {/* Metadata Row */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View className="flex-row items-center mr-4">
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">
              {(result.relevanceScore * 100).toFixed(0)}%
            </Text>
          </View>
          
          {result.metadata.credibilityScore && (
            <View className="flex-row items-center mr-4">
              <Ionicons name="shield-checkmark" size={14} color="#10B981" />
              <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                {(result.metadata.credibilityScore * 100).toFixed(0)}%
              </Text>
            </View>
          )}
          
          {result.metadata.sentiment && (
            <View className="flex-row items-center mr-4">
              <Ionicons 
                name={getSentimentIcon(result.metadata.sentiment)} 
                size={14} 
                color="#6B7280" 
              />
              <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1 capitalize">
                {result.metadata.sentiment}
              </Text>
            </View>
          )}
          
          {result.metadata.readingTime && (
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={14} color="#6B7280" />
              <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                {result.metadata.readingTime}min
              </Text>
            </View>
          )}
        </View>
        
        <Text className="text-xs text-gray-400">
          {result.metadata.publishDate}
        </Text>
      </View>

      {/* Tags */}
      {result.tags.length > 0 && (
        <View className="flex-row flex-wrap mb-3">
          {result.tags.slice(0, 3).map((tag, index) => (
            <View 
              key={index}
              className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded mr-2 mb-1"
            >
              <Text className="text-xs text-gray-600 dark:text-gray-400">
                {tag}
              </Text>
            </View>
          ))}
          {result.tags.length > 3 && (
            <Text className="text-xs text-gray-500 dark:text-gray-400 py-1">
              +{result.tags.length - 3} more
            </Text>
          )}
        </View>
      )}

      {/* Analysis Section */}
      {result.analyzed && result.analysis && (
        <View className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-3">
          <Text className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            AI Analysis
          </Text>
          <Text className="text-sm text-blue-800 dark:text-blue-200 mb-2">
            {result.analysis.summary}
          </Text>
          {result.analysis.keyPoints.length > 0 && (
            <View>
              <Text className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                Key Points:
              </Text>
              {result.analysis.keyPoints.slice(0, 2).map((point, index) => (
                <Text key={index} className="text-xs text-blue-600 dark:text-blue-400 ml-2">
                  • {point}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Action Buttons */}
      <View className="flex-row items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
        <Pressable
          onPress={handleAnalyze}
          disabled={result.analyzed || isAnalyzing}
          className={cn(
            "flex-row items-center px-3 py-2 rounded-lg",
            result.analyzed 
              ? "bg-green-100 dark:bg-green-900/20" 
              : "bg-blue-100 dark:bg-blue-900/20"
          )}
        >
          {isAnalyzing ? (
            <ActivityIndicator size="small" color="#3B82F6" />
          ) : (
            <Ionicons 
              name={result.analyzed ? "checkmark-circle" : "analytics"} 
              size={16} 
              color={result.analyzed ? "#10B981" : "#3B82F6"} 
            />
          )}
          <Text className={cn(
            "ml-2 text-sm font-medium",
            result.analyzed 
              ? "text-green-700 dark:text-green-300" 
              : "text-blue-700 dark:text-blue-300"
          )}>
            {result.analyzed ? 'Analyzed' : isAnalyzing ? 'Analyzing...' : 'Analyze'}
          </Text>
        </Pressable>

        <View className="flex-row items-center space-x-2">
          <Pressable className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
            <Ionicons name="bookmark-outline" size={16} color="#6B7280" />
          </Pressable>
          <Pressable className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
            <Ionicons name="share-outline" size={16} color="#6B7280" />
          </Pressable>
          <Pressable className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
            <Ionicons name="open-outline" size={16} color="#6B7280" />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}