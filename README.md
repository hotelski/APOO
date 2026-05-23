# APOO - A Place of Our Own

APOO is a Next.js MVP for saving personal memories on a map. Visitors can explore the public world map without an account. Signed-in users can add memories with photos and coordinates, view their private pins alongside public pins, manage their own memories, report public memories, and update basic profile settings.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Firebase Auth
- Cloud Firestore
- Firebase Storage
- Mapbox GL JS

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template:

```bash
cp .env.example .env.local
```

3. Create a Firebase project and enable:

- Authentication: Email/password provider
- Cloud Firestore
- Firebase Storage

4. Add your Firebase web app config to `.env.local`:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

5. Optional: add a Mapbox access token if you want to use the Mapbox-hosted light style:

```bash
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=...
```

Without this token, the app still renders a light world map using the built-in raster tile fallback.

6. Run the dev server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Firebase Rules

Example rules are included:

- `firestore.rules`
- `storage.rules`

They are written for the MVP model:

- Users can read and update only their own profile.
- Public memories are readable by anyone. Private memories are readable only by their owner.
- Only memory owners can update or delete their memories.
- Signed-in users can create reports.
- Admin users can read reports, review all memories, delete unsafe memories, and manage user roles.
- Storage uploads are limited to the authenticated owner's memory folder.

Deploy them with the Firebase CLI after reviewing them for your production needs.

## Admin Access

The admin panel is available at `/admin`, but only for signed-in users whose Firestore profile has admin access.

To bootstrap the first admin:

1. Register or log in with the account that should become admin.
2. In Firebase Console, open Firestore and find `users/{uid}` for that account.
3. Add or update these fields:

```text
role: "admin"
isAdmin: true
```

4. Deploy the updated `firestore.rules` and `storage.rules`.
5. Refresh the app or log out and back in.

After the first admin exists, the `/admin` panel can promote or demote other users. The UI prevents an admin from removing their own admin role from inside the panel.

## Project Structure

```text
app/
  (auth)/login
  (auth)/signup
  map
  (protected)/admin
  (protected)/memories/[id]
  (protected)/profile
  (protected)/settings
components/
  auth/
  layout/
  map/
  memories/
  providers/
  ui/
hooks/
lib/
types/
```

## Data Model

### users

- `id`
- `email`
- `displayName`
- `photoURL`
- `role`
- `isAdmin`
- `createdAt`

### memories

- `id`
- `userId`
- `title`
- `description`
- `imageUrl`
- `latitude`
- `longitude`
- `privacy`
- `createdAt`
- `updatedAt`

The implementation also stores `imagePath` internally so deleted memories can remove their uploaded image from Firebase Storage.

### reports

- `id`
- `memoryId`
- `reporterId`
- `reason`
- `createdAt`
