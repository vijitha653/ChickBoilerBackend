import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ⏰ Route for regular one-time email (optional, still retained)
app.post('/send-email', async (req, res) => {
  const { to_email } = req.body;

  console.log('📨 Received email request for:', to_email);

  const payload = {
    service_id: process.env.EMAILJS_SERVICE_ID,
    template_id: process.env.EMAILJS_TEMPLATE_ID,
    user_id: process.env.EMAILJS_USER_ID,
    template_params: {
      user_email: to_email
    }
  };

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'origin': 'http://localhost',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error('❌ EmailJS error response:', responseText);
      return res.status(500).json({
        error: 'Failed to send email',
        response: responseText
      });
    }

    console.log('✅ Email sent successfully to:', to_email);
    res.status(200).json({ message: 'Email sent successfully' });

  } catch (error) {
    console.error('❌ Server error while sending email:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// 🥚 Route for daily summary email
app.post('/send-daily-summary', async (req, res) => {
  const { to_email, eggs, protein } = req.body;

  console.log('📨 Sending daily summary to:', to_email);

  const payload = {
    service_id: process.env.EMAILJS_SERVICE_ID,
    template_id: process.env.EMAILJS_DAILY_TEMPLATE_ID,
    user_id: process.env.EMAILJS_USER_ID,
    template_params: {
      user_email: to_email,
      eggs,
      protein
    }
  };

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'origin': 'http://localhost',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.text();

    if (!response.ok) {
      console.error('❌ Daily Summary EmailJS error response:', result);
      return res.status(500).json({ error: 'Email sending failed', result });
    }

    console.log('✅ Daily summary sent to:', to_email);
    res.status(200).json({ message: 'Daily summary email sent successfully' });

  } catch (err) {
    console.error('❌ Unexpected error in daily summary:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
