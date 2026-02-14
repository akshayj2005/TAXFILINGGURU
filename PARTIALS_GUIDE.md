# 🎯 PARTIALS INTEGRATION GUIDE

## ✅ Current Status

### Partials Created:
1. ✅ `src/views/partials/header.ejs` - Navigation header
2. ✅ `src/views/partials/footer.ejs` - Footer section  
3. ✅ `src/views/partials/elements.ejs` - WhatsApp + Video consultation widgets

### Dependencies Installed:
✅ npm install completed successfully
✅ node_modules folder created
✅ All packages ready

## 📝 How to Use Partials in Your EJS Files

### Step 1: Replace Header Section

**Find this in your EJS files (lines ~17-126):**
```html
<!-- Header -->
<header class="relative w-full bg-white/80...">
  ...entire header code...
</header>
```

**Replace with:**
```ejs
<%- include('partials/header') %>
```

### Step 2: Replace Elements Section

**Find this in your EJS files (lines ~127-187):**
```html
<a href="whatsapp://send?phone=...">
  ...WhatsApp widget...
</a>
<div id="rightTab" onclick="vcOpenBooking()">
  ...Video consultation widget...
</div>
<div id="closeTab"...>
  Close
</div>
```

**Replace with:**
```ejs
<%- include('partials/elements') %>
```

### Step 3: Add Footer Before `</body>`

**Find the closing `</body>` tag at the end of your file**

**Add this BEFORE `</body>`:**
```ejs
<%- include('partials/footer') %>
```

## 📄 Files to Update

Update these 12 EJS files:
- [ ] index.ejs
- [ ] about.ejs
- [ ] contact.ejs
- [ ] login.ejs
- [ ] nri.ejs
- [ ] tools.ejs
- [ ] privacy.ejs
- [ ] terms.ejs
- [ ] reg.ejs
- [ ] refund-maximizer.ejs
- [ ] regime-comparison.ejs
- [ ] individualpackage.ejs

## 🔧 Testing After Integration

### 1. Start the Server:
```bash
npm start
```

### 2. Visit Pages:
```
http://localhost:3000/
http://localhost:3000/about
http://localhost:3000/contact
```

### 3. Check That:
- ✅ Header appears correctly
- ✅ WhatsApp button is visible (bottom right)
- ✅ Video consultation tab is visible (right side)
- ✅ Footer appears at bottom
- ✅ All links work properly

## ⚠️ Important Notes

### Asset Paths:
Your partials use paths like:
- `assets/images/TFG_LOGO.png`
- `css/styles.css`
- `js/script.js`

Make sure these paths are correct relative to your `src/public/` folder.

### If Assets Don't Load:
Update paths in partials to use `/` prefix:
- `/assets/images/TFG_LOGO.png`
- `/styles/styles.css` (if you renamed css to styles)
- `/js/script.js`

## 🚀 Quick Test Command

After updating files, run:
```bash
npm start
```

Then visit `http://localhost:3000` to see if everything works!

## 📌 Benefits of Using Partials

✅ **Single Source of Truth** - Update header/footer once, changes reflect everywhere
✅ **Cleaner Code** - Each page is now much shorter and easier to read
✅ **Easier Maintenance** - Fix bugs or add features in one place
✅ **Consistent Design** - All pages use the same header/footer automatically

## 🎉 Next Steps

1. Update all 12 EJS files with the partials
2. Test each page to ensure it loads correctly
3. Fix any asset path issues if needed
4. Enjoy your clean, maintainable code!

---

**Need help?** Check the example below:

### Example: about.ejs BEFORE
```html
<!doctype html>
<html>
<head>...</head>
<body>
  <!-- Header -->
  <header class="...">
    ...100+ lines of header code...
  </header>
  
  <a href="whatsapp://...">
    ...WhatsApp widget...
  </a>
  ...video consultation widgets...
  
  <main>
    ...page content...
  </main>
  
  <footer class="...">
    ...80+ lines of footer code...
  </footer>
  
  <script src="js/script.js"></script>
</body>
</html>
```

### Example: about.ejs AFTER
```html
<!doctype html>
<html>
<head>...</head>
<body>
  <%- include('partials/header') %>
  <%- include('partials/elements') %>
  
  <main>
    ...page content...
  </main>
  
  <%- include('partials/footer') %>
  
  <script src="js/script.js"></script>
</body>
</html>
```

**Much cleaner! 🎉**
