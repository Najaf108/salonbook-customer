import { Tabs, router, Redirect } from 'expo-router';
import { useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useAuthStore } from '@/stores/useAuthStore';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return <Redirect href="/" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#963b52',
        tabBarInactiveTintColor: '#797174',
        tabBarStyle: styles.tabBar,
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
    height: Platform.OS === 'ios' ? 90 : 70,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
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
