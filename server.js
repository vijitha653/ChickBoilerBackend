import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 📨 One-time email (still supported if needed)
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
        origin: 'http://localhost',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error('❌ EmailJS error:', responseText);
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

// 📊 Daily summary email to multiple users
app.post('/send-daily-summary', async (req, res) => {
  const users = req.body.users;

  if (!Array.isArray(users)) {
    return res.status(400).json({ error: 'Expected "users" array in request body' });
  }

  try {
    const results = await Promise.all(users.map(async ({ to_email, eggs, protein }) => {
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

      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          origin: 'http://localhost',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const resultText = await response.text();

      if (!response.ok) {
        console.error(`❌ Failed for ${to_email}:`, resultText);
        throw new Error(`Failed to send to ${to_email}`);
      }

      console.log(`✅ Summary sent to ${to_email}`);
      return { email: to_email, status: 'sent' };
    }));

    res.status(200).json({ message: 'All summary emails sent successfully', results });

  } catch (err) {
    console.error('❌ Error during summary sending:', err);
    res.status(500).json({ error: 'Some or all emails failed to send', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
