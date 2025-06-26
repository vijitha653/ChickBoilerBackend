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

  // Step 1: Log the incoming email address
  console.log('📨 Received email request for:', to_email);

  // Step 2: Log the environment variables (mask sensitive info)
  console.log('🔐 Using EmailJS config:');
  console.log('   Service ID:', process.env.EMAILJS_SERVICE_ID);
  console.log('   Template ID:', process.env.EMAILJS_TEMPLATE_ID);
  console.log('   User ID:', process.env.EMAILJS_USER_ID?.slice(0, 4) + '****');

  // Step 3: Prepare payload and log it
  const payload = {
    service_id: process.env.EMAILJS_SERVICE_ID,
    template_id: process.env.EMAILJS_TEMPLATE_ID,
    user_id: process.env.EMAILJS_USER_ID,
    template_params: {
      to_email: to_email
    }
  };

  console.log('📦 Payload to EmailJS:', JSON.stringify(payload, null, 2));

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

    // Step 4: Log the full response
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
    console.error('❌ Unexpected server error while sending email:', error);
    res.status(500).json({ error: 'Server error while sending email', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
