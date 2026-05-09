// app/(app)/(chat)/list.jsx
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
import { router, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useConversations } from '@/hooks/useMessages';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Image } from 'expo-image';
import { format } from 'date-fns';

export default function ChatListScreen() {
    const { data: conversations, isLoading, refetch } = useConversations();

    if (isLoading) return <LoadingSpinner full />;

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.chatCard}
            onPress={() => router.push(`/(app)/(chat)/${item.bookingId}`)}
        >
            <View style={styles.photoContainer}>
                {item.otherPartyPhoto ? (
                    <Image source={{ uri: item.otherPartyPhoto }} style={styles.photo} />
                ) : (
                    <View style={styles.photoPlaceholder}>
                        <Text style={styles.photoText}>{item.otherParty?.[0]}</Text>
                    </View>
                )}
            </View>
            <View style={styles.details}>
                <View style={styles.header}>
                    <Text style={styles.name} numberOfLines={1}>{item.otherParty}</Text>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.time}>
                            {item.lastMessage ? format(new Date(item.lastMessage.createdAt), 'h:mm a') : ''}
                        </Text>
                        {item.unreadCount > 0 && (
                            <View style={styles.unreadBadge}>
                                <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
                            </View>
                        )}
                    </View>
                </View>
                <Text style={[styles.lastMessage, item.unreadCount > 0 && styles.lastMessageUnread]} numberOfLines={1}>
                    {item.lastMessage?.content || 'Started a conversation'}
                </Text>
                <View style={styles.footer}>
                    <Text style={styles.bookingInfo}>
                        Booking: {format(new Date(item.bookingDate), 'MMM dd, yyyy')}
                    </Text>
                    {item.isExpired && (
                        <View style={styles.expiredBadge}>
                            <Text style={styles.expiredBadgeText}>Ended</Text>
                        </View>
                    )}
                </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: 'Messages', headerShown: true }} />
            <FlatList
                data={conversations}
                renderItem={renderItem}
                keyExtractor={item => item.bookingId}
                contentContainerStyle={styles.list}
                onRefresh={refetch}
                refreshing={isLoading}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <MaterialIcons name="chat-bubble-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No messages yet</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    list: { padding: 16 },
    chatCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    photoContainer: { width: 50, height: 50, borderRadius: 25, overflow: 'hidden' },
    photo: { width: '100%', height: '100%' },
    photoPlaceholder: { width: '100%', height: '100%', backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' },
    photoText: { fontSize: 20, color: '#333', fontWeight: 'bold' },
    details: { flex: 1, marginLeft: 12, marginRight: 8 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    name: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    time: { fontSize: 12, color: '#999' },
    lastMessage: { fontSize: 14, color: '#666', marginBottom: 2 },
    lastMessageUnread: { color: '#221920', fontWeight: '700' },
    unreadBadge: {
        backgroundColor: '#963b52',
        paddingHorizontal: 6,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
    },
    unreadBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    bookingInfo: { fontSize: 11, color: '#999', fontStyle: 'italic' },
    footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
    expiredBadge: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    expiredBadgeText: {
        fontSize: 10,
        color: '#999',
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
    emptyText: { marginTop: 16, fontSize: 16, color: '#999' },
});
