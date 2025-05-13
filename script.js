// Button hover animations
document.querySelectorAll('.btn').forEach(button => {
  button.addEventListener('mouseenter', () => {
    button.style.transform = 'translateY(-3px)';
  });
  
  button.addEventListener('mouseleave', () => {
    button.style.transform = 'translateY(0)';
  });
});

// Modal functionality
const modals = {
  'login-btn': 'login-modal',
  'friend-btn': 'friend-modal',
  'appeal-btn': 'appeal-modal',
  'events-btn': 'events-modal'
};

// Rate limiting functionality
const RATE_LIMIT_STORAGE_KEY = 'akaxorzo_form_submissions';

// Check if submission is allowed based on stored data
function checkRateLimit(formId) {
  try {
    // Get stored submission data
    const storedData = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
    if (!storedData) return { allowed: true };
    
    const submissionData = JSON.parse(storedData);
    
    // If there's data for this specific form
    if (submissionData[formId]) {
      const now = Date.now();
      const hourInMs = 60 * 60 * 1000;
      const dayInMs = 24 * hourInMs;
      
      // Check hourly limit (default: 2 per hour)
      const hourlyLimit = 2;
      const hourlySubmissions = submissionData[formId].filter(time => 
        now - time < hourInMs
      );
      
      if (hourlySubmissions.length >= hourlyLimit) {
        // Calculate time until next available slot
        const oldestInHour = Math.min(...hourlySubmissions);
        const timeUntilNextHourlySlot = (oldestInHour + hourInMs) - now;
        
        return { 
          allowed: false, 
          reason: 'hourly',
          message: `You can only submit ${hourlyLimit} ${formId.replace('-form', '')} forms per hour. Please try again later.`,
          waitTime: formatTimeRemaining(timeUntilNextHourlySlot)
        };
      }
      
      // Check daily limit (default: 5 per day)
      const dailyLimit = 5;
      const dailySubmissions = submissionData[formId].filter(time => 
        now - time < dayInMs
      );
      
      if (dailySubmissions.length >= dailyLimit) {
        // Calculate time until next day
        const oldestInDay = Math.min(...dailySubmissions);
        const timeUntilNextDay = (oldestInDay + dayInMs) - now;
        
        return { 
          allowed: false, 
          reason: 'daily',
          message: `You can only submit ${dailyLimit} ${formId.replace('-form', '')} forms per day. Please try again tomorrow.`,
          waitTime: formatTimeRemaining(timeUntilNextDay)
        };
      }
    }
    
    return { allowed: true };
  } catch (error) {
    console.error("Error checking rate limit:", error);
    return { allowed: true }; // If there's an error, allow submission
  }
}

// Record a new submission for rate limiting
function recordSubmission(formId) {
  try {
    const now = Date.now();
    
    // Get existing data or initialize new object
    const storedData = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
    const submissionData = storedData ? JSON.parse(storedData) : {};
    
    // Initialize array for this form if it doesn't exist
    if (!submissionData[formId]) {
      submissionData[formId] = [];
    }
    
    // Add current timestamp
    submissionData[formId].push(now);
    
    // Clean up old submissions (older than 24 hours)
    const dayInMs = 24 * 60 * 60 * 1000;
    Object.keys(submissionData).forEach(form => {
      submissionData[form] = submissionData[form].filter(timestamp => 
        now - timestamp < dayInMs
      );
    });
    
    // Save back to localStorage
    localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(submissionData));
  } catch (error) {
    console.error("Error recording submission:", error);
  }
}

// Format milliseconds into human readable time
function formatTimeRemaining(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} and ${minutes % 60} minute${minutes % 60 !== 1 ? 's' : ''}`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} and ${seconds % 60} second${seconds % 60 !== 1 ? 's' : ''}`;
  } else {
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }
}

// Function to show rate limit message with proper styling
function showRateLimitMessage(message, waitTime) {
  // Remove any existing rate limit messages first
  const existingMessage = document.querySelector('.rate-limit-message');
  if (existingMessage) existingMessage.remove();

  const rateLimitMessage = document.createElement('div');
  rateLimitMessage.className = 'rate-limit-message';
  rateLimitMessage.style = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
  `;

  rateLimitMessage.innerHTML = `
    <div class="rate-limit-content">
      <h3 style="color: white; margin-bottom: 15px;">Submission Limit Reached</h3>
      <p style="color: white; margin-bottom: 10px;">${message}</p>
      <p style="color: white; margin-bottom: 20px;">Please wait ${waitTime} before trying again.</p>
      <button class="btn" style="background: linear-gradient(45deg, #9c27b0, #3f51b5); color: white;">Close</button>
    </div>
  `;

  document.body.appendChild(rateLimitMessage);

  const closeBtn = rateLimitMessage.querySelector('button');
  closeBtn.addEventListener('click', () => {
    document.body.removeChild(rateLimitMessage);
  });
}

// Open modal with rate limit check
Object.entries(modals).forEach(([btnId, modalId]) => {
  const btn = document.getElementById(btnId);
  const modal = document.getElementById(modalId);
  
  if (btn && modal) {
    btn.addEventListener('click', () => {
      // If this is a form modal, check if form ID exists
      const formId = modalId.replace('modal', 'form');
      const form = document.getElementById(formId);
      
      // If there's a form, check rate limits
      if (form) {
        const rateLimit = checkRateLimit(formId);
        
        if (!rateLimit.allowed) {
          // Show rate limit message instead of opening modal
          showRateLimitMessage(rateLimit.message, rateLimit.waitTime);
          return;
        }
      }
      
      // If no rate limit issues, open modal normally
      modal.style.display = 'block';
      setTimeout(() => {
        modal.classList.add('active');
      }, 10);
    });
  }
});

// Close modal functionality
document.querySelectorAll('.close-modal').forEach(closeBtn => {
  closeBtn.addEventListener('click', () => {
    const modal = closeBtn.closest('.modal');
    modal.classList.remove('active');
    setTimeout(() => {
      modal.style.display = 'none';
    }, 300);
  });
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
  document.querySelectorAll('.modal').forEach(modal => {
    if (e.target === modal) {
      modal.classList.remove('active');
      setTimeout(() => {
        modal.style.display = 'none';
      }, 300);
    }
  });
});

// Form submission handlers with Discord webhook integration
document.querySelectorAll('form').forEach(form => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get the form ID to determine what action to take
    const formId = form.id;
    
    // Check rate limits first
    const rateLimit = checkRateLimit(formId);
    if (!rateLimit.allowed) {
      showRateLimitMessage(rateLimit.message, rateLimit.waitTime);
      return;
    }
    
    // Get form data
    const formData = new FormData(form);
    const formEntries = Object.fromEntries(formData.entries());
    
    // Prepare webhook data based on form type
    let webhookData = {
      content: null,
      embeds: [{
        title: "",
        color: 10181046, // Purple color
        fields: [],
        footer: {
          text: "Akaxorzo Website Submission",
          icon_url: "https://i.imgur.com/yourlogo.png" // Replace with your logo URL
        },
        timestamp: new Date().toISOString()
      }]
    };
    
    // Configure webhook based on form type
    if (formId === 'login-form') {
      webhookData.embeds[0].title = "New Login Attempt";
      webhookData.embeds[0].description = "Someone attempted to log in to the website";
      webhookData.embeds[0].color = 3447003; // Blue color
      
      // Add fields for each form input
      Object.entries(formEntries).forEach(([key, value]) => {
        webhookData.embeds[0].fields.push({
          name: key.charAt(0).toUpperCase() + key.slice(1),
          value: value || "Not provided",
          inline: true
        });
      });
    } 
    else if (formId === 'friend-form') {
      webhookData.embeds[0].title = "New Friend Request";
      webhookData.embeds[0].color = 5763719; // Green color

      // Add a detailed description
      webhookData.embeds[0].description = "**Friend Request Details:**\n";

      Object.entries(formEntries).forEach(([key, value]) => {
        webhookData.embeds[0].description += `**${key.charAt(0).toUpperCase() + key.slice(1)}:** ${value || "Not provided"}\n`;
        webhookData.embeds[0].fields.push({
          name: key.charAt(0).toUpperCase() + key.slice(1),
          value: value || "Not provided",
          inline: true
        });
      });
    }
    else if (formId === 'appeal-form') {
      console.log("Form entries received:", formEntries);
      
      webhookData.embeds[0].title = "New Ban Appeal";
      webhookData.embeds[0].description = "**Ban Appeal Details:**\n";
      webhookData.embeds[0].color = 15548997; // Red color
      
      // Add all form fields to the description and as fields
      Object.entries(formEntries).forEach(([key, value]) => {
        webhookData.embeds[0].description += `**${key.charAt(0).toUpperCase() + key.slice(1)}:** ${value || "Not provided"}\n`;
        webhookData.embeds[0].fields.push({
          name: key.charAt(0).toUpperCase() + key.slice(1),
          value: value || "Not provided",
          inline: true 
        });
      });
    }
    else if (formId === 'events-form') {
      webhookData.embeds[0].title = "New Event Registration";
      webhookData.embeds[0].description = "Someone registered for an event";
      webhookData.embeds[0].color = 16750848; // Orange color
      
      Object.entries(formEntries).forEach(([key, value]) => {
        webhookData.embeds[0].fields.push({
          name: key.charAt(0).toUpperCase() + key.slice(1),
          value: value || "Not provided",
          inline: true
        });
      });
    }
    
    // Set the submit button to loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Submitting...';
    submitBtn.disabled = true;
    
    // Send data to our Netlify function
    fetch("/.netlify/functions/submit-form", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        webhookData: webhookData 
      })
    })
    .then(res => {
      if (!res.ok) {
        if (res.status === 429) {
          // Handle rate limit response
          return res.json().then(data => {
            throw new Error(`Rate limit exceeded: ${data.message}`);
          });
        }
        throw new Error(`Server responded with ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      console.log("Webhook response:", data);
      
      // Record this submission for client-side rate limiting
      recordSubmission(formId);
      
      // Show success message
      const modal = form.closest('.modal');
      const modalContent = modal.querySelector('.modal-content');
      const originalContent = modalContent.innerHTML;
      
      // Replace with success message
      modalContent.innerHTML = `
        <h2 class="modal-title" style="color: #4CAF50; margin-bottom: 20px;">Success!</h2>
        <p style="text-align: center; margin-bottom: 20px; color: white;">Your submission has been received.</p>
        ${data.remainingHourly !== undefined ? 
          `<p style="text-align: center; margin-bottom: 20px; font-size: 14px; color: white;">
            You have ${data.remainingHourly} submission${data.remainingHourly !== 1 ? 's' : ''} left this hour
            and ${data.remainingDaily} submission${data.remainingDaily !== 1 ? 's' : ''} left today.
          </p>` : ''}
        <button class="btn" style="width: 100%; background: linear-gradient(45deg, #9c27b0, #3f51b5);">Close</button>
      `;
      
      // Add event listener to the close button
      modalContent.querySelector('button').addEventListener('click', () => {
        modal.classList.remove('active');
        setTimeout(() => {
          modal.style.display = 'none';
          // Reset the modal content and clear form
          setTimeout(() => {
            modalContent.innerHTML = originalContent;
            form.reset();
            // Reattach close modal functionality
            modalContent.querySelector('.close-modal').addEventListener('click', () => {
              modal.classList.remove('active');
              setTimeout(() => {
                modal.style.display = 'none';
              }, 300);
            });
          }, 300);
        }, 300);
      });
    })
    .catch(error => {
      console.error("Error sending to webhook:", error);
      
      // Reset button state
      submitBtn.innerHTML = originalBtnText;
      submitBtn.disabled = false;
      
      // Show appropriate error message
      if (error.message.includes('Rate limit exceeded')) {
        showRateLimitMessage(error.message, "a few minutes");
      } else {
        alert("There was an error submitting your form. Please try again later.");
      }
    });
  });
});

// External links functionality
document.getElementById('discord-btn')?.addEventListener('click', () => {
  // Replace with your actual Discord link
  window.open('https://discord.gg/EynZRyFq3c', '_blank');
});

document.getElementById('youtube-btn')?.addEventListener('click', () => {
  // Replace with your actual YouTube channel
  window.open('https://youtube.com/@Akaxorzo', '_blank');
});

document.getElementById('subscribe-btn')?.addEventListener('click', (e) => {
  e.preventDefault();
  // Replace with your actual subscription/channel link
  window.open('https://youtube.com/@Akaxorzo?sub_confirmation=1', '_blank');
});

// Social icon links
document.querySelectorAll('.social-icon').forEach((icon, index) => {
  icon.addEventListener('click', () => {
    const links = [
      'https://twitch.tv/youraccount',
      'https://twitter.com/youraccount'
    ];
    window.open(links[index], '_blank');
  });
});

// Games button functionality
document.getElementById('games-btn')?.addEventListener('click', () => {
  alert('Games section coming soon! Stay tuned for interactive games and challenges!');
});
