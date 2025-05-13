

exports.handler = async function(event) {
  try {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Webhook URL not set in environment variables" })
      };
    }

    const body = JSON.parse(event.body);

    // This is where we send the message from the frontend
    const payload = {
      content: body.message || "Form submitted!",
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to send message to Discord.");
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
