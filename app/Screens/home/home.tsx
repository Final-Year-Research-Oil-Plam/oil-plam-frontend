import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Define props for FeatureCard
interface FeatureCardProps {
    icon: keyof typeof Ionicons.glyphMap; // ensures valid Ionicons name
    title: string;
    description: string;
    gradientColors: [string, string];
    iconColor: string;
    onPress?: () => void;
}

export default function HomeScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter(); // Fixed router usage

    // FeatureCard component
    const FeatureCard: React.FC<FeatureCardProps> = ({
                                                         icon,
                                                         title,
                                                         description,
                                                         gradientColors,
                                                         iconColor,
                                                         onPress,
                                                     }) => (
        <TouchableOpacity style={styles.featureCard} onPress={onPress} activeOpacity={0.9}>
            <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}
            >
                <View style={styles.cardIconContainer}>
                    <Ionicons name={icon} size={32} color={iconColor} />
                </View>
                <Text style={styles.cardTitle}>{title}</Text>
                <Text style={styles.cardDescription}>{description}</Text>
                <View style={styles.cardArrow}>
                    <Ionicons name="arrow-forward" size={20} color={iconColor} />
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}> 
            <LinearGradient
                colors={['#1B5E20', '#2E7D32', '#388E3C']}
                style={styles.headerGradient}
            >
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Welcome Back</Text>
                        <Text style={styles.userName}>Plantation Manager</Text>
                    </View>
                    <View style={styles.avatarContainer}>
                        <Ionicons name="person-circle" size={48} color="#FFFFFF" />
                    </View>
                </View>
            </LinearGradient>

            <View style={[styles.content, { paddingBottom: insets.bottom + 20 }]}> 
                <FeatureCard
                    icon="add-circle-outline"
                    title="Add Tree"
                    description="Add a new oil palm tree to the plantation"
                    gradientColors={['#2E7D32', '#388E3C']}
                    iconColor="#FFFFFF"
                    onPress={() => router.push('/Screens/addTree/add-tree')}
                />

                <FeatureCard
                    icon="leaf-outline"
                    title="Predict Bunch"
                    description="Predict oil palm bunch yield"
                    gradientColors={['#43A047', '#388E3C']}
                    iconColor="#FFFFFF"
                    onPress={() => {/* TODO: Add navigation for Predict Bunch */}}
                />

                <FeatureCard
                    icon="search-outline"
                    title="Search Tree"
                    description="Find and view tree information by ID or location"
                    gradientColors={['#388E3C', '#4CAF50']}
                    iconColor="#FFFFFF"
                    onPress={() => router.push('/Screens/searchTree/search-tree')}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5FBF7',
    },
    headerGradient: {
        paddingBottom: 24,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
    },
    greeting: {
        fontSize: 16,
        color: '#FFFFFF',
        opacity: 0.9,
        fontWeight: '500',
        ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif' } }),
    },
    userName: {
        fontSize: 24,
        color: '#FFFFFF',
        fontWeight: '700',
        marginTop: 4,
        ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
    },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingTop: 40,
    },
    featureCard: {
        marginBottom: 16,
        borderRadius: 20,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    cardGradient: {
        padding: 24,
        minHeight: 160,
        justifyContent: 'space-between',
    },
    cardIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8,
        ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif-medium' } }),
    },
    cardDescription: {
        fontSize: 14,
        color: '#FFFFFF',
        opacity: 0.9,
        lineHeight: 20,
        ...Platform.select({ ios: { fontFamily: 'System' }, android: { fontFamily: 'sans-serif' } }),
    },
    cardArrow: {
        position: 'absolute',
        right: 24,
        bottom: 24,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
