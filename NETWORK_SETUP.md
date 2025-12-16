# 🌐 Network Configuration Guide

## Quick Setup for Different Networks

Your app is configured to work on **any network** (WiFi, Mobile Hotspot, etc.). When you switch networks, you only need to update **ONE line** in one file.

---

## 🚀 How It Works Now

### **iOS Simulator** ✅
- Uses: `http://localhost:3000/api`
- **No configuration needed!**
- Works automatically because simulator runs on your Mac

### **Android Emulator** ✅
- Uses: `http://10.0.2.2:3000/api`
- **No configuration needed!**
- `10.0.2.2` is Android's special address for host machine

### **Physical Devices (iPhone/Android)** 📱
- Uses: Your network IP (needs to be updated when switching networks)
- Currently set to: `172.20.10.2` (your mobile hotspot)

---

## 📝 When You Switch Networks

### Step 1: Get Your New IP Address

Run this command:
```bash
npm run get-ip
```

Or manually:
```bash
./scripts/get-ip.sh
```

This will show you your current network IP, for example:
```
✅ Recommended IP to use: 172.20.10.2
```

### Step 2: Update the Configuration

1. Open: `services/api-config.ts`
2. Find this line (around line 14):
```typescript
const YOUR_NETWORK_IP = '172.20.10.2';
```
3. Replace with your new IP:
```typescript
const YOUR_NETWORK_IP = '192.168.1.50'; // Your new IP here
```
4. Save the file
5. Restart your Expo app (press `R` in terminal)

---

## 🌍 Common Network Scenarios

### Mobile Hotspot (Current Setup)
- **IP Pattern**: `172.20.10.x` or `192.168.43.x`
- **Your Current IP**: `172.20.10.2` ✅
- **Works for**: Emulators, Simulators, Physical devices on same hotspot

### Home WiFi
- **IP Pattern**: Usually `192.168.1.x` or `192.168.0.x`
- **Example**: `192.168.1.50`
- **How to update**: Run `npm run get-ip` and update `YOUR_NETWORK_IP`

### Office/University WiFi
- **IP Pattern**: Varies (could be `10.x.x.x`, `172.16.x.x`, etc.)
- **How to update**: Run `npm run get-ip` and update `YOUR_NETWORK_IP`

---

## ⚠️ Important Notes

1. **Emulators/Simulators**: Work automatically, no IP update needed
2. **Physical Devices**: Must be on the **same network** as your Mac
3. **Backend Server**: Must be running on your Mac at port `3000`
4. **Network Change**: Update IP in `api-config.ts` whenever you switch networks

---

## 🧪 Testing the Connection

### Test iOS Simulator
```bash
npm run ios
```
Should connect to `localhost:3000` automatically ✅

### Test Android Emulator
```bash
npm run android
```
Should connect to `10.0.2.2:3000` automatically ✅

### Test Physical Device
1. Make sure device is on same network as your Mac
2. Update `YOUR_NETWORK_IP` to match current network
3. Scan QR code from Expo
4. Try registering a user

---

## 🔧 Troubleshooting

### "Network Error" on physical device
- ✅ Check device is on same WiFi/Hotspot as Mac
- ✅ Run `npm run get-ip` to get correct IP
- ✅ Update `YOUR_NETWORK_IP` in `api-config.ts`
- ✅ Restart Expo (press `R`)

### "Network Error" on Android Emulator
- ✅ Make sure using `10.0.2.2`, not `localhost`
- ✅ Check backend is running on port 3000
- ✅ Restart emulator

### Backend not responding
- ✅ Check backend server is running: `http://localhost:3000/api`
- ✅ Test in browser: `http://localhost:3000/api/health`
- ✅ Check backend logs for errors

---

## 📋 Checklist When Changing Networks

- [ ] Run `npm run get-ip` to get new IP
- [ ] Update `YOUR_NETWORK_IP` in `services/api-config.ts`
- [ ] Save the file
- [ ] Restart Expo app (press `R` in terminal)
- [ ] Test registration/login

---

## 🎯 Current Configuration

**File**: `services/api-config.ts`
```typescript
const YOUR_NETWORK_IP = '172.20.10.2'; // Mobile Hotspot IP
```

**This works for**:
- ✅ iOS Simulator (uses localhost)
- ✅ Android Emulator (uses 10.0.2.2)
- ✅ Physical devices on mobile hotspot (uses 172.20.10.2)
