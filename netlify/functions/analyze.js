const https = require('https');

exports.handler = async function(event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body);
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured' }) };
    }

    // Build Gemini request with two images + prompt
    const payload = JSON.stringify({
      contents: [{
        parts: [
          {
            text: `You are an expert vehicle/equipment damage inspector for a rental company. 
You will be shown two photos: first is the CHECKOUT photo (before rental), second is the RETURN photo (after rental).
Compare them carefully and identify any NEW damage on the returned vehicle.

Respond ONLY in valid JSON with no markdown, no backticks, just raw JSON:
{
  "hasDamage": true or false,
  "overallSeverity": "HIGH" or "MEDIUM" or "LOW" or "NONE",
  "averageConfidence": number between 0 and 100,
  "estimatedRepairMin": number in USD,
  "estimatedRepairMax": number in USD,
  "summary": "2-3 sentence professional summary",
  "damages": [
    {
      "type": "Dent or Scratch or Crack or etc",
      "location": "specific location on vehicle",
      "severity": "HIGH" or "MEDIUM" or "LOW",
      "confidence": number between 0 and 100,
      "estimatedCost": number in USD
    }
  ]
}`
          },
          {
            text: "CHECKOUT PHOTO (before rental) - this is the reference:"
          },
          {
            inline_data: {
              mime_type: body.beforeType || 'image/jpeg',
              data: body.beforeImage
            }
          },
          {
            text: "RETURN PHOTO (after rental) - check this for new damage:"
          },
          {
            inline_data: {
              mime_type: body.afterType || 'image/jpeg',
              data: body.afterImage
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1000
      }
    });

    const result = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      });

      req.on('error', reject);
      req.write(payload);
      req.end();
    });

    return {
      statusCode: result.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: result.body
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
