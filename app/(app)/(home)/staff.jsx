// app/(app)/(home)/staff.jsx
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useBookingStore } from '@/stores/useBookingStore';
import { useSalonStaff } from '@/hooks/useSalons';
import LoadingSpinner from '@/components/LoadingSpinner';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function StaffScreen() {
    const params = useLocalSearchParams();
    const { salon, selectedStaff, setStaff } = useBookingStore();
    const { data: staff, isLoading } = useSalonStaff(salon?.id);

    const handleSelect = (member) => {
        setStaff(selectedStaff?.id === member?.id ? null : member);
    };

    const handleNext = () => {
        router.push({
            pathname: '/(app)/(home)/slot',
            params: { ...params }
        });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.container}>
                {/* Custom Header */}
                <View style={styles.appBar}>
                    <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
                        <MaterialIcons name="arrow-back" size={24} color="#963b52" />
                    </TouchableOpacity>
                    <Text style={styles.appTitle}>Select Stylist</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Subtitle / Hint Wrapper */}
                <View style={styles.headerSubtitleWrap}>
                    <Text style={styles.hintTitle}>Who do you prefer?</Text>
                    <Text style={styles.hintSub}>Optional — skip to let the salon assign.</Text>
                </View>

                {isLoading ? <LoadingSpinner full /> : (
                    <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
                        {/* "Any Staff" option */}
                        <TouchableOpacity
                            style={[styles.card, !selectedStaff && styles.cardSelected]}
                            onPress={() => setStaff(null)}
                            activeOpacity={0.8}
                        >
                            <View style={[styles.anyAvatarWrap, !selectedStaff && styles.anyAvatarSelected]}>
                                <MaterialIcons name="group" size={28} color={!selectedStaff ? '#ffffff' : '#963b52'} />
                            </View>
                            <View style={{ flex: 1, paddingRight: 8 }}>
                                <Text style={[styles.staffName, !selectedStaff && styles.staffNameActive]}>Any Available Stylist</Text>
                                <Text style={styles.staffSpec}>Salon will assign the best available</Text>
                            </View>
                            <View style={[styles.checkboxOutline, !selectedStaff && styles.checkboxActive]}>
                                {!selectedStaff && <MaterialIcons name="check" size={16} color="#ffffff" />}
                            </View>
                        </TouchableOpacity>

                        {/* Specific Staff */}
                        {staff?.map(member => {
                            const isSelected = selectedStaff?.id === member.id;
                            return (
                                <TouchableOpacity
                                    key={member.id}
                                    style={[styles.card, isSelected && styles.cardSelected]}
                                    onPress={() => handleSelect(member)}
                                    activeOpacity={0.8}
                                >
                                    <View style={styles.avatarWrap}>
                                        <Image
                                            source={{ uri: member.photo || 'https://ui-avatars.com/api/?background=random&color=fff&name=' + member.name[0] }}
                                            style={styles.avatar}
                                            contentFit="cover"
                                        />
                                    </View>
                                    <View style={{ flex: 1, paddingRight: 8 }}>
                                        <Text style={[styles.staffName, isSelected && styles.staffNameActive]}>{member.name}</Text>
                                        {member.specialty && <Text style={styles.staffSpec}>{member.specialty}</Text>}
                                        <View style={styles.staffRating}>
                                            <MaterialIcons name="star" size={14} color="#7b5804" />
                                            <Text style={styles.ratingText}>{member.avgRating?.toFixed(1) || '0.0'}</Text>
                                        </View>
                                    </View>
                                    <View style={[styles.checkboxOutline, isSelected && styles.checkboxActive]}>
                                        {isSelected && <MaterialIcons name="check" size={16} color="#ffffff" />}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                )}

                {/* Sticky Bottom Bar */}
                <View style={styles.bottomBarWrapper}>
                    <View style={styles.bottomBarInner}>
                        <View style={styles.selectedStatus}>
                            <Text style={styles.statusLabel}>Selection</Text>
                            <Text style={styles.statusVal} numberOfLines={1}>
                                {selectedStaff ? selectedStaff.name : 'Any Stylist'}
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={handleNext}
                            activeOpacity={0.9}
                        >
                            <LinearGradient colors={['#963b52', '#b5536a']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.nextBtn}>
                                <Text style={styles.nextBtnText}>Choose Time</Text>
                                <MaterialIcons name="arrow-forward" size={20} color="#fff" />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff7f9' },
    container: { flex: 1, backgroundColor: '#fff7f9' },
    appBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 16 : 16,
        paddingBottom: 8,
        backgroundColor: '#fff7f9',
    },
    appTitle: { fontSize: 20, fontWeight: 'bold', color: '#221920', letterSpacing: -0.5 },
    headerSubtitleWrap: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 },
    hintTitle: { fontSize: 32, fontWeight: '900', color: '#221920', lineHeight: 36, letterSpacing: -1, marginBottom: 8 },
    hintSub: { fontSize: 16, color: 'rgba(84, 66, 69, 0.8)' },
    listContent: { paddingHorizontal: 24, paddingBottom: 140, gap: 16 },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#221920',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 1,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    cardSelected: {
        borderColor: '#963b52',
        backgroundColor: '#fffcfd',
    },
    anyAvatarWrap: {
        width: 64, height: 64,
        borderRadius: 32,
        backgroundColor: '#ffd9de',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    anyAvatarSelected: {
        backgroundColor: '#963b52',
    },
    avatarWrap: {
        width: 64, height: 64,
        borderRadius: 32,
        backgroundColor: '#efdee8',
        overflow: 'hidden',
        marginRight: 16,
    },
    avatar: { width: '100%', height: '100%' },
    staffName: { fontSize: 18, fontWeight: 'bold', color: '#221920', marginBottom: 2 },
    staffNameActive: { color: '#963b52' },
    staffSpec: { fontSize: 14, color: '#544245', marginBottom: 6 },
    staffRating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    ratingText: { fontSize: 13, color: '#7b5804', fontWeight: '600' },
    checkboxOutline: {
        width: 28, height: 28,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: '#efdee8',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
    },
    checkboxActive: {
        backgroundColor: '#963b52',
        borderColor: '#963b52',
    },
    bottomBarWrapper: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(251, 233, 243, 0.95)',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: Platform.OS === 'ios' ? 32 : 16,
        shadowColor: '#221920',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 20,
    },
    bottomBarInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    selectedStatus: { flexDirection: 'column', flex: 1, paddingRight: 16 },
    statusLabel: { fontSize: 12, fontWeight: 'bold', color: '#544245', tracking: 1, marginBottom: 2 },
    statusVal: { fontSize: 18, fontWeight: 'bold', color: '#963b52', letterSpacing: -0.5 },
    nextBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16, borderRadius: 32, gap: 12 },
    nextBtnText: { fontSize: 16, fontWeight: 'bold', color: '#ffffff', letterSpacing: 0.5 },
});
