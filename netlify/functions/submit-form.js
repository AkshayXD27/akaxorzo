exports.handler = async function(event) {
  try {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Webhook URL not set in environment variables" })
      };
    }
    
    // Parse the incoming request body
    const body = JSON.parse(event.body);
    
    // Check if we received webhookData directly from the frontend
    if (body.webhookData) {
      // Send the complete webhook data structure
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body.webhookData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to send webhook: ${response.status} ${response.statusText}`);
      }
      
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true }),
      };
    } 
    // Fallback to simple message if no structured data is sent
    else {
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
    }
  } catch (error) {
    console.error("Error in webhook function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
