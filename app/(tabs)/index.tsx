import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function StartupScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.replace('/Screens/login/login');
  };

  const handleSignIn = () => {
    router.replace('/Screens/login/login');
  };

  return (
    <LinearGradient
      colors={['#1B5E20', '#2E7D32', '#388E3C']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between', paddingHorizontal: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo and Title Section */}
          <View style={{ paddingTop: 40, alignItems: 'center' }}>
            {/* Glow effect circle */}
            <View
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <Ionicons name="leaf" size={70} color="#4CAF50" />
            </View>

            <Text
              style={{
                fontSize: 36,
                fontWeight: Platform.OS === 'ios' ? '700' : 'bold',
                color: '#FFFFFF',
                marginBottom: 8,
                textAlign: 'center',
              }}
            >
              PalmHarvest Pro
            </Text>

            <Text
              style={{
                fontSize: 16,
                color: '#E8F5E9',
                marginBottom: 5,
                textAlign: 'center',
                fontWeight: '500',
              }}
            >
              Smart Oil Palm Management
            </Text>

            <Text
              style={{
                fontSize: 13,
                color: '#BDBDBD',
                textAlign: 'center',
                marginBottom: 30,
              }}
            >
              Track, manage, and optimize your plantation
            </Text>
          </View>

          {/* Features Section */}
          <View style={{ marginVertical: 30 }}>
            <FeatureItem
              icon="location"
              title="GPS Tracking"
              description="Track the exact location of each palm tree"
            />
            <FeatureItem
              icon="calendar"
              title="Planting Dates"
              description="Monitor planting dates and tree age"
            />
            <FeatureItem
              icon="water"
              title="Fertilizer Management"
              description="Track fertilizer application schedules"
            />
          </View>

          {/* CTA Buttons Section */}
          <View style={{ marginBottom: 30 }}>
            {/* Get Started Button */}
            <TouchableOpacity
              onPress={handleGetStarted}
              activeOpacity={0.8}
              style={{ marginBottom: 12 }}
            >
              <LinearGradient
                colors={['#FFFFFF', '#F5F5F5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                  borderRadius: 12,
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
                    color: '#1B5E20',
                  }}
                >
                  Get Started
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Sign In Link */}
            <TouchableOpacity onPress={handleSignIn} activeOpacity={0.7}>
              <Text
                style={{
                  fontSize: 14,
                  color: '#FFFFFF',
                  textAlign: 'center',
                  paddingVertical: 12,
                  fontWeight: '500',
                }}
              >
                Already have an account?{' '}
                <Text style={{ textDecorationLine: 'underline', fontWeight: '600' }}>
                  Sign In
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

interface FeatureItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

function FeatureItem({ icon, title, description }: FeatureItemProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        marginBottom: 20,
        alignItems: 'flex-start',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        padding: 16,
        borderRadius: 10,
      }}
    >
      <View
        style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: 'rgba(76, 175, 80, 0.3)',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 16,
        }}
      >
        <Ionicons name={icon} size={24} color="#4CAF50" />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 15,
            fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
            color: '#FFFFFF',
            marginBottom: 4,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: '#B0BEC5',
            lineHeight: 18,
          }}
        >
          {description}
        </Text>
      </View>
    </View>
  );
}
