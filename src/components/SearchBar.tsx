import React, { useState, useEffect } from 'react';
import { View, TextInput, Pressable, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSearchStore } from '../state/searchStore';
import { searchService } from '../api/search-service';
import { cn } from '../utils/cn';

interface SearchBarProps {
  onSearch: (query: string) => void;
  className?: string;
}

export function SearchBar({ onSearch, className }: SearchBarProps) {
  const { 
    currentQuery, 
    setCurrentQuery, 
    isSearching,
    searchHistory 
  } = useSearchStore();
  
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  useEffect(() => {
    if (currentQuery.length > 2) {
      loadSuggestions();
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [currentQuery]);

  const loadSuggestions = async () => {
    if (isLoadingSuggestions) return;
    
    setIsLoadingSuggestions(true);
    try {
      const newSuggestions = await searchService.generateSearchSuggestions(currentQuery);
      setSuggestions(newSuggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleSearch = () => {
    if (currentQuery.trim()) {
      onSearch(currentQuery.trim());
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setCurrentQuery(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  const recentQueries = searchHistory.slice(0, 3).map(h => h.query);

  return (
    <View className={cn("relative", className)}>
      <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-700">
        <Ionicons 
          name="search" 
          size={20} 
          color="#6B7280" 
          className="mr-3" 
        />
        <TextInput
          value={currentQuery}
          onChangeText={setCurrentQuery}
          placeholder="Search for data mining tools, research topics..."
          placeholderTextColor="#9CA3AF"
          className="flex-1 text-gray-900 dark:text-white text-base"
          onSubmitEditing={handleSearch}
          onFocus={() => {
            if (currentQuery.length > 2) {
              setShowSuggestions(true);
            }
          }}
          editable={!isSearching}
        />
        {currentQuery.length > 0 && (
          <Pressable
            onPress={() => {
              setCurrentQuery('');
              setShowSuggestions(false);
            }}
            className="p-1 ml-2"
          >
            <Ionicons name="close-circle" size={20} color="#6B7280" />
          </Pressable>
        )}
        <Pressable
          onPress={handleSearch}
          disabled={!currentQuery.trim() || isSearching}
          className={cn(
            "ml-2 px-4 py-2 rounded-lg",
            isSearching 
              ? "bg-gray-300 dark:bg-gray-600" 
              : "bg-blue-600 hover:bg-blue-700"
          )}
        >
          {isSearching ? (
            <Ionicons name="hourglass" size={16} color="white" />
          ) : (
            <Ionicons name="arrow-forward" size={16} color="white" />
          )}
        </Pressable>
      </View>

      {showSuggestions && (suggestions.length > 0 || recentQueries.length > 0) && (
        <View className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <ScrollView className="max-h-64">
            {suggestions.length > 0 && (
              <>
                <View className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                  <Text className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    AI Suggestions
                  </Text>
                </View>
                {suggestions.map((suggestion, index) => (
                  <Pressable
                    key={`suggestion-${index}`}
                    onPress={() => selectSuggestion(suggestion)}
                    className="flex-row items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <Ionicons name="bulb-outline" size={16} color="#6B7280" />
                    <Text className="ml-3 text-base text-gray-900 dark:text-white flex-1">
                      {suggestion}
                    </Text>
                  </Pressable>
                ))}
              </>
            )}
            
            {recentQueries.length > 0 && (
              <>
                <View className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                  <Text className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Recent Searches
                  </Text>
                </View>
                {recentQueries.map((query, index) => (
                  <Pressable
                    key={`recent-${index}`}
                    onPress={() => selectSuggestion(query)}
                    className="flex-row items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <Ionicons name="time-outline" size={16} color="#6B7280" />
                    <Text className="ml-3 text-base text-gray-700 dark:text-gray-300 flex-1">
                      {query}
                    </Text>
                  </Pressable>
                ))}
              </>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}