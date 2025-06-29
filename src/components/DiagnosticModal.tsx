import React from 'react';
import { View, Text, Modal, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { searchService } from '../api/search-service';

interface DiagnosticModalProps {
  visible: boolean;
  onClose: () => void;
}

export function DiagnosticModal({ visible, onClose }: DiagnosticModalProps) {
  const apiStatus = searchService.getApiStatus();
  
  const formatTime = (timestamp: number) => {
    if (timestamp === 0) return 'Never';
    return new Date(timestamp).toLocaleTimeString();
  };

  const getStatusIcon = (working: boolean) => {
    return working ? '🟢' : '🔴';
  };

  const getErrorSummary = (error: any) => {
    if (!error) return 'No error';
    if (error.message?.includes('429')) return 'Rate limited';
    if (error.message?.includes('quota') || error.message?.includes('credits')) return 'Quota exceeded';
    if (error.message?.includes('401')) return 'Authentication failed';
    return error.message || 'Unknown error';
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
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            🔧 API Diagnostics
          </Text>
          <Pressable onPress={onClose}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </Pressable>
        </View>

        <ScrollView className="flex-1 px-6 py-4">
          {/* API Status Overview */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Service Status
            </Text>
            <View className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <Text className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Working: {apiStatus.summary.workingApis.join(', ') || 'None'}
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                Failed: {apiStatus.summary.failedApis.join(', ') || 'None'}
              </Text>
            </View>
          </View>

          {/* Individual API Status */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              API Details
            </Text>
            
            {Object.entries(apiStatus).filter(([key]) => key !== 'summary').map(([apiName, status]) => (
              <View key={apiName} className="mb-4 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="font-semibold text-gray-900 dark:text-white capitalize">
                    {getStatusIcon(status.working)} {apiName}
                  </Text>
                  <Text className={`text-sm font-medium ${status.working ? 'text-green-600' : 'text-red-600'}`}>
                    {status.working ? 'Online' : 'Offline'}
                  </Text>
                </View>
                
                <View className="space-y-1">
                  <Text className="text-sm text-gray-600 dark:text-gray-400">
                    Last Success: {formatTime(status.lastSuccess)}
                  </Text>
                  <Text className="text-sm text-gray-600 dark:text-gray-400">
                    Error: {getErrorSummary(status.lastError)}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Fallback Information */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Fallback System
            </Text>
            <View className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <Text className="text-sm text-blue-900 dark:text-blue-100 mb-2">
                ✅ Enhanced fallback search results
              </Text>
              <Text className="text-sm text-blue-900 dark:text-blue-100 mb-2">
                ✅ Local result analysis and categorization
              </Text>
              <Text className="text-sm text-blue-900 dark:text-blue-100 mb-2">
                ✅ Intelligent search suggestions
              </Text>
              <Text className="text-sm text-blue-900 dark:text-blue-100">
                ✅ Graceful degradation with user feedback
              </Text>
            </View>
          </View>

          {/* Troubleshooting */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Troubleshooting
            </Text>
            <View className="space-y-3">
              <View className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800">
                <Text className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                  Rate Limits
                </Text>
                <Text className="text-xs text-yellow-800 dark:text-yellow-200">
                  AI services may have rate limits. The app automatically uses fallbacks when needed.
                </Text>
              </View>
              
              <View className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-red-200 dark:border-red-800">
                <Text className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">
                  Authentication Issues
                </Text>
                <Text className="text-xs text-red-800 dark:text-red-200">
                  API keys may be invalid or expired. Check environment configuration.
                </Text>
              </View>
              
              <View className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                <Text className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">
                  Fallback Mode
                </Text>
                <Text className="text-xs text-green-800 dark:text-green-200">
                  App continues working with enhanced mock data when AI services are unavailable.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <Pressable
            onPress={onClose}
            className="bg-blue-600 py-3 rounded-lg items-center"
          >
            <Text className="text-white font-medium">Close Diagnostics</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}