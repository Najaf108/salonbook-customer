// app/(app)/(chat)/[id].jsx
import { useState, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TextInput,
    TouchableOpacity, KeyboardAvoidingView, Platform,
    ActivityIndicator, Image, SafeAreaView
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useConversation, useSendMessage } from '../../../src/hooks/useMessages';
import { useAuthStore } from '../../../src/stores/useAuthStore';
import { useBookingDetail } from '../../../src/hooks/useBookings';

const COLORS = {
    primary: '#963b52',
    background: '#fff7f9',
    surface: '#ffffff',
    onSurface: '#221920',
    onSurfaceVariant: '#544245',
    outline: '#efdee8',
    secondaryContainer: '#fbe9f3',
};

export default function ChatScreen() {
    const { id: bookingId } = useLocalSearchParams();
    const { user } = useAuthStore();
    const { data: conversation, isLoading: isChatLoading } = useConversation(bookingId);
    const { data: booking } = useBookingDetail(bookingId);
    const { mutate: sendMessage, isPending: isSending } = useSendMessage();

    const [input, setInput] = useState('');
    const flatListRef = useRef(null);

    const handleSend = () => {
        if (!input.trim()) return;
        sendMessage({ bookingId, content: input.trim() });
        setInput('');
    };

    useEffect(() => {
        if (conversation?.messages?.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 500);
        }
    }, [conversation?.messages?.length]);

    const renderMessage = ({ item }) => {
        const isMe = item.senderId === user.id;
        return (
            <View style={[styles.messageWrapper, isMe ? styles.myMessageWrapper : styles.theirMessageWrapper]}>
                <View style={[styles.messageBubble, isMe ? styles.myBubble : styles.theirBubble]}>
                    <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>
                        {item.content}
                    </Text>
                    <Text style={[styles.timestamp, isMe ? styles.myTimestamp : styles.theirTimestamp]}>
                        {format(new Date(item.createdAt), 'h:mm a')}
                    </Text>
                </View>
            </View>
        );
    };

    if (isChatLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <Stack.Screen
                    options={{
                        headerTitle: booking?.salon?.name || 'Chat with Salon',
                        headerShadowVisible: false,
                        headerStyle: { backgroundColor: COLORS.background },
                        headerTintColor: COLORS.primary,
                    }}
                />

                <FlatList
                    ref={flatListRef}
                    data={conversation?.messages || []}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.listContent}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                />

                <View style={styles.inputArea}>
                    {conversation?.isExpired ? (
                        <View style={styles.expiredBanner}>
                            <MaterialIcons name="lock-clock" size={20} color={COLORS.onSurfaceVariant} />
                            <Text style={styles.expiredText}>Chat has expired for this booking</Text>
                        </View>
                    ) : (
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="Type your message..."
                                value={input}
                                onChangeText={setInput}
                                multiline
                                placeholderTextColor={COLORS.onSurfaceVariant}
                            />
                            <TouchableOpacity
                                style={[styles.sendBtn, !input.trim() && { opacity: 0.5 }]}
                                onPress={handleSend}
                                disabled={!input.trim() || isSending}
                            >
                                <MaterialIcons name="send" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.background },
    container: { flex: 1, backgroundColor: COLORS.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 16, paddingBottom: 32 },
    messageWrapper: { flexDirection: 'row', marginBottom: 12, maxWidth: '85%' },
    myMessageWrapper: { alignSelf: 'flex-end' },
    theirMessageWrapper: { alignSelf: 'flex-start' },
    messageBubble: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
    myBubble: { backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
    theirBubble: { backgroundColor: COLORS.secondaryContainer, borderBottomLeftRadius: 4 },
    messageText: { fontSize: 15, lineHeight: 20 },
    myMessageText: { color: '#fff' },
    theirMessageText: { color: COLORS.onSurface },
    timestamp: { fontSize: 10, marginTop: 4, opacity: 0.6 },
    myTimestamp: { color: '#fff', textAlign: 'right' },
    theirTimestamp: { color: COLORS.onSurfaceVariant },
    inputArea: {
        padding: 16,
        backgroundColor: COLORS.surface,
        borderTopWidth: 1,
        borderTopColor: COLORS.outline,
        paddingBottom: Platform.OS === 'ios' ? 8 : 16,
    },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    input: {
        flex: 1,
        backgroundColor: COLORS.background,
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 10,
        maxHeight: 120,
        fontSize: 15,
        color: COLORS.onSurface,
    },
    sendBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    expiredBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 4,
    },
    expiredText: {
        fontSize: 14,
        color: COLORS.onSurfaceVariant,
        fontWeight: '500',
    }
});
