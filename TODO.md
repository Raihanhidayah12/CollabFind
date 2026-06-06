# TODO - Invite Collaborators Notification Implementation

## Task Understanding
Fitur "Invite Collaborators (optional)" di CreateProject.jsx - user input email untuk undang collaborator.

**Yang dibutuhkan:**
1. Input email di CreateProject (comma-separated)
2. Cek apakah email SUDAH REGISTER di CollabFind
3. Kalau SUDAH: 
   - Kirim notification ke user tsb muncul di "Rekomendasi Rekan Tim"
   - Kirim DM invite juga
4. Kalau BELUM: 
   - Simpan ke table project_collaborators untuk tracking dengan status 'invited'

## Implementation Plan

### Step 1: ✅ DONE - Modify CreateProject.jsx
- Update invite logic untuk:
  1. Lookup user by email di auth.users
  2. If exists: insert ke project_collaborators with user_id, create DM, send message
  3. If not exists: insert with email only (status 'invited')

### Step 2: IN PROGRESS - Update Dashboard.jsx - SkillBasedRecommendations  
- Need to: Fetch invitations where current user is invited (user_id = current user)
- Display in "Rekomendasi Rekan Tim" tab with "Pending Invitation" badge

### Step 3: TBD - Add Real-time Notifications (useRealtimeNotifications.js)
- Subscribe to project_collaborators INSERT
- Show toast when receiving invitation

### Step 4: TBD - Add to NotificationMenu.jsx
- Show invitations in notification bell menu

## Files Updated:
- src/pages/CreateProject.jsx ✅

## Files to Edit:
- src/pages/Dashboard.jsx (in progress)
- src/hooks/useRealtimeNotifications.js
- src/components/NotificationMenu.jsx

## Status: IMPLEMENTING
