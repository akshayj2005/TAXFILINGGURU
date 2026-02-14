# Tax Filing Guru - Node.js Backend

A professional tax filing services platform built with Node.js, Express, and EJS.

## 📁 Project Structure

```
TAXFILINGGURU NODE/
├── src/
│   ├── config/              # Configuration files
│   ├── controllers/         # Request handlers
│   ├── middleware/          # Custom middleware
│   ├── models/              # Database models
│   ├── routes/              # Route definitions
│   │   └── pageRoutes.js
│   ├── scripts/             # Utility scripts
│   ├── views/               # EJS templates
│   │   ├── partials/        # Reusable components
│   │   ├── admin/           # Admin pages
│   │   ├── index.ejs
│   │   ├── about.ejs
│   │   ├── contact.ejs
│   │   ├── login.ejs
│   │   ├── nri.ejs
│   │   ├── tools.ejs
│   │   ├── privacy.ejs
│   │   ├── terms.ejs
│   │   ├── reg.ejs
│   │   ├── refund-maximizer.ejs
│   │   ├── regime-comparison.ejs
│   │   ├── individualpackage.ejs
│   │   ├── 404.ejs
│   │   └── 500.ejs
│   ├── public/              # Static assets
│   │   ├── images/          # Images and icons
│   │   ├── js/              # Client-side JavaScript
│   │   ├── styles/          # CSS files
│   │   └── uploads/         # User uploads
│   └── app.js               # Express app configuration
├── server.js                # Server entry point
├── package.json             # Dependencies
├── .env                     # Environment variables
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env` (if exists)
   - Update the values in `.env` as needed

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Start the production server:**
   ```bash
   npm start
   ```

5. **Visit the application:**
   ```
   http://localhost:3000
   ```

## 📦 Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon (auto-restart)

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Template Engine:** EJS
- **Database:** MongoDB (via Mongoose)
- **Styling:** CSS, TailwindCSS
- **Other:** CORS, dotenv, body-parser

## 📄 Pages

- **Home** (`/`) - Landing page
- **About** (`/about`) - About us
- **Contact** (`/contact`) - Contact form
- **Login** (`/login`) - User login
- **NRI Services** (`/nri`) - NRI tax services
- **Tools** (`/tools`) - Tax calculators and tools
- **Individual Package** (`/individualpackage`) - Service packages
- **Refund Maximizer** (`/refund-maximizer`) - Refund calculator
- **Regime Comparison** (`/regime-comparison`) - Tax regime comparison
- **Privacy Policy** (`/privacy`) - Privacy policy
- **Terms & Conditions** (`/terms`) - Terms and conditions
- **Registration** (`/reg`) - User registration

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/taxfilingguru
SESSION_SECRET=your-secret-key-here
```

## 📝 License

This project is proprietary and confidential.

## 👥 Author

Tax Filing Guru Team
