// netlify/functions/submit-form.js
export async function handler(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  const webhookUrl = 'https://discord.com/api/webhooks/1371143336135491645/-WshRcFpKQcT4GEo98LCBlSvGldg0_MJrGlz-WSoI8INgo8jEqGk06NWOem_rCziZApr'; // KEEP THIS PRIVATE

  const body = JSON.parse(event.body);

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Success' }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to send to Discord' }),
    };
  }
}
