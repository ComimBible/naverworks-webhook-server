
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

app.post('/naverworks-webhook', async (req, res) => {
  const data = req.body;
  console.log('📥 NaverWorks Webhook Data:', data);

  // 예시: 메시지 내용 추출
  const text = data.content?.text || "메시지 없음";

  // Notion 전송
  await sendToNotion(text);

  res.status(200).send('Received');
});

const sendToNotion = async (text) => {
  const notionDatabaseId = '1fa14209aa6f80a0aac2c839326bccae';
  const notionApiKey = 'ntn_w54028970077wNs7t8Xomjsc6GXtyIv5RGdy2xgKiVNaPn';

  try {
    await axios.post('https://api.notion.com/v1/pages', {
      parent: { database_id: notionDatabaseId },
      properties: {
        Name: {
          title: [{ text: { content: text } }]
        }
      }
    }, {
      headers: {
        Authorization: `Bearer ${notionApiKey}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Sent to Notion:', text);
  } catch (err) {
    console.error('❌ Notion Error:', err.response?.data || err.message);
  }
};

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

