// Import required Netlify environment variables
const { DISCORD_WEBHOOK_URL, SUBMISSIONS_PER_HOUR = "2", SUBMISSIONS_PER_DAY = "5" } = process.env;

// A simple in-memory store to track submissions by IP
// Note: This will reset when the function goes cold (typically after 10-15 minutes of inactivity)
// For more permanent storage, consider using a database like FaunaDB or DynamoDB
const ipSubmissions = {};

// Convert the environment variable limits to numbers
const HOURLY_LIMIT = parseInt(SUBMISSIONS_PER_HOUR, 10);
const DAILY_LIMIT = parseInt(SUBMISSIONS_PER_DAY, 10);

// Clean up old submission records (older than 24 hours)
function cleanupOldSubmissions() {
  const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
  Object.keys(ipSubmissions).forEach(ip => {
    // Remove submissions older than 24 hours
    ipSubmissions[ip] = ipSubmissions[ip].filter(timestamp => timestamp > oneDayAgo);
    
    // Remove IP from tracking if it has no recent submissions
    if (ipSubmissions[ip].length === 0) {
      delete ipSubmissions[ip];
    }
  });
}

exports.handler = async function(event) {
  try {
    if (!DISCORD_WEBHOOK_URL) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Webhook URL not set in environment variables" })
      };
    }
    
    // Get client IP address
    const ip = event.headers['client-ip'] || 
               event.headers['x-forwarded-for'] || 
               event.ip || 
               'unknown';
    
    // Clean up old records once in a while
    cleanupOldSubmissions();
    
    // Initialize tracking for this IP if it doesn't exist
    if (!ipSubmissions[ip]) {
      ipSubmissions[ip] = [];
    }
    
    // Check rate limits
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    const submissionsLastHour = ipSubmissions[ip].filter(timestamp => timestamp > oneHourAgo).length;
    const submissionsLastDay = ipSubmissions[ip].length;
    
    // Enforce rate limits
    if (submissionsLastHour >= HOURLY_LIMIT) {
      return {
        statusCode: 429, // Too Many Requests
        body: JSON.stringify({ 
          error: "Rate limit exceeded", 
          message: `You can only submit ${HOURLY_LIMIT} forms per hour. Please try again later.`,
          retryAfter: Math.ceil((ipSubmissions[ip][ipSubmissions[ip].length - HOURLY_LIMIT] - oneHourAgo) / 1000) // seconds until next available slot
        }),
        headers: {
          'Retry-After': Math.ceil((ipSubmissions[ip][ipSubmissions[ip].length - HOURLY_LIMIT] - oneHourAgo) / 1000)
        }
      };
    }
    
    if (submissionsLastDay >= DAILY_LIMIT) {
      return {
        statusCode: 429, // Too Many Requests
        body: JSON.stringify({ 
          error: "Rate limit exceeded", 
          message: `You can only submit ${DAILY_LIMIT} forms per day. Please try again tomorrow.`,
          retryAfter: Math.ceil((ipSubmissions[ip][0] + (24 * 60 * 60 * 1000) - now) / 1000) // seconds until tomorrow
        }),
        headers: {
          'Retry-After': Math.ceil((ipSubmissions[ip][0] + (24 * 60 * 60 * 1000) - now) / 1000)
        }
      };
    }
    
    // Record this submission
    ipSubmissions[ip].push(now);
    
    // Parse the incoming request body
    const body = JSON.parse(event.body);
    
    // Get form type for logging
    const formType = body.webhookData?.embeds?.[0]?.title || "Unknown form";
    
    console.log(`Processing ${formType} submission from IP: ${ip} (${submissionsLastHour+1}/${HOURLY_LIMIT} this hour, ${submissionsLastDay+1}/${DAILY_LIMIT} today)`);
    
    // Check if we received webhookData directly from the frontend
    if (body.webhookData) {
      // Add IP information to the webhook for moderation purposes
      if (body.webhookData.embeds && body.webhookData.embeds.length > 0) {
        body.webhookData.embeds[0].fields.push({
          name: "Submission IP",
          value: ip,
          inline: true
        });
        
        // Add rate limit info
        body.webhookData.embeds[0].fields.push({
          name: "Rate Limit Info",
          value: `${submissionsLastHour+1}/${HOURLY_LIMIT} this hour\n${submissionsLastDay+1}/${DAILY_LIMIT} today`,
          inline: true
        });
      }
      
      // Send the complete webhook data structure
      const response = await fetch(DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body.webhookData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to send webhook: ${response.status} ${response.statusText}`);
      }
      
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          success: true,
          remainingHourly: HOURLY_LIMIT - (submissionsLastHour + 1),
          remainingDaily: DAILY_LIMIT - (submissionsLastDay + 1),
          resetHour: new Date(oneHourAgo + (60 * 60 * 1000)).toISOString(),
          resetDay: new Date(now + (24 * 60 * 60 * 1000)).toISOString()
        }),
      };
    } 
    // Fallback to simple message if no structured data is sent
    else {
      const payload = {
        content: `${body.message || "Form submitted!"} (IP: ${ip})`,
      };
      
      const response = await fetch(DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error("Failed to send message to Discord.");
      }
      
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          success: true,
          remainingHourly: HOURLY_LIMIT - (submissionsLastHour + 1),
          remainingDaily: DAILY_LIMIT - (submissionsLastDay + 1) 
        }),
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
