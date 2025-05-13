export async function handler(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  const body = JSON.parse(event.body);

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: body.message || 'New submission received!',
        username: "Website Bot"
      })
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
