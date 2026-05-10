// app/(app)/(chat)/[id].jsx
import { useState, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TextInput,
    TouchableOpacity, Platform, Keyboard,
    ActivityIndicator, Image
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
    const insets = useSafeAreaInsets();
    const { data: conversation, isLoading: isChatLoading } = useConversation(bookingId);
    const { data: booking } = useBookingDetail(bookingId);
    const { mutate: sendMessage, isPending: isSending } = useSendMessage();

    const [input, setInput] = useState('');
    const [keyboardOffset, setKeyboardOffset] = useState(0);
    const flatListRef = useRef(null);

    useEffect(() => {
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

        const showSub = Keyboard.addListener(showEvent, (e) => {
            // e.endCoordinates.height includes GBoard suggestion bar
            setKeyboardOffset(e.endCoordinates.height);
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        });
        const hideSub = Keyboard.addListener(hideEvent, () => {
            setKeyboardOffset(0);
        });

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

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
        const salonPhoto = booking?.salon?.logoUrl || `https://ui-avatars.com/api/?name=${booking?.salon?.name || 'Salon'}&background=963b52&color=fff`;

        return (
            <View style={[styles.messageWrapper, isMe ? styles.myMessageWrapper : styles.theirMessageWrapper]}>
                {!isMe && (
                    <Image
                        source={{ uri: salonPhoto }}
                        style={styles.avatar}
                    />
                )}
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

    const bottomInset = Math.max(insets.bottom, 8);

    return (
        <View style={styles.container}>
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
                keyboardDismissMode="interactive"
                keyboardShouldPersistTaps="handled"
            />

            {/* This view lifts with the keyboard via marginBottom */}
            <View style={[styles.inputArea, {
                paddingBottom: keyboardOffset === 0 ? bottomInset : 18,
                marginBottom: keyboardOffset,
            }]}>
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 16, paddingBottom: 12 },
    messageWrapper: { flexDirection: 'row', marginBottom: 16, maxWidth: '85%' },
    myMessageWrapper: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
    theirMessageWrapper: { alignSelf: 'flex-start' },
    avatar: { width: 32, height: 32, borderRadius: 16, marginHorizontal: 8, alignSelf: 'flex-end' },
    messageBubble: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, flexShrink: 1 },
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
