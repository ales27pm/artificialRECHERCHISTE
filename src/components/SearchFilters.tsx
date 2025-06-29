import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSearchStore } from '../state/searchStore';
import { SearchFilters as SearchFiltersType, SearchCategory } from '../types/search';
import { cn } from '../utils/cn';

interface SearchFiltersProps {
  visible: boolean;
  onClose: () => void;
}

const contentTypes = [
  { key: 'all', label: 'All Content' },
  { key: 'articles', label: 'Articles' },
  { key: 'research', label: 'Research Papers' },
  { key: 'news', label: 'News' },
  { key: 'academic', label: 'Academic' },
  { key: 'social', label: 'Social Media' },
];

const searchDepths = [
  { key: 'surface', label: 'Surface Web', description: 'Standard search results' },
  { key: 'deep', label: 'Deep Web', description: 'Academic databases, archives' },
  { key: 'comprehensive', label: 'Comprehensive', description: 'All available sources' },
];

const categories: Array<{ key: SearchCategory; label: string; color: string }> = [
  { key: 'market_research', label: 'Market Research', color: 'bg-blue-500' },
  { key: 'competitive_analysis', label: 'Competitive Analysis', color: 'bg-green-500' },
  { key: 'academic_research', label: 'Academic Research', color: 'bg-purple-500' },
  { key: 'news_monitoring', label: 'News Monitoring', color: 'bg-red-500' },
  { key: 'trend_analysis', label: 'Trend Analysis', color: 'bg-yellow-500' },
  { key: 'fact_checking', label: 'Fact Checking', color: 'bg-orange-500' },
  { key: 'investigation', label: 'Investigation', color: 'bg-indigo-500' },
  { key: 'general', label: 'General', color: 'bg-gray-500' },
];

export function SearchFilters({ visible, onClose }: SearchFiltersProps) {
  const { currentFilters, setCurrentFilters } = useSearchStore();
  const [tempFilters, setTempFilters] = useState<SearchFiltersType>(currentFilters);

  const updateTempFilter = (key: keyof SearchFiltersType, value: any) => {
    setTempFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setCurrentFilters(tempFilters);
    onClose();
  };

  const resetFilters = () => {
    const defaultFilters: SearchFiltersType = {
      contentType: 'all',
      depth: 'deep',
      language: 'en',
      sources: [],
      domains: [],
      excludeDomains: [],
    };
    setTempFilters(defaultFilters);
    setCurrentFilters(defaultFilters);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white dark:bg-gray-900">
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <Pressable onPress={onClose}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </Pressable>
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            Search Filters
          </Text>
          <Pressable onPress={resetFilters}>
            <Text className="text-blue-600 font-medium">Reset</Text>
          </Pressable>
        </View>

        <ScrollView className="flex-1 px-6 py-4">
          {/* Content Type */}
          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-900 dark:text-white mb-3">
              Content Type
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {contentTypes.map(type => (
                <Pressable
                  key={type.key}
                  onPress={() => updateTempFilter('contentType', type.key)}
                  className={cn(
                    "px-4 py-2 rounded-full border",
                    tempFilters.contentType === type.key
                      ? "bg-blue-600 border-blue-600"
                      : "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  )}
                >
                  <Text
                    className={cn(
                      "text-sm font-medium",
                      tempFilters.contentType === type.key
                        ? "text-white"
                        : "text-gray-700 dark:text-gray-300"
                    )}
                  >
                    {type.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Search Depth */}
          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-900 dark:text-white mb-3">
              Search Depth
            </Text>
            {searchDepths.map(depth => (
              <Pressable
                key={depth.key}
                onPress={() => updateTempFilter('depth', depth.key)}
                className={cn(
                  "flex-row items-center p-4 rounded-xl mb-2 border",
                  tempFilters.depth === depth.key
                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                    : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                )}
              >
                <View
                  className={cn(
                    "w-4 h-4 rounded-full border-2 mr-3",
                    tempFilters.depth === depth.key
                      ? "bg-blue-600 border-blue-600"
                      : "border-gray-400"
                  )}
                />
                <View className="flex-1">
                  <Text
                    className={cn(
                      "font-medium",
                      tempFilters.depth === depth.key
                        ? "text-blue-900 dark:text-blue-100"
                        : "text-gray-900 dark:text-white"
                    )}
                  >
                    {depth.label}
                  </Text>
                  <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {depth.description}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>

          {/* Language */}
          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-900 dark:text-white mb-3">
              Language
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {['en', 'es', 'fr', 'de', 'zh', 'ja'].map(lang => (
                <Pressable
                  key={lang}
                  onPress={() => updateTempFilter('language', lang)}
                  className={cn(
                    "px-4 py-2 rounded-full border",
                    tempFilters.language === lang
                      ? "bg-blue-600 border-blue-600"
                      : "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  )}
                >
                  <Text
                    className={cn(
                      "text-sm font-medium",
                      tempFilters.language === lang
                        ? "text-white"
                        : "text-gray-700 dark:text-gray-300"
                    )}
                  >
                    {lang.toUpperCase()}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Popular Sources */}
          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-900 dark:text-white mb-3">
              Preferred Sources
            </Text>
            <View className="space-y-2">
              {[
                'Academic Databases',
                'News Organizations',
                'Research Institutions',
                'Government Sources',
                'Industry Reports',
                'Technical Documentation'
              ].map(source => {
                const isSelected = tempFilters.sources?.includes(source) || false;
                return (
                  <Pressable
                    key={source}
                    onPress={() => {
                      const current = tempFilters.sources || [];
                      const updated = isSelected
                        ? current.filter(s => s !== source)
                        : [...current, source];
                      updateTempFilter('sources', updated);
                    }}
                    className="flex-row items-center py-3"
                  >
                    <View
                      className={cn(
                        "w-5 h-5 rounded border-2 mr-3 items-center justify-center",
                        isSelected
                          ? "bg-blue-600 border-blue-600"
                          : "border-gray-400"
                      )}
                    >
                      {isSelected && (
                        <Ionicons name="checkmark" size={12} color="white" />
                      )}
                    </View>
                    <Text className="text-gray-900 dark:text-white flex-1">
                      {source}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <Pressable
            onPress={applyFilters}
            className="bg-blue-600 py-4 rounded-xl items-center"
          >
            <Text className="text-white font-semibold text-base">
              Apply Filters
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}