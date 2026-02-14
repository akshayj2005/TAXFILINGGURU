const path = require('path');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
const VIEWS_DIR = path.join(__dirname, 'src', 'views');
const PUBLIC_DIR = path.join(__dirname, 'src', 'public');

app.set('view engine', 'ejs');
app.set('views', VIEWS_DIR);

app.use(express.static(PUBLIC_DIR));

app.get('/', (_req, res) => {
  res.render('index');
});

app.get('/about', (_req, res) => {
  res.render('about');
});

app.get('/contact', (_req, res) => {
  res.render('contact');
});

app.get('/privacy', (_req, res) => {
  res.render('privacy');
});

app.get('/terms', (_req, res) => {
  res.render('terms');
});

app.get('/tools', (_req, res) => {
  res.render('tools');
});

app.get('/nri', (_req, res) => {
  res.render('nri');
});

app.get('/reg', (_req, res) => {
  res.render('reg');
});

app.get('/regime-comparison', (_req, res) => {
  res.render('regime-comparison');
});

app.get('/refund-maximizer', (_req, res) => {
  res.render('refund-maximizer');
});

app.get('/individualpackage', (_req, res) => {
  res.render('individualpackage');
});

app.get('/login', (_req, res) => {
  res.render('login');
});

app.use((req, res) => {
  res.status(404).render('404');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
