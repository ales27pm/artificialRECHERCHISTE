import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSearchStore } from '../state/searchStore';
import { SearchScreen } from '../screens/SearchScreen';
import { AnalyticsScreen } from '../screens/AnalyticsScreen';
import { ReportsScreen } from '../screens/ReportsScreen';

const Tab = createBottomTabNavigator();

export function AppNavigator() {
  const { activeTab, setActiveTab, selectedResults, reports } = useSearchStore();

  const getTabBarIcon = (routeName: string, focused: boolean, size: number) => {
    let iconName: keyof typeof Ionicons.glyphMap;

    switch (routeName) {
      case 'Search':
        iconName = focused ? 'search' : 'search-outline';
        break;
      case 'Analytics':
        iconName = focused ? 'stats-chart' : 'stats-chart-outline';
        break;
      case 'Reports':
        iconName = focused ? 'document-text' : 'document-text-outline';
        break;
      default:
        iconName = 'circle';
    }

    return <Ionicons name={iconName} size={size} color={focused ? '#3B82F6' : '#6B7280'} />;
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, size }) => getTabBarIcon(route.name, focused, size),
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#6B7280',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E7EB',
          paddingTop: 8,
          paddingBottom: 8,
          height: 88,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
      })}
      initialRouteName="Search"
    >
      <Tab.Screen 
        name="Search" 
        component={SearchScreen}
        options={{
          tabBarBadge: selectedResults.length > 0 ? selectedResults.length : undefined,
          tabBarBadgeStyle: {
            backgroundColor: '#EF4444',
            color: 'white',
            fontSize: 10,
            minWidth: 16,
            height: 16,
          }
        }}
      />
      <Tab.Screen 
        name="Analytics" 
        component={AnalyticsScreen}
      />
      <Tab.Screen 
        name="Reports" 
        component={ReportsScreen}
        options={{
          tabBarBadge: reports.length > 0 ? reports.length : undefined,
          tabBarBadgeStyle: {
            backgroundColor: '#10B981',
            color: 'white',
            fontSize: 10,
            minWidth: 16,
            height: 16,
          }
        }}
      />
    </Tab.Navigator>
  );
}