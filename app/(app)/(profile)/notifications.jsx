import {
    View, Text, FlatList, TouchableOpacity,
    StyleSheet, RefreshControl, Platform
} from 'react-native';
import { Stack, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '@/hooks/useNotifications';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import { format } from 'date-fns';

const VIBE = {
    colors: {
        primary: '#963b52',
        background: '#fff7f9',
        surfaceContainerLowest: '#ffffff',
        onSurface: '#221920',
        onSurfaceVariant: '#544245',
        outlineVariant: '#efdee8',
        error: '#ba1a1a',
    }
};

export default function NotificationsScreen() {
    const { data: notifications, isLoading, refetch } = useNotifications();
    const { mutate: markAsRead } = useMarkAsRead();
    const { mutate: markAllAsRead } = useMarkAllAsRead();

    const handleNotificationPress = (notification) => {
        if (!notification.isRead) {
            markAsRead(notification.id);
        }

        // Navigation logic based on type
        if ((notification.type === 'CONFIRMED' || notification.type === 'NEW_BOOKING') && notification.data?.bookingId) {
            router.push(`/(app)/(bookings)/${notification.data.bookingId}`);
        } else if (notification.type === 'REVIEW_PROMPT' && notification.data?.bookingId) {
            router.push(`/(app)/(bookings)/${notification.data.bookingId}`);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
            onPress={() => handleNotificationPress(item)}
        >
            <View style={styles.iconContainer}>
                <View style={[styles.iconBg, !item.isRead && styles.unreadIconBg]}>
                    <MaterialIcons
                        name={item.type === 'CONFIRMED' ? 'check-circle' : 'notifications'}
                        size={22}
                        color={!item.isRead ? VIBE.colors.primary : VIBE.colors.onSurfaceVariant}
                    />
                </View>
                {!item.isRead && <View style={styles.unreadDot} />}
            </View>
            <View style={styles.contentContainer}>
                <Text style={[styles.title, !item.isRead && styles.unreadText]}>{item.title}</Text>
                <Text style={styles.body}>{item.body}</Text>
                <Text style={styles.date}>{format(new Date(item.createdAt), 'MMM dd, h:mm a')}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <>
            <Stack.Screen options={{
                title: 'Notifications',
                headerShown: true,
                headerLeft: () => (
                    <TouchableOpacity
                        onPress={() => router.replace('/(app)/(profile)')}
                        style={{ marginLeft: 16 }}
                    >
                        <MaterialIcons name="arrow-back" size={24} color={VIBE.colors.primary} />
                    </TouchableOpacity>
                ),
                headerTitleStyle: {
                    marginLeft: Platform.OS === 'android' ? -16 : 0
                }
            }} />
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.countText}>{notifications?.length || 0} Notifications</Text>
                    <TouchableOpacity onPress={() => markAllAsRead()}>
                        <Text style={styles.markAllText}>Mark all as read</Text>
                    </TouchableOpacity>
                </View>

                {isLoading ? (
                    <LoadingSpinner full />
                ) : (
                    <FlatList
                        data={notifications}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        contentContainerStyle={styles.list}
                        refreshControl={
                            <RefreshControl refreshing={isLoading} onRefresh={refetch} />
                        }
                        ListEmptyComponent={
                            <EmptyState
                                emoji="🔔"
                                title="No notifications yet"
                                subtitle="Your activity alerts will appear here."
                            />
                        }
                    />
                )}
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: VIBE.colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: VIBE.colors.outlineVariant,
    },
    countText: {
        fontSize: 14,
        fontWeight: '600',
        color: VIBE.colors.onSurfaceVariant,
    },
    markAllText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: VIBE.colors.primary,
    },
    list: {
        paddingBottom: 20,
    },
    notificationCard: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: VIBE.colors.surfaceContainerLowest,
        borderBottomWidth: 1,
        borderBottomColor: VIBE.colors.outlineVariant,
    },
    unreadCard: {
        backgroundColor: '#fdf0f4',
    },
    iconContainer: {
        marginRight: 16,
        position: 'relative',
        justifyContent: 'center',
    },
    iconBg: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    unreadIconBg: {
        backgroundColor: '#fbe9f3',
    },
    unreadDot: {
        position: 'absolute',
        top: 2,
        right: 2,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: VIBE.colors.primary,
        borderWidth: 2,
        borderColor: '#ffffff',
    },
    contentContainer: {
        flex: 1,
    },
    title: {
        fontSize: 15,
        fontWeight: '500',
        color: VIBE.colors.onSurface,
        marginBottom: 2,
    },
    unreadText: {
        fontWeight: 'bold',
    },
    body: {
        fontSize: 13,
        color: VIBE.colors.onSurfaceVariant,
        lineHeight: 18,
        marginBottom: 6,
    },
    date: {
        fontSize: 11,
        color: '#9a8186',
    },
});
