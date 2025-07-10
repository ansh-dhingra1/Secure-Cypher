# Secure Cypher Solutions

Advanced online security solutions and cybersecurity training platform.

## 🎓 Certificate System Control

### Admin Control Functions

The certificate generation system can be enabled/disabled dynamically. This is useful for controlling when users can generate certificates (e.g., only during/after seminars).

#### Quick Commands (Browser Console)

Open browser console (`F12` → Console tab) and use these commands:

```javascript
// Enable certificate system
enableCerts()

// Disable certificate system  
disableCerts()

// Toggle certificate system on/off
toggleCerts()
```

### How It Works

- **Disabled State**: 
  - "Get Certificate" button appears grayed out with strikethrough
  - Shows "(Disabled)" text next to button
  - Clicking shows "not available" message
  - Direct URL access to `/certificate.html` redirects to home page

- **Enabled State**:
  - "Get Certificate" button appears normal and clickable
  - Users can access certificate generation
  - Direct URL access works normally

### Default State

- **Certificate system starts DISABLED by default**
- You must manually enable it when needed

### Typical Usage

1. **Before seminar**: Keep disabled
2. **During/after seminar**: Run `enableCerts()` in console
3. **When done**: Run `disableCerts()` to restrict access again

### Technical Details

- Uses `localStorage` to persist state across page reloads
- State is browser-specific (each user's browser remembers its own state)
- Admin can control system from any page with the console commands
- Completely client-side implementation for easy management

---

## 🚀 Deployment

```bash
git add .
git commit -m "Add certificate system control features"
git push
```

The certificate system will work the same way on your live deployment!