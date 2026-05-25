import { Tabs, router, Redirect } from 'expo-router';
import { useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useAuthStore } from '@/stores/useAuthStore';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AppLayout() {
  const insets = useSafeAreaInsets();
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#963b52',
        tabBarInactiveTintColor: '#797174',
        tabBarStyle: [
          styles.tabBar,
          {
            height: (Platform.OS === 'ios' ? 66 : 60) + Math.max(insets.bottom, 10),
            paddingBottom: Math.max(insets.bottom, 10),
          }
        ],
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
              <MaterialIcons name="home" size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="(search)"
        options={{
          tabBarLabel: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
              <MaterialIcons name="search" size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="(bookings)"
        options={{
          tabBarLabel: 'Bookings',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
              <MaterialIcons name="event" size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
              <MaterialIcons name="person" size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="(chat)"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#ffffff',
    borderTopWidth: 0,
    paddingTop: 10,
    shadowColor: '#1a1118',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 8,
  },
  iconWrapper: {
    width: 56,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  iconWrapperActive: {
    backgroundColor: '#fbe9f3',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    paddingBottom: 2,
  },
});
