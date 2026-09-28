import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

import { HomeScreen } from '../screens/home/HomeScreen';
import { OpportunitiesScreen } from '../screens/opportunities/OpportunitiesScreen';
import { CareerAIScreen } from '../screens/ai/CareerAIScreen';
import { NewsScreen } from '../screens/news/NewsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();
const OpportunitiesStack = createNativeStackNavigator();

const OpportunitiesNavigator = () => {
  return (
    <OpportunitiesStack.Navigator screenOptions={{ headerShown: false }}>
      <OpportunitiesStack.Screen name="OpportunitiesList" component={OpportunitiesScreen} />
    </OpportunitiesStack.Navigator>
  );
};

export const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0f172a',
          borderTopColor: '#1e293b',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8
        },
        tabBarActiveTintColor: '#818cf8',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600'
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any = 'home';

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'OpportunitiesTab') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
          } else if (route.name === 'CareerAITab') {
            iconName = focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
          } else if (route.name === 'NewsTab') {
            iconName = focused ? 'newspaper' : 'newspaper-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        }
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="OpportunitiesTab"
        component={OpportunitiesNavigator}
        options={{ tabBarLabel: 'Opportunities' }}
      />
      <Tab.Screen
        name="CareerAITab"
        component={CareerAIScreen}
        options={{ tabBarLabel: 'Career AI' }}
      />
      <Tab.Screen
        name="NewsTab"
        component={NewsScreen}
        options={{ tabBarLabel: 'News' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};
