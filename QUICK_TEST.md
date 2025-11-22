# 🚀 Quick Test - 5 Minute Social Features Test

## Step-by-Step Testing (5 minutes)

### Setup (30 seconds)

```bash
# Terminal 1: Start backend
npm run dev:socket

# Terminal 2: Start frontend
npm run dev
```

**Open:** http://localhost:5173 in TWO browser windows

---

## Test 1: Basic Friend System (2 minutes)

### Window 1:
1. ✅ Connect wallet
2. ✅ Click **🌐 Social** button (top right)
3. ✅ Social Hub opens
4. ✅ Copy your wallet address from top of page

### Window 2:
1. ✅ Connect different wallet (or use incognito mode)
2. ✅ Click **🌐 Social** button
3. ✅ Go to **Friends** tab
4. ✅ Paste Window 1's address
5. ✅ Enter nickname: "Friend1"
6. ✅ Click **"Send Friend Request"**

### Window 1:
1. ✅ Check **Friends** tab
2. ✅ See incoming friend request (real-time!)
3. ✅ Click **"Accept"**

**Expected:** Both windows now show each other as friends! ✅

---

## Test 2: Chat System (1 minute)

### Window 1:
1. ✅ Click **Chat** tab
2. ✅ Type: "Hello from Window 1!"
3. ✅ Press Enter

### Window 2:
1. ✅ Click **Chat** tab
2. ✅ See message appear instantly!
3. ✅ Reply: "Hi back from Window 2!"

**Expected:** Real-time chat working! ✅

---

## Test 3: Referral System (1 minute)

### Window 1:
1. ✅ Click **Referrals** tab
2. ✅ Click **"Generate Referral Code"**
3. ✅ See code like: `CELO208B26`
4. ✅ Click **"Copy Link"**

### Window 2:
1. ✅ Close tab
2. ✅ Open new tab with copied link: `http://localhost:5173/?ref=CELO208B26`
3. ✅ Connect wallet
4. ✅ Referral should be tracked

**Expected:** Window 1 shows 1 referral! ✅

---

## Test 4: Share Feature (30 seconds)

### Window 1:
1. ✅ Go to **Feed** tab
2. ✅ Win a game (or just check share button)
3. ✅ Click **Share** icon
4. ✅ Select **Twitter**

**Expected:** Twitter share dialog opens with pre-filled message! ✅

---

## ✅ All Tests Passing?

If all 4 tests work:
- 🎉 **Social features are 100% functional!**
- 🎉 **Ready for production testing!**
- 🎉 **Users can start connecting!**

---

## 🐛 Quick Troubleshooting

**"Not connected to server"**
```bash
# Restart backend
npm run dev:socket
```

**Friend request not appearing**
- Refresh both windows
- Check console for errors (F12)
- Verify both connected to socket

**Chat not working**
- Check socket connection in Network tab
- Restart both backend and frontend

---

## 📊 Quick Debug Commands

Open browser console (F12) and run:

```javascript
// Check if you're connected
const socket = window.multiplayerSocket;
console.log('Connected?', socket?.connected);

// Check your profile
const { myProfile } = useSocialStore.getState();
console.log('My Profile:', myProfile);

// Check friends
const { friends } = useSocialStore.getState();
console.log('Friends:', friends);

// Check messages
const { globalMessages } = useSocialStore.getState();
console.log('Messages:', globalMessages);
```

---

## 🎯 Next Steps After Quick Test

1. **Test blocking:** Block a friend and verify they can't send requests
2. **Test activity feed:** Post activities and like/comment
3. **Test game invites:** Send invite to friend
4. **Stress test:** Send 10+ messages quickly (spam protection)
5. **Test mobile:** Open on phone with MiniPay

---

## 📈 What to Expect

### Working Features:
✅ Friend requests (real-time)
✅ Chat messaging (instant)
✅ Referral tracking
✅ Share to social platforms
✅ Block/unblock users
✅ Activity feed
✅ Online status

### Performance:
- Message delivery: < 100ms
- Friend request: < 1 second
- UI updates: Real-time (no refresh)
- Smart contract calls: ~5 seconds

---

**Total Test Time: ~5 minutes**

**If everything works → 🎉 You're ready to go live!**
