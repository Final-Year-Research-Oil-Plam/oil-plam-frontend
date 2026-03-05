import React from 'react';
import { Stack } from 'expo-router';

export default function ScreensLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home/home" options={{ headerShown: false }} />
      <Stack.Screen name="login/login" options={{ headerShown: false }} />
      <Stack.Screen name="register/register" options={{ headerShown: false }} />
      <Stack.Screen name="addTree/add-tree" options={{ headerShown: false }} />
      <Stack.Screen name="qrscan/qr-scan" options={{ headerShown: false }} />
      <Stack.Screen name="searchTree/search-tree" options={{ headerShown: false }} />
      <Stack.Screen name="predictBunch/predictbunch" options={{ headerShown: false }} />
      <Stack.Screen name="predictBunch/prediction-result" options={{ headerShown: false }} />
    </Stack>
  );
}
