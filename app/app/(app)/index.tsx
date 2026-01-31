import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, StatusBar, ImageBackground } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { Colors, Palette } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
};

const QuickAction = ({ icon, label, onPress, color = Palette.bluePrimary, delay }: any) => (
    <Animated.View entering={FadeInDown.delay(delay).springify()} style={styles.quickActionWrapper}>
        <TouchableOpacity style={styles.quickActionItem} onPress={onPress} activeOpacity={0.7}>
            <View style={[styles.quickActionIconPtr, { backgroundColor: color + '10' }]}>
                <Ionicons name={icon} size={26} color={color} />
            </View>
            <Text style={styles.quickActionLabel} numberOfLines={1}>{label}</Text>
        </TouchableOpacity>
    </Animated.View>
);

const ActionCard = ({ icon, title, subtitle, onPress, delay }: any) => (
  <Animated.View entering={FadeInDown.delay(delay).springify()}>
    <TouchableOpacity style={styles.actionCard} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.actionIcon, { backgroundColor: Palette.bluePrimary + '10' }]}>
        <Ionicons name={icon} size={24} color={Palette.bluePrimary} />
      </View>
      <View style={styles.actionContent}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
      <View style={styles.actionArrow}>
          <Ionicons name="arrow-forward" size={16} color={Palette.blueSecondary} />
      </View>
    </TouchableOpacity>
  </Animated.View>
);

export default function HomeScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const [greeting, setGreeting] = useState('');
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        setGreeting(getGreeting());
    }, []);

    const handleVoicePress = () => {
        router.push('/(app)/voice');
    };

    return (
        <View style={styles.mainContainer}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.light.background} />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    
                    {/* Header */}
                    <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
                        <View style={styles.headerLeft}>
                            <TouchableOpacity style={styles.profileButton}>
                                <ImageBackground 
                                    source={{ uri: `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=0D8ABC&color=fff` }}
                                    style={styles.profileImage}
                                    imageStyle={{ borderRadius: 12 }}
                                />
                            </TouchableOpacity>
                            <View style={styles.headerTexts}>
                                <Text style={styles.greetingText}>{greeting},</Text>
                                <Text style={styles.usernameText}>{user?.name?.split(' ')[0] || 'Partner'}</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.notificationBtn}>
                            <Ionicons name="notifications-outline" size={24} color={Colors.light.text} />
                            <View style={styles.notificationBadge} />
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Shift Summary Hero */}
                    <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.heroWrapper}>
                        <LinearGradient
                            colors={isOnline ? [Palette.blueSecondary, Palette.bluePrimary] : ['#4a4a4a', '#2c2c2c']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.heroGradient}
                        >
                            {/* Background Pattern */}
                            <Ionicons 
                                name="car-sport" 
                                size={180} 
                                color="rgba(255,255,255,0.05)" 
                                style={[styles.bgPattern, { transform: [{ rotate: '-15deg' }] }]} 
                            />

                            <View style={styles.heroTopRow}>
                                <View>
                                    <View style={styles.dateBadge}>
                                        <Text style={styles.dateText}>TODAY</Text>
                                        <View style={styles.trendBadge}>
                                            <Ionicons name="trending-up" size={12} color="#4ADE80" />
                                            <Text style={styles.trendText}> 12%</Text>
                                        </View>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                                        <Text style={styles.currencySymbol}>₹</Text>
                                        <Text style={styles.heroValue}>1,240</Text>
                                        <Text style={styles.heroDecimal}>.50</Text>
                                    </View>
                                </View>
                                <TouchableOpacity 
                                    style={[styles.statusPill, { backgroundColor: isOnline ? 'rgba(0,206,125,0.2)' : 'rgba(255,255,255,0.1)' }]}
                                    onPress={() => setIsOnline(!isOnline)}
                                    activeOpacity={0.8}
                                >
                                    <View style={[styles.statusDot, { backgroundColor: isOnline ? Palette.green : '#aaa' }]} />
                                    <Text style={[styles.statusText, { color: isOnline ? Palette.green : '#ccc' }]}>
                                        {isOnline ? 'ON DUTY' : 'OFF DUTY'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.glassStatsContainer}>
                                <View style={styles.statBox}>
                                    <Text style={styles.statLabel}>Online Time</Text>
                                    <Text style={styles.statValueMain}>6h 30m</Text>
                                </View>
                                <View style={styles.statSeparator} />
                                <View style={styles.statBox}>
                                    <Text style={styles.statLabel}>Total Trips</Text>
                                    <Text style={styles.statValueMain}>12</Text>
                                </View>
                                <View style={styles.statSeparator} />
                                <View style={styles.statBox}>
                                    <Text style={styles.statLabel}>Rating</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={styles.statValueMain}>4.9</Text>
                                        <Ionicons name="star" size={12} color="#FFD700" style={{ marginLeft: 2 }} />
                                    </View>
                                </View>
                            </View>

                            <TouchableOpacity style={styles.voiceAssistButton} onPress={handleVoicePress} activeOpacity={0.9}>
                                <View style={styles.voiceIconBg}>
                                    <LinearGradient
                                         colors={[Palette.blueSecondary, Palette.bluePrimary]}
                                         style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <Ionicons name="mic" size={20} color="#fff" />
                                    </LinearGradient>
                                </View>
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text style={styles.voiceAssistTitle}>Ask SmartSaarthi</Text>
                                    <Text style={styles.voiceAssistSub}>Voice Assistant</Text>
                                </View>
                                <View style={styles.arrowCircle}>
                                    <Ionicons name="arrow-forward" size={16} color={Palette.bluePrimary} />
                                </View>
                            </TouchableOpacity>
                        </LinearGradient>
                    </Animated.View>

                    {/* Quick Actions Grid */}
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>Quick Actions</Text>
                        <View style={styles.quickActionsGrid}>
                            <QuickAction icon="scan-outline" label="Scan QR" delay={300} />
                            <QuickAction icon="gift-outline" label="Incentives" delay={350} color={Palette.green} />
                            <QuickAction icon="wallet-outline" label="Wallet" delay={400} />
                            <QuickAction icon="navigate-circle-outline" label="Map" delay={450} color={Palette.blueSecondary} />
                        </View>
                    </View>

                    {/* Overview Sections */}
                    <View style={styles.sectionContainer}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <Text style={styles.sectionTitle}>Overview</Text>
                             <TouchableOpacity>
                                <Text style={{ color: Palette.bluePrimary, fontSize: 13, fontWeight: '600' }}>See All</Text>
                            </TouchableOpacity>
                        </View>
                       
                        <View style={styles.gridContainer}>
                            <View style={styles.gridColumn}>
                                <ActionCard 
                                    icon="time-outline" 
                                    title="History" 
                                    subtitle="Past interactions" 
                                    delay={500}
                                    onPress={() => {}}
                                />
                                <ActionCard 
                                    icon="document-text-outline" 
                                    title="Documents" 
                                    subtitle="DL & RC Status" 
                                    delay={600}
                                    onPress={() => {}}
                                />
                            </View>
                             <View style={styles.gridColumn}>
                                <ActionCard 
                                    icon="stats-chart-outline" 
                                    title="Performance" 
                                    subtitle="Weekly Stats" 
                                    delay={700}
                                    onPress={() => {}}
                                />
                                <ActionCard 
                                    icon="help-buoy-outline" 
                                    title="Help" 
                                    subtitle="FAQs & Support" 
                                    delay={800}
                                    onPress={() => {}}
                                />
                            </View>
                        </View>
                    </View>

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#F8F9FA', // Slightly gray background for contrast
    },
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 110,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTexts: {
        marginLeft: 12,
    },
    greetingText: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    usernameText: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.light.text,
        letterSpacing: -0.3,
    },
    profileButton: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        backgroundColor: '#fff',
        borderRadius: 12,
    },
    profileImage: {
        width: 48,
        height: 48,
        borderRadius: 12,
        overflow: 'hidden',
    },
    notificationBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    notificationBadge: {
        position: 'absolute',
        top: 10,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ef4444',
        borderWidth: 1.5,
        borderColor: '#fff',
    },
    heroWrapper: {
        marginBottom: 28,
        borderRadius: 28,
        shadowColor: Palette.bluePrimary,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.35,
        shadowRadius: 24,
        elevation: 12,
    },
    heroGradient: {
        borderRadius: 28,
        padding: 24,
        overflow: 'hidden',
        minHeight: 280,
        justifyContent: 'space-between',
    },
    bgPattern: {
        position: 'absolute',
        right: -40,
        top: -20,
        opacity: 0.6,
    },
    heroTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    dateBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    dateText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
        marginRight: 8,
    },
    trendBadge: {
        backgroundColor: 'rgba(74, 222, 128, 0.2)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        flexDirection: 'row',
        alignItems: 'center',
    },
    trendText: {
        color: '#4ADE80',
        fontSize: 10,
        fontWeight: '700',
    },
    currencySymbol: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 6,
        marginRight: 2,
    },
    heroValue: {
        color: '#fff',
        fontSize: 42,
        fontWeight: '800',
        letterSpacing: -1,
    },
    heroDecimal: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 6,
    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
    },
    glassStatsContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 20,
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginBottom: 20,
    },
    statBox: {
        alignItems: 'center',
    },
    statLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 11,
        marginBottom: 4,
    },
    statValueMain: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
    statSeparator: {
        width: 1,
        height: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    voiceAssistButton: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 6,
        paddingRight: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 64,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    voiceIconBg: {
        width: 52,
        height: 52,
        borderRadius: 16,
        overflow: 'hidden',
    },
    voiceAssistTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.light.text,
    },
    voiceAssistSub: {
        fontSize: 12,
        color: '#888',
    },
    arrowCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F7F9FC',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionContainer: {
        marginBottom: 28,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.light.text,
        marginBottom: 0,
        letterSpacing: -0.5,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    quickActionWrapper: {
        width: '23%',
    },
    quickActionItem: {
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 16,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    quickActionIconPtr: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    quickActionLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#444',
        textAlign: 'center',
        marginTop: 4,
    },
    gridContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    gridColumn: {
        width: '48%',
    },
    actionCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 24,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#f5f5f5',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2,
        minHeight: 140,
        justifyContent: 'space-between',
    },
    actionIcon: {
        width: 52,
        height: 52,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    actionContent: {
        marginBottom: 8,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.light.text,
        marginBottom: 4,
    },
    actionSubtitle: {
        fontSize: 12,
        color: '#999',
        lineHeight: 16,
    },
    actionArrow: {
        alignSelf: 'flex-end',
        padding: 6,
        backgroundColor: '#f8f8f8',
        borderRadius: 12,
    }
});
