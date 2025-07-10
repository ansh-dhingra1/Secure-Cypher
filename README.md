# Secure Cypher Solutions

Advanced online security solutions and cybersecurity training platform.

## 🎓 Certificate System Control

### Admin Control Functions

The certificate generation system can be enabled/disabled dynamically using **Firebase Database**. This is useful for controlling when users can generate certificates (e.g., only during/after seminars).

#### Quick Commands (Browser Console)

Open browser console (`F12` → Console tab) and use these commands:

```javascript
// Enable certificate system GLOBALLY for ALL users
enableCerts()

// Disable certificate system GLOBALLY for ALL users
disableCerts()

// Toggle certificate system on/off GLOBALLY
toggleCerts()

// Check current global status
checkCertStatus()
```

### How It Works

- **Disabled State**: 
  - "Get Certificate" button appears grayed out with strikethrough
  - Clicking shows "not available" message
  - Direct URL access to `/certificate.html` redirects to home page
  - **Applied to ALL users instantly**

- **Enabled State**:
  - "Get Certificate" button appears normal and clickable
  - Users can access certificate generation
  - Direct URL access works normally
  - **Applied to ALL users instantly**

### Default State

- **Certificate system starts DISABLED by default**
- You must manually enable it when needed

### Typical Usage

1. **Before seminar**: Keep disabled
2. **During/after seminar**: Run `enableCerts()` in console → **ALL users can now get certificates**
3. **When done**: Run `disableCerts()` → **ALL users blocked instantly**

### Technical Details

- **Uses Firebase Realtime Database** for global control
- **Real-time synchronization** - changes apply to all users instantly
- **No local storage** - everything is saved in Firebase
- Admin can control system from any device/browser
- Truly global implementation for seamless management

---

## 📊 Data Storage

**Everything is saved in Firebase:**

✅ **Contact form submissions** → Firebase Database  
✅ **Certificate data** → Firebase Database  
✅ **Certificate verification** → Firebase Database  
✅ **Global system control** → Firebase Database  

❌ **No localStorage usage**  
❌ **No sessionStorage usage**  
❌ **No cookies for data storage**  
❌ **No local device storage**

---

## 🚀 Deployment

```bash
git add .
git commit -m "Add Firebase-based certificate system with global control"
git push
```

The certificate system will work the same way on your live deployment with real-time global control!