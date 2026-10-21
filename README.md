# National Philately Web Community & Account Manager

A full-stack MERN application for stamp collectors to catalog, trade, discuss, and manage their philately collections.

## Tech Stack
- **Frontend**: React (Vite) + React Router + Axios
- **Backend**: Node.js + Express.js
- **Database**: MongoDB Atlas (Mongoose ODM)
- **Auth**: JWT + bcrypt

## Features
- 🔐 User Authentication (Register/Login/JWT)
- 📮 Stamp Catalog (CRUD, search, filter, pagination)
- 💬 Community Forum (Posts, Comments, Likes)
- 🔄 Trading/Exchange System (offer/accept/reject/complete)
- 👤 Account Management (Profile, Collection, Password)
- 🛡️ Admin Dashboard (stats, charts, user management)

---

## ⚠️ CRITICAL FIRST STEP: Configure MongoDB Atlas

### Step 1 — Create Atlas Cluster
1. Go to https://mongodb.com/cloud/atlas
2. Create a free **M0 cluster**
3. **Database Access** → Add user with read/write
4. **Network Access** → Add IP `0.0.0.0/0` (dev only)
5. Click **Connect** → **Drivers** → Copy connection string

### Step 2 — Update server/.env
```
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/philately?retryWrites=true&w=majority
JWT_SECRET=your_secure_secret_key
PORT=5000
CLIENT_URL=http://localhost:5173
```

---

## Running the Application

### Backend (Terminal 1)
```bash
cd server
npm install
npm run dev
# Runs at http://localhost:5000
```

### Frontend (Terminal 2)
```bash
cd client
npm install
npm run dev
# Runs at http://localhost:5173
```

### Or run both from root
```bash
npm install
npm run dev
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | Public | Register |
| POST | /api/auth/login | Public | Login |
| GET | /api/auth/me | User | Get profile |
| PUT | /api/auth/profile | User | Update profile |
| PUT | /api/auth/password | User | Change password |
| GET | /api/stamps | Public | List stamps |
| POST | /api/stamps | User | Add stamp |
| GET | /api/stamps/:id | Public | Stamp detail |
| PUT | /api/stamps/:id | Owner/Admin | Update |
| DELETE | /api/stamps/:id | Owner/Admin | Delete |
| GET | /api/forum | Public | Forum posts |
| POST | /api/forum | User | Create post |
| GET | /api/forum/:id | Public | Post detail |
| POST | /api/forum/:id/comments | User | Add comment |
| PUT | /api/forum/:id/like | User | Toggle like |
| DELETE | /api/forum/:id | Author/Admin | Delete post |
| GET | /api/trades | User | My trades |
| POST | /api/trades | User | Create offer |
| PUT | /api/trades/:id/status | User | Accept/Reject |
| GET | /api/admin/stats | Admin | Dashboard stats |
| GET | /api/admin/users | Admin | All users |
| PUT | /api/admin/users/:id/toggle-active | Admin | Toggle active |
| DELETE | /api/admin/users/:id | Admin | Delete user |

---

## Creating an Admin Account

After registering, open MongoDB Atlas UI and run:
```js
db.users.updateOne({ email: "your@email.com" }, { $set: { role: "admin" } })
```

---

## Design Highlights
- Dark mode glassmorphism UI
- Inter + Playfair Display fonts (Google Fonts)
- Animated hero with gradient glow
- Toast notifications (react-hot-toast)
- Fully responsive (mobile + desktop)
