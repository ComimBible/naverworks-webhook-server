
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

app.post("/naverworks-webhook", async (req, res) => {
  const data = req.body;
  console.log("📥 NaverWorks Webhook Data:", data);

  // 예시: 메시지 내용 추출
  const message = data.content?.text || "(빈 메시지)";
  const userId = data.source?.userId || "(알 수 없음)";
  const timestamp = req.body.createdTime;
  const sendTime = new Date(timestamp);
  const kstDate = new Date(sendTime.getTime() + 9 * 60 * 60 * 1000);
  const createdTime = kstDate.toISOString();

  console.log(`📩 메시지: ${message}`);
  console.log(`👤 보낸 사람: ${userId}`);

  // Notion 전송
  await sendToNotion(message, userId, createdTime);

  res.status(200).send("Received");
});

const sendToNotion = async (text, sender, createdTime) => {
  const notionDatabaseId = "1fa14209aa6f80a0aac2c839326bccae";
  const notionApiKey = "ntn_w54028970077wNs7t8Xomjsc6GXtyIv5RGdy2xgKiVNaPn";

  try {
    await axios.post(
      "https://api.notion.com/v1/pages",
      {
        parent: { database_id: notionDatabaseId },
        properties: {
          Message: {
            title: [{ text: { content: text } }],
          },
          Sender: {
            rich_text: [
              {
                text: {
                  content: sender,
                },
              },
            ],
          },
          CreatedTime: {
            date: {
              start: createdTime,
            },
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${notionApiKey}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Sent to Notion:", text);
  } catch (err) {
    console.error("❌ Notion Error:", err.response?.data || err.message);
  }
};

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

