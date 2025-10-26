// Test Support Modal Message Submission
const axios = require('axios');

const testSupportMessage = {
  customerName: 'রহিম আহমেদ',
  customerPhone: '01712345678',
  customerEmail: 'rahim@example.com',
  messageType: 'complaint',
  message: 'আমি গত সপ্তাহে একটা product order করেছি কিন্তু এখনো পাইনি। Order ID: #12345. দয়া করে দ্রুত deliver করুন।',
  source: 'support_modal'
};

async function sendTestMessage() {
  try {
    console.log('📤 Sending test support message...\n');
    console.log('Message Data:', JSON.stringify(testSupportMessage, null, 2));
    
    const response = await axios.post('http://localhost:5000/messages', testSupportMessage);
    
    console.log('\n✅ SUCCESS! Message sent to admin dashboard');
    console.log('Response:', response.data);
    console.log('\n📊 Go to Admin Dashboard → Message Bell to see this message!');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.response?.data || error.message);
  }
}

sendTestMessage();
