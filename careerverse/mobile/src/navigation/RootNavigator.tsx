import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { SplashScreen } from '../screens/auth/SplashScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { OnboardingScreen } from '../screens/auth/OnboardingScreen';
import { TabNavigator } from './TabNavigator';
import { OpportunityDetailScreen } from '../screens/opportunities/OpportunityDetailScreen';
import { ResumeAnalyzerScreen } from '../screens/ai/ResumeAnalyzerScreen';
import { SkillGapScreen } from '../screens/ai/SkillGapScreen';
import { InterviewPracticeScreen } from '../screens/ai/InterviewPracticeScreen';
import { ApplicationTrackerScreen } from '../screens/applications/ApplicationTrackerScreen';
import { RoadmapScreen } from '../screens/roadmap/RoadmapScreen';
import { CareerQuizScreen } from '../screens/quiz/CareerQuizScreen';
import { SettingsScreen } from '../screens/profile/SettingsScreen';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: 'fade'
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="OpportunityDetail" component={OpportunityDetailScreen} />
      <Stack.Screen name="ResumeAnalyzer" component={ResumeAnalyzerScreen} />
      <Stack.Screen name="SkillGap" component={SkillGapScreen} />
      <Stack.Screen name="InterviewPractice" component={InterviewPracticeScreen} />
      <Stack.Screen name="ApplicationTracker" component={ApplicationTrackerScreen} />
      <Stack.Screen name="Roadmap" component={RoadmapScreen} />
      <Stack.Screen name="CareerQuiz" component={CareerQuizScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
};
