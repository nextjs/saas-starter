import type { NextApiRequest, NextApiResponse } from 'next';
import AWS from 'aws-sdk';

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const polly = new AWS.Polly();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { message } = req.body;
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: message }
          ],
          max_tokens: 150,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch from OpenAI API');
      }

      const data = await response.json();
      const botMessage = data.choices[0].message.content;

      // Convert text to speech using Amazon Polly
    const pollyParams = {
      Engine: 'neural',
      Text: botMessage,
      OutputFormat: 'mp3',
      VoiceId: 'Ruth',
    };

      const pollyResponse = await polly.synthesizeSpeech(pollyParams).promise();
      const audioUrl = `data:audio/mp3;base64,${Buffer.from(pollyResponse.AudioStream).toString('base64')}`;

      res.status(200).json({ result: botMessage, audioUrl });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}