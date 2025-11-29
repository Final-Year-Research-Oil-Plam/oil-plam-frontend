# ✅ Step-by-Step Working Guide

## 🎯 How Everything Works Together

### Overview
The application is split into **3 main modules**:
1. **Auth Module** - Registration & Login
2. **Tree Module** - Add, Get Trees
3. **API Config** - Shared configuration

---

## 📌 Module 1: Authentication (Register & Login)

### File Structure
```
services/auth/
├── index.ts           ← API calls (registerUser, loginUser)
├── types.ts          ← Data types
└── validation.ts     ← Form validation
```

### What Each File Does

#### `auth/types.ts` - Data Shapes
```typescript
// Defines what data looks like:
RegisterFormData {
  nic: string              // National ID
  username: string
  password: string
  confirmPassword: string
}

LoginFormData {
  username: string
  password: string
}
```

#### `auth/validation.ts` - Check Input
```typescript
// Checks if user input is valid BEFORE sending to API
validateRegistration({...}) → { valid: true/false, error?: "..." }
validateLogin({...})        → { valid: true/false, error?: "..." }
```

#### `auth/index.ts` - Talk to Backend
```typescript
// Makes HTTP requests to backend server
registerUser(nic, username, password, confirmPassword)
  → Sends POST to /auth/register
  → Returns { success: true/false, message: "..." }

loginUser(username, password)
  → Sends POST to /auth/login
  → Returns { success: true/false, userId: 123 }
```

---

### Registration Step-by-Step

**1️⃣ User fills form in `register.tsx`**
```tsx
NIC: "123456789"
Username: "farmer_john"
Password: "Pass@123"
Confirm: "Pass@123"
```

**2️⃣ Import validation**
```tsx
import { validateRegistration } from '@/services/auth';

const validation = validateRegistration({
  nic, username, password, confirmPassword
});
```

**3️⃣ Check if input is valid**
```typescript
// In validation.ts, it checks:
✅ All fields are filled
✅ Passwords match
✅ Password length ≥ 6
```

**4️⃣ If valid, call API**
```tsx
import { registerUser } from '@/services/auth';

const response = await registerUser(nic, username, password, confirmPassword);
```

**5️⃣ Handle response**
```tsx
if (response.success) {
  Alert.alert('Success', 'Registration successful!');
  router.replace('/login');
} else {
  Alert.alert('Error', response.message);
}
```

---

### Login Step-by-Step

**1️⃣ User fills login form**
```tsx
Username: "farmer_john"
Password: "Pass@123"
```

**2️⃣ Validate input**
```tsx
import { validateLogin } from '@/services/auth';

const validation = validateLogin({ username, password });
```

**3️⃣ Call API**
```tsx
import { loginUser } from '@/services/auth';

const response = await loginUser(username, password);
```

**4️⃣ Backend returns**
```typescript
{
  success: true,
  userId: 123,
  username: "farmer_john",
  message: "Login successful"
}
```

**5️⃣ Navigate to home**
```tsx
if (response.success) {
  router.replace('/home');
}
```

---

## 🌳 Module 2: Tree Operations (Add Trees)

### File Structure
```
services/tree/
├── index.ts           ← API calls (addTree, getTreeById, etc.)
├── types.ts          ← Data types
├── validation.ts     ← Form validation
└── utils.ts          ← Helper functions (date, age, etc.)
```

### What Each File Does

#### `tree/types.ts` - Data Shapes
```typescript
TreeFormData {
  blockId: string             // Which block
  treeNumber: string          // Auto-generated
  latitude: number | null     // GPS location
  longitude: number | null
  placeId: string            // Google Maps ID
  plantedDate: string        // "2022-05-15"
  age: number                // Auto-calculated
  fertilizerType: string
  fertilizerQty: string
  lastFertilizerDate: string
  lastPruningDate: string
  lastWeedingDate: string
}
```

#### `tree/validation.ts` - Check Input
```typescript
validateTreeForm({...})
  ✅ Block ID is not empty
  ✅ Planted Date is provided
  → Returns: { valid: true/false, error?: "..." }

validateGpsCoordinates(lat, lng)
  ✅ Both latitude and longitude are provided
  → Returns: true/false

validateFertilizerQty(qty)
  ✅ Quantity is a valid number
  → Returns: true/false
```

#### `tree/utils.ts` - Utility Functions
```typescript
formatDate(dateObject) 
  "2025-05-15" ← Takes JavaScript Date object
  
formatDateDisplay(dateString)
  "May 15, 2025" ← Takes "2025-05-15"

calculateTreeAge(plantedDate)
  3 years ← Calculates from "2022-05-15" to today

isValidDate(dateString)
  true/false ← Checks if date format is correct

isDateInPast(dateString)
  true/false ← Checks if date is before today
```

#### `tree/index.ts` - API Calls
```typescript
addTree(treeData)
  → POST to /trees/add
  → Returns: { success: true, data: {...}, treeNumber: "001" }

getTreeById(treeId)
  → GET from /trees/123
  → Returns: { success: true, data: {...} }

getAllTrees()
  → GET from /trees
  → Returns: { success: true, data: [{...}, {...}] }
```

---

### Add Tree Step-by-Step

**1️⃣ User opens add-tree form**
```tsx
import {
  addTree,
  validateTreeForm,
  calculateTreeAge,
  formatDateDisplay,
  type TreeFormData,
} from '@/services/tree';
```

**2️⃣ User enters Block ID**
```tsx
blockId: "BLOCK-A1"
```

**3️⃣ User selects Planted Date from calendar**
```tsx
<TouchableOpacity onPress={handlePlantedDatePress}>
  Select Planted Date
</TouchableOpacity>

// Calendar picker opens → User selects "2022-05-15"
// formatDate() converts to "2022-05-15" format
```

**4️⃣ Age auto-calculates**
```tsx
useEffect(() => {
  const age = calculateTreeAge(formData.plantedDate);
  // Age becomes: 3 years
}, [formData.plantedDate]);
```

**5️⃣ Display formatted date to user**
```tsx
<Text>
  {formatDateDisplay(formData.plantedDate)}
  // Shows: "May 15, 2022"
</Text>
```

**6️⃣ User fills remaining fields**
```tsx
fertilizerType: "NPK"
fertilizerQty: "10"
latitude: 6.9271  (from GPS)
longitude: 80.7744 (from GPS)
```

**7️⃣ Validate all inputs**
```tsx
const validation = validateTreeForm(formData);
// Checks:
// ✅ blockId is not empty
// ✅ plantedDate is selected

if (!validation.valid) {
  Alert.alert('Error', validation.error);
  return; // Stop here
}
```

**8️⃣ Prepare data for API**
```tsx
const treeData: TreeData = {
  blockId: "BLOCK-A1",
  plantedDate: "2022-05-15",
  age: 3,
  latitude: 6.9271,
  longitude: 80.7744,
  fertilizerType: "NPK",
  fertilizerQty: "10",
  // ... other fields
};
```

**9️⃣ Send to backend**
```tsx
const response = await addTree(treeData);
// Sends POST to: /api/trees/add
// With: { blockId, plantedDate, age, latitude, longitude, ... }
```

**🔟 Handle response**
```tsx
if (response.success) {
  Alert.alert('Success', `Tree ${response.data.treeNumber} added!`);
  router.back(); // Go back to previous screen
} else {
  Alert.alert('Error', response.message);
}
```

---

## 🔌 Module 3: API Configuration

### File: `api-config.ts`
```typescript
// This is where the API URL is defined:
const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.39:3000/api'  // Development
  : 'https://your-production-api.com/api'; // Production

// All services use this base URL
```

### All Services Connect Here
```
registerUser() ──→ API_BASE_URL + '/auth/register'
loginUser()    ──→ API_BASE_URL + '/auth/login'
addTree()      ──→ API_BASE_URL + '/trees/add'
getTreeById()  ──→ API_BASE_URL + '/trees/:id'
getAllTrees()  ──→ API_BASE_URL + '/trees'
```

---

## 🔄 Complete Workflow Example

### Full Registration & Login Journey

```
┌─────────────────────────────────────────────────┐
│  User opens app → Sees Login screen             │
└─────────────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────┐
│  User clicks "Create Account" → Register screen │
└─────────────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────┐
│  User fills registration form:                  │
│  NIC: 123456789                                 │
│  Username: farmer_john                          │
│  Password: Pass@123                             │
│  Confirm: Pass@123                              │
└─────────────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────┐
│  validateRegistration() checks:                 │
│  ✅ All fields filled                           │
│  ✅ Passwords match                             │
│  ✅ Password length ≥ 6                         │
└─────────────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────┐
│  registerUser() sends to backend:               │
│  POST /api/auth/register {                      │
│    nic, username, password, confirmPassword     │
│  }                                              │
└─────────────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────┐
│  Backend processes & responds:                  │
│  {                                              │
│    success: true,                               │
│    message: "User created successfully",        │
│    userId: 1                                    │
│  }                                              │
└─────────────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────┐
│  App shows: "Registration successful!"          │
│  Navigates → Login screen                       │
└─────────────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────┐
│  User enters credentials:                       │
│  Username: farmer_john                          │
│  Password: Pass@123                             │
└─────────────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────┐
│  validateLogin() checks:                        │
│  ✅ Username entered                            │
│  ✅ Password entered                            │
└─────────────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────┐
│  loginUser() sends to backend:                  │
│  POST /api/auth/login {                         │
│    username, password                           │
│  }                                              │
└─────────────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────┐
│  Backend processes & responds:                  │
│  {                                              │
│    success: true,                               │
│    userId: 1,                                   │
│    username: "farmer_john"                      │
│  }                                              │
└─────────────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────┐
│  App navigates → Home screen                    │
│  User is now logged in! ✅                      │
└─────────────────────────────────────────────────┘
```

---

## 📊 Full Add Tree Journey

```
┌──────────────────────────────────────┐
│  User clicks "Add Tree" button        │
└──────────────────────────────────────┘
                │
                ↓
┌──────────────────────────────────────┐
│  Add Tree form opens                 │
└──────────────────────────────────────┘
                │
                ↓
┌──────────────────────────────────────┐
│  User enters Block ID: "BLOCK-A1"     │
└──────────────────────────────────────┘
                │
                ↓
┌──────────────────────────────────────┐
│  User taps "Planted Date"             │
│  Calendar picker opens                │
└──────────────────────────────────────┘
                │
                ↓
┌──────────────────────────────────────┐
│  formatDate() converts selection      │
│  Date object → "2022-05-15"           │
└──────────────────────────────────────┘
                │
                ↓
┌──────────────────────────────────────┐
│  calculateTreeAge() computes:         │
│  "2022-05-15" → 3 years               │
│  Sets: formData.age = 3               │
└──────────────────────────────────────┘
                │
                ↓
┌──────────────────────────────────────┐
│  formatDateDisplay() shows user:      │
│  "2022-05-15" → "May 15, 2022"        │
└──────────────────────────────────────┘
                │
                ↓
┌──────────────────────────────────────┐
│  User enters other fields:            │
│  Fertilizer, GPS location, dates      │
└──────────────────────────────────────┘
                │
                ↓
┌──────────────────────────────────────┐
│  User clicks "Save Tree"              │
└──────────────────────────────────────┘
                │
                ↓
┌──────────────────────────────────────┐
│  validateTreeForm() checks:           │
│  ✅ Block ID filled                   │
│  ✅ Planted Date selected             │
└──────────────────────────────────────┘
                │
                ↓
┌──────────────────────────────────────┐
│  If not valid:                        │
│  Show error & stop ❌                 │
│                                       │
│  If valid: Continue ✅                │
└──────────────────────────────────────┘
                │
                ↓
┌──────────────────────────────────────┐
│  Prepare TreeData object:             │
│  {                                    │
│    blockId: "BLOCK-A1",               │
│    plantedDate: "2022-05-15",         │
│    age: 3,                            │
│    latitude: 6.9271,                  │
│    longitude: 80.7744,                │
│    ...                                │
│  }                                    │
└──────────────────────────────────────┘
                │
                ↓
┌──────────────────────────────────────┐
│  addTree() sends to backend:          │
│  POST /api/trees/add {                │
│    blockId, plantedDate, age, ...     │
│  }                                    │
└──────────────────────────────────────┘
                │
                ↓
┌──────────────────────────────────────┐
│  Backend processes:                   │
│  - Validates data                     │
│  - Stores in database                 │
│  - Generates tree number: "001"       │
└──────────────────────────────────────┘
                │
                ↓
┌──────────────────────────────────────┐
│  Backend responds:                    │
│  {                                    │
│    success: true,                     │
│    data: {                            │
│      treeNumber: "001",               │
│      ...                              │
│    }                                  │
│  }                                    │
└──────────────────────────────────────┘
                │
                ↓
┌──────────────────────────────────────┐
│  App shows: "Tree 001 added!"         │
│  Goes back to previous screen         │
│  Tree is now in database! ✅          │
└──────────────────────────────────────┘
```

---

## ✨ Summary

### When Registration Happens
1. User fills form → validation.ts checks → API call → Backend → Response → Navigate to login

### When Login Happens
1. User fills form → validation.ts checks → API call → Backend → Response → Navigate to home

### When Adding Tree
1. User fills form → utilities format & calculate → validation.ts checks → API call → Backend → Response → Tree saved!

### Key Points
- ✅ **Validation happens BEFORE API call** (saves bandwidth)
- ✅ **All utility functions are reusable** (same function in multiple screens)
- ✅ **Types are centralized** (one source of truth)
- ✅ **Errors are handled consistently** (same pattern everywhere)
- ✅ **Easy to test** (each function is independent)

