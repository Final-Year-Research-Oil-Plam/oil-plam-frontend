# Architecture Diagram & Visual Guide

## 🏗️ Overall Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ register.tsx │  │  login.tsx   │  │ add-tree.tsx │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    SERVICES LAYER                           │
│  ┌──────────────────────────┐  ┌──────────────────────────┐ │
│  │   services/auth/         │  │   services/tree/         │ │
│  │  ├── index.ts           │  │  ├── index.ts           │ │
│  │  ├── types.ts           │  │  ├── types.ts           │ │
│  │  └── validation.ts      │  │  ├── validation.ts      │ │
│  │                         │  │  └── utils.ts           │ │
│  └──────────────────────────┘  └──────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   CONFIG LAYER                              │
│         services/api-config.ts                              │
│    (API_BASE_URL, ApiResponse type)                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   API REQUESTS                              │
│  POST /api/auth/register      GET  /api/trees              │
│  POST /api/auth/login         POST /api/trees/add          │
│                               GET  /api/trees/:id          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND SERVER                            │
│  (processes requests, validates, stores in database)        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow Diagram

### Registration Flow
```
User Input
    │
    ├─→ validateRegistration()
    │   (Check: all fields filled, passwords match, length ≥ 6)
    │
    ├─→ registerUser()
    │   POST /api/auth/register
    │   Send: {nic, username, password, confirmPassword}
    │
    ├─→ Backend Response
    │   {success: true, message: "...", userId: 123}
    │
    └─→ Show Result & Navigate
```

### Login Flow
```
User Input
    │
    ├─→ validateLogin()
    │   (Check: username & password filled)
    │
    ├─→ loginUser()
    │   POST /api/auth/login
    │   Send: {username, password}
    │
    ├─→ Backend Response
    │   {success: true, userId: 123, username: "..."}
    │
    └─→ Navigate to Home
```

### Add Tree Flow
```
User Input
    │
    ├─→ calculateTreeAge()
    │   (Auto-calculate from plantedDate)
    │
    ├─→ formatDateDisplay()
    │   (Show user: "May 15, 2022")
    │
    ├─→ validateTreeForm()
    │   (Check: blockId & plantedDate provided)
    │
    ├─→ addTree()
    │   POST /api/trees/add
    │   Send: {blockId, plantedDate, age, ...}
    │
    ├─→ Backend Response
    │   {success: true, data: {treeNumber: "001"}}
    │
    └─→ Show Result & Go Back
```

---

## 🎯 Service Module Breakdown

### Auth Module
```
services/auth/
├── types.ts
│   └── RegisterFormData, LoginFormData, AuthResponse
│
├── validation.ts
│   ├── validateRegistration({nic, username, password, confirmPassword})
│   │   ├─ Check: nic, username, password, confirmPassword not empty
│   │   ├─ Check: password === confirmPassword
│   │   ├─ Check: password.length >= 6
│   │   └─ Return: {valid: boolean, error?: string}
│   │
│   └── validateLogin({username, password})
│       ├─ Check: username not empty
│       ├─ Check: password not empty
│       └─ Return: {valid: boolean, error?: string}
│
└── index.ts
    ├── registerUser(nic, username, password, confirmPassword)
    │   └─ POST to /auth/register → ApiResponse
    │
    ├── loginUser(username, password)
    │   └─ POST to /auth/login → ApiResponse
    │
    └── (Exports validation functions)
```

### Tree Module
```
services/tree/
├── types.ts
│   ├── TreeFormData (internal form structure)
│   ├── TreeData (API request structure)
│   └── TreeResponse (API response structure)
│
├── validation.ts
│   ├── validateTreeForm(formData)
│   │   ├─ Check: blockId not empty
│   │   ├─ Check: plantedDate provided
│   │   └─ Return: {valid: boolean, error?: string}
│   │
│   ├── validateGpsCoordinates(lat, lng)
│   │   └─ Check: both lat & lng provided
│   │
│   └── validateFertilizerQty(qty)
│       └─ Check: qty is valid number
│
├── utils.ts
│   ├── formatDate(date: Date) → "YYYY-MM-DD"
│   ├── formatDateDisplay(dateString) → "Mon DD, YYYY"
│   ├── calculateTreeAge(plantedDate) → number (years)
│   ├── isValidDate(dateString) → boolean
│   └── isDateInPast(dateString) → boolean
│
└── index.ts
    ├── addTree(treeData) → POST /trees/add
    ├── getTreeById(treeId) → GET /trees/:id
    ├── getAllTrees() → GET /trees
    └── (Exports all utilities & validations)
```

---

## 📍 File Locations & Purposes

```
oil-plam-frontend/
├── app/
│   ├── register.tsx        ← Registration UI (uses @/services/auth)
│   ├── login.tsx           ← Login UI (uses @/services/auth)
│   └── add-tree.tsx        ← Add tree UI (uses @/services/tree)
│
└── services/
    ├── api-config.ts       ← API_BASE_URL & shared types
    ├── index.ts            ← Barrel export (main entry point)
    │
    ├── auth/               ← Authentication module
    │   ├── index.ts        ├─ registerUser(), loginUser()
    │   ├── types.ts        ├─ AuthResponse, LoginFormData, etc.
    │   └── validation.ts   └─ validateRegistration(), validateLogin()
    │
    └── tree/               ← Tree operations module
        ├── index.ts        ├─ addTree(), getTreeById(), getAllTrees()
        ├── types.ts        ├─ TreeFormData, TreeData, TreeResponse
        ├── validation.ts   ├─ validateTreeForm(), etc.
        └── utils.ts        └─ formatDate(), calculateTreeAge(), etc.
```

---

## 🔄 Dependency Chain

```
register.tsx
    ↓
    ├─ imports: @/services/auth
    │   ├─ registerUser()
    │   └─ validateRegistration()
    │       ↓
    │       uses: types.ts (RegisterFormData)
    │
    └─ makes API call to:
        /api/auth/register

login.tsx
    ↓
    ├─ imports: @/services/auth
    │   ├─ loginUser()
    │   └─ validateLogin()
    │       ↓
    │       uses: types.ts (LoginFormData)
    │
    └─ makes API call to:
        /api/auth/login

add-tree.tsx
    ↓
    ├─ imports: @/services/tree
    │   ├─ addTree()
    │   ├─ validateTreeForm()
    │   ├─ calculateTreeAge()
    │   ├─ formatDateDisplay()
    │   ├─ formatDate()
    │   └─ types: TreeFormData, TreeData
    │
    └─ makes API call to:
        /api/trees/add
```

---

## 🎬 Execution Timeline

### Registration (Step by Step)
```
Time  Event
────  ─────────────────────────────────────────────────────────
  0ms  User opens /register screen
 50ms  User fills form with data
100ms  User clicks "Create Account"
150ms  validateRegistration() executes
200ms  All validations pass ✅
250ms  registerUser() makes HTTP POST
300ms  ... waiting for server response ...
500ms  Server responds: {success: true}
550ms  Alert shown: "Registration successful!"
600ms  router.replace('/login') navigates to login screen
650ms  Login screen displays
```

### Login (Step by Step)
```
Time  Event
────  ─────────────────────────────────────────────────────────
  0ms  User on /login screen
 50ms  User enters username & password
100ms  User clicks "Sign In"
150ms  validateLogin() executes
200ms  All validations pass ✅
250ms  loginUser() makes HTTP POST
300ms  ... waiting for server response ...
500ms  Server responds: {success: true, userId: 123}
550ms  Alert shown or auto-navigate
600ms  router.replace('/home') navigates home
650ms  Home screen displays with user ID 123
```

### Add Tree (Step by Step)
```
Time  Event
────  ─────────────────────────────────────────────────────────
  0ms  User on /add-tree screen
 50ms  User enters Block ID
100ms  User clicks "Planted Date"
150ms  Calendar picker opens
200ms  User selects "2022-05-15"
250ms  formatDate() converts to "2022-05-15" string
300ms  calculateTreeAge() calculates age = 3 years
350ms  useEffect sets formData.age = 3
400ms  formatDateDisplay() shows "May 15, 2022" to user
450ms  User fills remaining fields
500ms  User clicks "Save Tree"
550ms  validateTreeForm() checks inputs
600ms  All validations pass ✅
650ms  TreeData object prepared
700ms  addTree() makes HTTP POST
750ms  ... waiting for server response ...
950ms  Server responds: {success: true, treeNumber: "001"}
1000ms Alert shown: "Tree 001 added!"
1050ms router.back() goes to previous screen
1100ms Tree data saved in database ✅
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Input | Output |
|--------|----------|-------|--------|
| POST | `/auth/register` | {nic, username, password, confirmPassword} | {success, userId, message} |
| POST | `/auth/login` | {username, password} | {success, userId, username, message} |

### Trees
| Method | Endpoint | Input | Output |
|--------|----------|-------|--------|
| POST | `/trees/add` | {blockId, plantedDate, age, ...} | {success, treeNumber, message} |
| GET | `/trees/:id` | (in URL) | {success, data: {treeNumber, blockId, ...}} |
| GET | `/trees` | none | {success, data: [{...}, {...}]} |

---

## ✅ Validation Rules

### Registration Validation
```
Input: {nic, username, password, confirmPassword}

Rule 1: All fields must be filled
  ✗ Error: "Please fill in all fields"

Rule 2: Passwords must match
  ✗ Error: "Passwords do not match"

Rule 3: Password must be at least 6 characters
  ✗ Error: "Password must be at least 6 characters"

Result: {valid: true} or {valid: false, error: "..."}
```

### Login Validation
```
Input: {username, password}

Rule 1: Both fields must be filled
  ✗ Error: "Please enter username and password"

Result: {valid: true} or {valid: false, error: "..."}
```

### Tree Form Validation
```
Input: {blockId, plantedDate, ...}

Rule 1: Block ID must not be empty
  ✗ Error: "Please enter Block ID"

Rule 2: Planted Date must be provided
  ✗ Error: "Please enter Planted Date"

Result: {valid: true} or {valid: false, error: "..."}
```

---

## 📈 Benefits of This Architecture

| Benefit | How It Works | Example |
|---------|--------------|---------|
| **Reusability** | Functions in utils/ can be used anywhere | formatDate() used in multiple screens |
| **Maintainability** | Validation logic is centralized | Update one validateTreeForm() rule applies everywhere |
| **Testability** | Each function is independent | Can test formatDate() without UI |
| **Type Safety** | TypeScript prevents errors | Types defined once, checked everywhere |
| **Easy Navigation** | Know where each type of code is | Need validation? Check services/*/validation.ts |
| **Scalability** | Easy to add new features | Need to get all trees? Already have getAllTrees() |

---

## 🚀 Quick Start Examples

### To Use Registration
```tsx
import { registerUser, validateRegistration } from '@/services/auth';

const validation = validateRegistration({nic, username, password, confirmPassword});
if (validation.valid) {
  const response = await registerUser(nic, username, password, confirmPassword);
  if (response.success) {
    // Success!
  }
}
```

### To Use Login
```tsx
import { loginUser, validateLogin } from '@/services/auth';

const validation = validateLogin({username, password});
if (validation.valid) {
  const response = await loginUser(username, password);
  if (response.success) {
    // Success!
  }
}
```

### To Add Tree
```tsx
import { addTree, validateTreeForm, calculateTreeAge } from '@/services/tree';

const age = calculateTreeAge(plantedDate);
const validation = validateTreeForm({blockId, plantedDate, ...});
if (validation.valid) {
  const response = await addTree(treeData);
  if (response.success) {
    // Tree added!
  }
}
```

