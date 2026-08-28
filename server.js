require('dotenv').config();
const express = require('express');
const path = require('path');
const sgMail = require('@sendgrid/mail');

const app = express();
const PORT = process.env.PORT || 3000;

// Set SendGrid API Key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html on root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// POST /subscribe route
app.post('/subscribe', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  const msg = {
    to: email,
    from: process.env.SENDER_EMAIL || 'navpreetsingh35796@gmail.com',
    subject: 'Welcome to DEV@Deakin Daily Insider!',
    text: 'Thank you for subscribing to DEV@Deakin!',
    html: '<h3>Welcome to DEV@Deakin!</h3><p>Thank you for subscribing to our Daily Insider.</p>',
  };

  try {
    const [response] = await sgMail.send(msg);
    console.log(`[SendGrid Success] Status Code: ${response.statusCode}`);
    return res.status(200).json({
      message: 'Welcome email sent successfully! Please check your inbox.',
      statusCode: response.statusCode
    });
  } catch (error) {
    console.error('[SendGrid Error]:', error.response ? error.response.body : error.message);
    return res.status(500).json({
      error: 'Failed to send welcome email. Please check your API key and verified sender.'
    });
  }
});

// Keep server alive and listening
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});