# 🎙️ Meet-Up

> A modern, real-time video conferencing and collaboration platform designed with a cozy user experience, powered by **LiveKit SFU (Selective Forwarding Unit)**, **WebRTC**, **Socket.IO**, **NestJS**, and **React 19**.

[![LiveKit SFU](https://img.shields.io/badge/LiveKit-SFU_WebRTC-002B36?style=flat&logo=webrtc&logoColor=white)](https://livekit.io/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![React 19](https://img.shields.io/badge/React_19-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat&logo=redis&logoColor=white)](https://redis.io/)
[![WebRTC](https://img.shields.io/badge/WebRTC-333333?style=flat&logo=webrtc&logoColor=white)](https://webrtc.org/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Repository Structure](#-repository-structure)
- [Prerequisites](#-prerequisites)
- [Step-by-Step Setup Guide](#-step-by-step-setup-guide)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
- [Environment Configuration](#-environment-configuration)
  - [Backend (.env)](#backend-env)
  - [Frontend (.env)](#frontend-env)
- [Database & Docker Setup](#-database--docker-setup)
- [API & WebSocket Reference](#-api--websocket-reference)
  - [REST API Endpoints](#rest-api-endpoints)
  - [WebSocket Signaling Events](#websocket-signaling-events)
- [Available Scripts](#-available-scripts)
- [Troubleshooting & Gotchas](#-troubleshooting--gotchas)
- [Author & License](#-author--license)

---

## 🔭 Overview

**Meet-Up** is a full-stack, real-time video conferencing web application built for seamless communication and high-scalability collaboration. It features a modern **Selective Forwarding Unit (SFU)** media architecture powered by **LiveKit**, drastically cutting client bandwidth and CPU usage compared to traditional mesh WebRTC. Paired with a **NestJS** backend for JWT room token minting and meeting governance, **Socket.IO** for live signaling and friend notifications, and a responsive **React 19** frontend, Meet-Up delivers crystal-clear audio/video, screen sharing, customizable meeting spaces, live friend invitations, interactive dashboards, and meeting reports.

---

## ✨ Key Features

- **SFU Video & Audio Architecture (LiveKit & WebRTC)**:
  - **Selective Forwarding Unit (SFU)**: Each participant uploads their media tracks once to the LiveKit SFU server, which selectively routes streams to other participants—eliminating the $O(N^2)$ bandwidth bottleneck of mesh WebRTC.
  - **Cryptographic Access Tokens**: Room joins are guarded by cryptographically signed JWT tokens generated via `livekit-server-sdk` with granular permissions (`roomJoin`, `canPublish`, `canSubscribe`, `roomAdmin`).
  - **Dynamic Media Device Controls**: Instant camera toggle, mic mute/unmute, and local track lifecycle management.
  - **Screen Sharing**: High-resolution screen and window sharing with dedicated track publishing.
  - **Active Participant Focus & Pinning**: Focus on a designated speaker or presenter with interactive pin/unpin controls.
  - **Room Scalability & Quality Adaptation**: Scalable multi-participant rooms with dynamic track subscription and low latency.

- **Meeting Management**:
  - Instant room creation with randomized, human-readable codes (`xxxx-xxxx`).
  - Meeting categorization (`casualMeeting`, `formalMeeting`, `studyMeeting`, `otherMeeting`).
  - Lifecycle state tracking (`scheduled`, `ongoing`, `completed`, `cancelled`).
  - Meeting duration tracking and participant history.

- **Social & Friend System**:
  - Live friend search by name or email.
  - Friend requests pipeline (send, accept, reject, unfriend).
  - Instant in-room friend invitation via direct Socket.IO user channels (`user:${userId}`).

- **Dashboard & Analytics**:
  - Comprehensive dashboard overview cards for total users, meetings, and ongoing calls.
  - Meeting activity visualizer using Recharts.
  - Category distribution breakdowns and timeline metrics.
  - Direct CSV report export for audit and performance tracking.

- **Authentication & Security**:
  - Dual authentication: Local email/password authentication & Google OAuth 2.0.
  - Secure token architecture: Short-lived JWT `accessToken` (15m) and persistent `refreshToken` (7d) delivered via `httpOnly` secure cookies.
  - State-of-the-art Google OAuth flow using ephemeral one-time authorization codes (30s TTL in Redis) exchanged via POST to eliminate cookie-dropping issues on cross-domain 302 redirects.
  - Password reset workflows powered by Resend transactional emails.

- **Asset Storage & Cloud**:
  - User avatars stored on Cloudflare R2 (S3-compatible) with automatic Google OAuth high-res avatar synchronization.
  - Session caching and transient token storage via Redis / Upstash.

---

## 🏛️ System Architecture

```mermaid
flowchart TB
    subgraph Client ["Frontend (React 19 + Vite)"]
        UI[Tailwind CSS & Radix UI]
        RQ[TanStack Query & Zustand]
        LK_C[LiveKit Client Hook<br/>livekit-client]
        SIO_C[Socket.IO Client]
    end

    subgraph Server ["Backend (NestJS 11)"]
        REST[REST Controllers<br/>/api/auth, /api/meeting, etc.]
        LK_S[LiveKit Token Service<br/>/api/livekit/:roomId/token]
        GATEWAY[WebRTC Socket Gateway]
        AUTH_GUARD[JWT & Google Auth Guards]
    end

    subgraph Media ["SFU Media Infrastructure"]
        LIVEKIT[LiveKit SFU Server<br/>livekit/livekit-server]
    end

    subgraph Storage ["Databases & External Services"]
        MONGO[(MongoDB Database)]
        REDIS[(Redis Cache / Token Store)]
        R2[(Cloudflare R2 Object Storage)]
        RESEND[Resend Email Service]
        GOOGLE[Google OAuth 2.0]
    end

    UI --> RQ
    RQ --> REST
    LK_C <-->|1. Request Room Token| LK_S
    LK_C <=====>|2. WebRTC Audio/Video/Screen Tracks| LIVEKIT
    SIO_C <-->|In-Meeting Invites & Signaling| GATEWAY

    REST --> AUTH_GUARD
    REST --> MONGO
    REST --> REDIS
    REST --> R2
    REST --> RESEND
    LK_S --> MONGO
    LK_S -.->|Room Management| LIVEKIT
    AUTH_GUARD --> GOOGLE
    GATEWAY --> REDIS
    GATEWAY --> MONGO
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite 7](https://vitejs.dev/)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/), Radix UI primitives, Lucide Icons, React Icons
- **State & Data Fetching**: [TanStack Query v5](https://tanstack.com/query), [Zustand](https://zustand-demo.pmnd.rs/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Real-Time & SFU Media**: [LiveKit Client SDK](https://docs.livekit.io/realtime/client-sdks/javascript/) (`livekit-client`), [Socket.IO Client](https://socket.io/), WebRTC API
- **Charts & Visualization**: [Recharts](https://recharts.org/)
- **Forms & Validation**: `react-hook-form`, `zod`, `@hookform/resolvers`

### Backend
- **Framework**: [NestJS 11](https://nestjs.com/) (Express platform)
- **Language**: TypeScript
- **SFU Media Server & Token SDK**: [LiveKit Server SDK](https://github.com/livekit/server-sdk-js) (`livekit-server-sdk`), [LiveKit Server](https://livekit.io/)
- **Database ORM/ODM**: [Mongoose](https://mongoosejs.com/) with MongoDB
- **Caching & Ephemeral State**: [ioredis](https://github.com/redis/ioredis) (Redis / Upstash)
- **Signaling Server**: `@nestjs/websockets` & `@nestjs/platform-socket.io`
- **Authentication**: Passport.js (`passport-jwt`, `passport-google-oauth20`), bcryptjs
- **Object Storage**: AWS S3 SDK (`@aws-sdk/client-s3`) pointing to Cloudflare R2
- **Email Service**: [Resend](https://resend.com/)

---

## 📁 Repository Structure

```text
meet-up/
├── backend/                        # NestJS Backend Application
│   ├── docker-compose.yml          # Local MongoDB, Redis & LiveKit SFU definitions
│   ├── Dockerfile                  # Container build instructions
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── main.ts                 # Bootstrap, CORS & global pipes
│       ├── app.module.ts           # Root module & MongoDB integration
│       ├── auth/                   # Authentication (Local & Google OAuth)
│       ├── friend/                 # Friend request & user management
│       ├── livekit/                # LiveKit SFU token generation & room lifecycle
│       ├── meeting/                # Meeting scheduling & state management
│       ├── recent-log/             # Activity audit logs
│       ├── redis/                  # Redis connection provider
│       ├── report/                 # Meeting stats & CSV generation
│       ├── resend/                 # Transactional email service
│       ├── schemas/                # Mongoose models (User, Meeting, Friendship, RecentLog)
│       ├── strategy/               # JWT & Google OAuth Passport strategies
│       ├── upload/                 # Cloudflare R2 / S3 upload service
│       ├── utils/                  # Token generators & helpers
│       └── webrtc/                 # Socket.IO WebRTC signaling gateway
│
├── frontend/                       # React 19 Frontend Application
│   ├── package.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── App.tsx                 # Route declarations & query provider
│       ├── main.tsx                # React root mount
│       ├── components/             # Reusable UI primitives & layouts
│       │   ├── layout/             # Sidebar, Navbar, RootLayout
│       │   ├── ui/                 # Shadcn/Radix UI components
│       │   └── webrtc/             # MeetingRoom, MeetingPreview, MeetingMainPage
│       ├── pages/                  # Page containers & views
│       │   ├── auth/               # Login, Signup, ResetPassword, GoogleCallback
│       │   ├── dashboard/          # Analytics overview & quick launch
│       │   ├── friends/            # Friend listing, requests & search
│       │   ├── meeting/            # Meeting list & scheduler dialogs
│       │   ├── profile/            # User profile management
│       │   └── report/             # Visual reports & CSV export
│       └── util/                   # API hooks, Axios instance, LiveKit hook (livekit-hook.ts)
└── README.md                       # Project documentation
```

---

## 📋 Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **pnpm**: `v9.x` or `v10.x` (`npm install -g pnpm`)
- **Docker & Docker Compose**: For running MongoDB, Redis, and LiveKit SFU Server locally
- **MongoDB**: Local instance (`localhost:27017`) or [MongoDB Atlas](https://www.mongodb.com/atlas)
- **Redis**: Local instance (`localhost:6379`) or [Upstash Redis](https://upstash.com/)
- **LiveKit Server**: Running via Docker Compose (`livekit/livekit-server:latest`) or [LiveKit Cloud](https://cloud.livekit.io/)
- External service credentials (optional for full feature testing):
  - [Google Cloud Console](https://console.cloud.google.com/) for OAuth Client ID & Secret
  - [Cloudflare R2](https://developers.cloudflare.com/r2/) or AWS S3 for avatar storage
  - [Resend](https://resend.com/) for password reset emails

---

## 🚀 Step-by-Step Setup Guide

### 1. Clone Repository

```bash
git clone https://github.com/pratik2061/meet-up.git
cd meet-up
```

---

### 2. Backend Setup

#### Step 2.1: Navigate to backend & install dependencies
```bash
cd backend
pnpm install
```

#### Step 2.2: Configure environment variables
Create a `.env` file in the `backend/` directory:

```bash
cp .env.example .env   # Or create backend/.env manually
```

Populate `backend/.env` with your configuration:
```env
PORT=3000
NODE_ENV=development

# Database (MongoDB)
MONGODB_URI=mongodb://your_username:your_password@127.0.0.1:27017/your_db_name?authSource=admin

# Redis
REDIS_URL=redis://127.0.0.1:6379
REDIS_TTL=3600

# Authentication & JWT Secrets
ACCESS_SECRET=your_jwt_access_secret_key_min_32_characters
REFRESH_SECRET=your_jwt_refresh_secret_key_min_32_characters
ACCESS_EXPIRES_IN=900
REFRESH_EXPIRES_IN=604800

# Docker Compose Credentials (if using local docker)
MONGO_INITDB_ROOT_USERNAME=your_username
MONGO_INITDB_ROOT_PASSWORD=your_password

# Allowed Frontend URL for CORS & redirects
FRONTEND_URL=http://localhost:5173

# LiveKit SFU Media Server
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secret
LIVEKIT_URL=ws://127.0.0.1:7880

# Resend Mailer (Optional for dev)
RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM_EMAIL=no-reply@yourdomain.com

# Google OAuth (Optional for local dev)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Cloudflare R2 / S3 Storage (Optional for dev)
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=meetup
R2_PUBLIC_URL=https://pub-your-bucket-id.r2.dev
```

#### Step 2.3: Start Local Services (MongoDB, Redis & LiveKit SFU)
Start all supporting services via Docker Compose:
```bash
docker compose up -d
```
This boots up:
- **`meetup-mongo`**: MongoDB on port `27017`
- **`meetup-redis`**: Redis on port `6379`
- **`meetup-livekit`**: LiveKit SFU server on ports `7880`, `7881`, and `50000-50020/udp`

#### Step 2.4: Start the Backend Server
```bash
# Development mode with hot-reload
pnpm run dev

# Or build and run production
pnpm run build
pnpm run start:prod
```

The server will be available at: **`http://localhost:3000`**  
Health check endpoint: **`http://localhost:3000/api/health`**

---

### 3. Frontend Setup

#### Step 3.1: Open a new terminal, navigate to `frontend/` & install dependencies
```bash
cd frontend
pnpm install
```

#### Step 3.2: Configure environment variables
Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
VITE_LIVEKIT_URL=ws://localhost:7880
```

#### Step 3.3: Start Frontend Development Server
```bash
pnpm run dev
```

The application will be accessible at: **`http://localhost:5173`**

---

## ⚙️ Environment Configuration

### Backend (.env)

| Variable | Required | Default | Description |
|---|:---:|:---:|---|
| `PORT` | No | `3000` | Port on which the NestJS HTTP & WebSocket server listens |
| `NODE_ENV` | No | `development` | Environment mode (`development` or `production`) |
| `MONGODB_URI` | **Yes** | — | MongoDB connection string (Local or Atlas) |
| `REDIS_URL` | **Yes** | — | Redis connection URL (`redis://` or TLS `rediss://`) |
| `REDIS_TTL` | No | `3600` | Redis default cache TTL in seconds |
| `ACCESS_SECRET` | **Yes** | — | Secret key for signing JWT access tokens |
| `REFRESH_SECRET` | **Yes** | — | Secret key for signing JWT refresh tokens |
| `ACCESS_EXPIRES_IN` | No | `900` | Access token lifespan in seconds (15 min) |
| `REFRESH_EXPIRES_IN` | No | `604800` | Refresh token lifespan in seconds (7 days) |
| `FRONTEND_URL` | **Yes** | `http://localhost:5173` | Allowed CORS origin & OAuth redirection URL |
| `LIVEKIT_API_KEY` | **Yes** | `devkey` | API key for signing LiveKit SFU tokens |
| `LIVEKIT_API_SECRET` | **Yes** | `secret` | Secret key for signing LiveKit SFU tokens |
| `LIVEKIT_URL` | **Yes** | `ws://127.0.0.1:7880` | WebSocket URL to LiveKit SFU media server |
| `RESEND_API_KEY` | No | — | Resend API key for sending reset password emails |
| `RESEND_FROM_EMAIL` | No | — | From address for emails (`no-reply@domain.com`) |
| `GOOGLE_CLIENT_ID` | No | — | Google Cloud OAuth 2.0 Client ID |
| `GOOGLE_CLIENT_SECRET` | No | — | Google Cloud OAuth 2.0 Client Secret |
| `GOOGLE_CALLBACK_URL` | No | — | Callback endpoint for Google OAuth |
| `R2_ACCOUNT_ID` | No | — | Cloudflare Account ID for R2 storage |
| `R2_ACCESS_KEY_ID` | No | — | Cloudflare R2 Access Key |
| `R2_SECRET_ACCESS_KEY` | No | — | Cloudflare R2 Secret Access Key |
| `R2_BUCKET_NAME` | No | `meetup` | Bucket name for uploaded media |
| `R2_PUBLIC_URL` | No | — | Public CDN URL for serving R2 avatar assets |

### Frontend (.env)

| Variable | Required | Default | Description |
|---|:---:|:---:|---|
| `VITE_API_URL` | **Yes** | `http://localhost:3000/api` | Base URL for REST API calls |
| `VITE_SOCKET_URL` | **Yes** | `http://localhost:3000` | Base URL for Socket.IO signaling connection |
| `VITE_LIVEKIT_URL` | **Yes** | `ws://localhost:7880` | WebSocket URL to LiveKit SFU media server |

---

## 🐳 Database & Docker Setup

The project includes a `docker-compose.yml` file in `backend/` for quick local service provisioning:

```bash
# Start all containers (MongoDB, Redis, LiveKit SFU)
cd backend
docker compose up -d

# Check status of running containers
docker compose ps

# View LiveKit SFU server logs
docker compose logs -f meetup-livekit

# View database logs
docker compose logs -f meetup-mongo

# Stop containers
docker compose down
```

### Services included in `docker-compose.yml`:
- **`meetup-backend`**: Main NestJS application container (port `3000`)
- **`meetup-mongo`**: MongoDB document database (port `27017`)
- **`meetup-redis`**: Redis ephemeral cache & token store (port `6379`)
- **`meetup-livekit`**: LiveKit SFU server (port `7880` HTTP/WS, `7881` TCP fallback, `50000-50020/udp` WebRTC media)

---

## 📡 API & WebSocket Reference

### REST API Endpoints

#### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `POST` | `/api/auth/register` | Register new user (supports avatar upload) | No |
| `POST` | `/api/auth/login` | Login with email/password (sets cookies) | No |
| `POST` | `/api/auth/logout` | Clears authentication cookies & invalidates session | Yes |
| `GET` | `/api/auth/me` | Fetch currently authenticated user profile | Yes |
| `GET` | `/api/auth/refresh` | Refresh expired access token using refresh token | Yes |
| `PATCH` | `/api/auth/profile` | Update profile information or avatar | Yes |
| `POST` | `/api/auth/forgot-password`| Request password reset email | No |
| `POST` | `/api/auth/reset-password` | Reset password using emailed token | No |
| `GET` | `/api/auth/google` | Trigger Google OAuth 2.0 authentication | No |
| `GET` | `/api/auth/google/callback`| Google OAuth redirect callback | No |
| `POST` | `/api/auth/google/exchange`| Exchange one-time OAuth code for cookies | No |

#### LiveKit SFU (`/api/livekit`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/api/livekit/:roomId/token` | Mint signed LiveKit JWT access token with room permissions (`roomJoin`, `canPublish`, `canSubscribe`, `roomAdmin`) | Yes |

#### Meetings (`/api/meeting`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `POST` | `/api/meeting` | Create or schedule a new meeting room | Yes |
| `GET` | `/api/meeting` | Query user meetings (supports status & date filters) | Yes |
| `GET` | `/api/meeting/:roomId` | Fetch meeting metadata | Yes |
| `GET` | `/api/meeting/:roomId/validate` | Verify if user can join meeting room | Yes |
| `POST` | `/api/meeting/:roomId/end` | Mark meeting as ended (host only) | Yes |
| `PATCH`| `/api/meeting/:roomId/cancel` | Cancel a scheduled meeting | Yes |
| `PATCH`| `/api/meeting/:roomId` | Update meeting details | Yes |

#### Friends (`/api/friends`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/api/friends` | List accepted friends | Yes |
| `GET` | `/api/friends/requests` | List incoming/outgoing friend requests | Yes |
| `GET` | `/api/friends/search?q=`| Search users by name or email | Yes |
| `POST` | `/api/friends/request` | Send a new friend request | Yes |
| `PATCH`| `/api/friends/request/:id` | Accept or reject friend request | Yes |
| `DELETE`| `/api/friends/:targetId` | Remove a friend | Yes |

#### Reports & Activity (`/api/report`, `/api/recent-log`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/api/report` | Get meeting report overview & metrics | Yes |
| `GET` | `/api/report/summary` | Get summary counts and percentages | Yes |
| `GET` | `/api/report/activity` | Get meeting activity trends over time | Yes |
| `GET` | `/api/report/distribution` | Get meetings grouped by type | Yes |
| `GET` | `/api/report/export?format=csv` | Download meeting report as CSV | Yes |
| `GET` | `/api/recent-log` | Get paginated user audit/activity logs | Yes |

---

### WebSocket Signaling Events

Connection namespace: Default `/`  
Authentication: Verified using `accessToken` from handshake cookies.

#### Client to Server
- `join-meeting` (`roomId: string`): Request to enter meeting room.
- `webrtc-offer` (`{ roomId, targetSocketId, offer }`): Send SDP offer to peer (legacy fallback).
- `webrtc-answer` (`{ roomId, targetSocketId, answer }`): Send SDP answer to peer (legacy fallback).
- `ice-candidate` (`{ roomId, targetSocketId, candidate }`): Relay ICE candidate (legacy fallback).
- `leave-meeting` (`{ roomId: string }`): Leave active meeting room.
- `end-meeting` (`{ roomId: string }`): Host ends meeting for everyone.
- `invite-friend` (`{ recipientId, roomId, message? }`): Send real-time call invitation.

#### Server to Client
- `room-users` (`{ roomId, users }`): List of participants currently in room.
- `user-joined` (`{ socketId, user }`): Broadcast when a participant enters.
- `user-left` (`{ socketId, userId }`): Broadcast when a participant leaves.
- `webrtc-offer` (`{ fromSocketId, user, offer }`): Incoming SDP offer.
- `webrtc-answer` (`{ fromSocketId, user, answer }`): Incoming SDP answer.
- `ice-candidate` (`{ fromSocketId, candidate }`): Incoming ICE candidate.
- `meeting-ended` (`{ roomId, endedBy }`): Broadcast when host terminates room.
- `meeting:incoming_invite` (`{ roomId, inviter, message }`): Real-time call pop-up.

---

## 📜 Available Scripts

### Backend (`cd backend`)
| Command | Description |
|---|---|
| `pnpm run dev` | Starts NestJS with watch/hot-reload mode |
| `pnpm run build` | Compiles TypeScript to `dist/` |
| `pnpm run start:prod` | Runs compiled production server (`node dist/main`) |
| `pnpm run lint` | Runs ESLint and auto-fixes issues |
| `pnpm run format` | Formats code with Prettier |

### Frontend (`cd frontend`)
| Command | Description |
|---|---|
| `pnpm run dev` | Starts Vite local development server |
| `pnpm run build` | Typechecks with `tsc -b` and builds production bundle |
| `pnpm run preview` | Locally previews the production build |
| `pnpm run lint` | Runs ESLint across frontend files |

---

## 💡 Troubleshooting & Gotchas

1. **LiveKit SFU Connection Issues**:
   - Ensure the LiveKit server container is running: `docker compose ps meetup-livekit`.
   - Verify that `LIVEKIT_URL` in `backend/.env` (typically `ws://127.0.0.1:7880`) and `VITE_LIVEKIT_URL` in `frontend/.env` (typically `ws://localhost:7880`) match your LiveKit server port.
   - For WebRTC audio/video transport, ensure UDP ports `50000-50020/udp` are exposed and not blocked by local firewalls or VPNs.
   - Ensure `LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET` match between `backend/.env` and `docker-compose.yml`.

2. **Camera or Mic Not Working**:
   - WebRTC requires `localhost` or a secure context (`HTTPS`). If testing across different devices on a local network, configure HTTPS or use a tunneling tool like Ngrok.
   - Ensure browser site permissions for camera and microphone are granted.

3. **CORS Errors**:
   - Ensure `FRONTEND_URL` in `backend/.env` matches your frontend origin (e.g., `http://localhost:5173`).
   - For multiple origins in production, specify comma-separated origins: `FRONTEND_URL=https://meetup.com,https://app.meetup.com`.

4. **Cookies Not Persisting in Dev / Cross-Origin**:
   - In development (`NODE_ENV=development`), cookies use `sameSite: 'lax'` and `secure: false`.
   - In production (`NODE_ENV=production`), cookies use `sameSite: 'none'` and `secure: true`, requiring HTTPS on both backend and frontend.

5. **Redis Connection Issues**:
   - Ensure Redis is running and matches your `REDIS_URL`. If using Upstash over TLS, prefix the connection string with `rediss://`.

---

## 👨‍💻 Author & License

- **Author**: Pratik Sharma ([@pratik2061](https://github.com/pratik2061))
- **License**: [ISC License](LICENSE)