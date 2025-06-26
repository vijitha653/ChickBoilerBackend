const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.post('/send-email', async (req, res) => {
  const { to_email } = req.body;

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'origin': 'http://localhost',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID,
        user_id: process.env.EMAILJS_USER_ID,
        template_params: {
          to_email: to_email
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ EmailJS error:', errorText);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    console.log('✅ Email sent to', to_email);
    res.status(200).json({ message: 'Email sent successfully' });

  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({ error: 'Server error while sending email' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
