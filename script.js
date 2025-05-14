// Firebase setup and authentication
document.addEventListener('DOMContentLoaded', function() {
  // Handle button hover animations
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
        
        console.log(`Button ${btnId} clicked, opening modal ${modalId}`);
        modal.style.display = 'block';
        setTimeout(() => {
          modal.classList.add('active');
        }, 10);
      });
    } else {
      console.warn(`Missing elements for button ${btnId} or modal ${modalId}`);
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

  // External links functionality
  document.getElementById('discord-btn')?.addEventListener('click', () => {
    console.log("Discord button clicked");
    window.open('https://discord.gg/EynZRyFq3c', '_blank');
  });

  document.getElementById('youtube-btn')?.addEventListener('click', () => {
    console.log("YouTube button clicked");
    window.open('https://youtube.com/@Akaxorzo', '_blank');
  });

  document.getElementById('subscribe-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    console.log("Subscribe button clicked");
    window.open('https://youtube.com/@Akaxorzo?sub_confirmation=1', '_blank');
  });

  // Social icon links
  document.querySelectorAll('.social-icon').forEach((icon, index) => {
    icon.addEventListener('click', () => {
      const links = [
        'https://twitch.tv/youraccount',
        'https://twitter.com/youraccount'
      ];
      console.log(`Social icon ${index} clicked`);
      window.open(links[index], '_blank');
    });
  });

  // Games button functionality
  document.getElementById('games-btn')?.addEventListener('click', () => {
    console.log("Games button clicked");
    alert('Games section coming soon! Stay tuned for interactive games and challenges!');
  });

  // Form submission handling
  setupFormSubmissions();
  
  // Connect mobile login button to the main login button functionality
  const mobileLoginBtn = document.getElementById('login-btn-mobile');
  const mainLoginBtn = document.getElementById('login-btn');
  const loginModal = document.getElementById('login-modal');
  
  if (mobileLoginBtn && mainLoginBtn && loginModal) {
    mobileLoginBtn.addEventListener('click', () => {
      loginModal.style.display = 'block';
      setTimeout(() => {
        loginModal.classList.add('active');
      }, 10);
    });
  }
  
  // Add the custom popup styles to the document
  const popupStyles = document.createElement('style');
  popupStyles.textContent = `
    .custom-popup-content button:hover {
      opacity: 0.9;
      transform: translateY(-2px);
    }
    
    .custom-popup-content button:active {
      transform: translateY(1px);
    }
    
    @media (max-width: 768px) {
      .custom-popup-content {
        width: 90% !important;
        padding: 20px !important;
      }
      
      .custom-popup-content h3 {
        font-size: 18px !important;
      }
      
      .custom-popup-content p {
        font-size: 14px !important;
      }
    }
  `;
  document.head.appendChild(popupStyles);
});

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

// Setup form submissions
function setupFormSubmissions() {
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      console.log(`Form ${form.id} submitted`);
      
      // Get the form ID to determine what action to take
      const formId = form.id;
      
      // Handle login form separately if using Firebase
      if (formId === 'login-form') {
        handleLoginForm(form);
        return;
      }
      
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
            icon_url: "https://postimg.cc/cvs0th8H" // Replace with your logo URL
          },
          timestamp: new Date().toISOString()
        }]
      };
      
      // Configure webhook based on form type
      if (formId === 'friend-form') {
        webhookData.embeds[0].title = "New Friend Request";
        webhookData.embeds[0].color = 5763719; // Green color
        webhookData.embeds[0].description = "**Friend Request Details:**\n";
      }
      else if (formId === 'appeal-form') {
        webhookData.embeds[0].title = "New Ban Appeal";
        webhookData.embeds[0].description = "**Ban Appeal Details:**\n";
        webhookData.embeds[0].color = 15548997; // Red color
      }
      else if (formId === 'events-form') {
        webhookData.embeds[0].title = "New Event Registration";
        webhookData.embeds[0].description = "Someone registered for an event";
        webhookData.embeds[0].color = 16750848; // Orange color
      }
      
      // Add all form fields to the description and as fields
      Object.entries(formEntries).forEach(([key, value]) => {
        webhookData.embeds[0].description += `**${key.charAt(0).toUpperCase() + key.slice(1)}:** ${value || "Not provided"}\n`;
        webhookData.embeds[0].fields.push({
          name: key.charAt(0).toUpperCase() + key.slice(1),
          value: value || "Not provided",
          inline: true
        });
      });
      
      // Set the submit button to loading state
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.innerHTML = 'Submitting...';
      submitBtn.disabled = true;
      
      // Send to Netlify function if available, otherwise simulate
      if (typeof fetch === 'function') {
        fetch("/.netlify/functions/submit-form", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ webhookData: webhookData })
        })
        .then(res => {
          if (!res.ok) {
            if (res.status === 429) {
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
          
          displayFormSuccess(form, data);
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
      } else {
        // Fallback to simulation if fetch is not available
        simulateFormSuccess(form, formId);
      }
    });
  });
}

// Function to display form success
function displayFormSuccess(form, data) {
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
      </p>` : 
      `<p style="text-align: center; margin-bottom: 20px; font-size: 14px; color: white;">
        Thank you for your submission!
      </p>`}
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
}

// Function to simulate form success (for testing only)
function simulateFormSuccess(form, formId) {
  console.log("Simulating form success for", formId);
  
  // Record this submission for client-side rate limiting
  recordSubmission(formId);
  
  // Show success message
  const data = {
    remainingHourly: 1,
    remainingDaily: 4
  };
  
  displayFormSuccess(form, data);
}

// Function to create and show a custom popup
function showCustomPopup(title, message, type = 'info') {
  // Remove any existing popups first
  const existingPopup = document.querySelector('.custom-popup-container');
  if (existingPopup) existingPopup.remove();

  // Create the popup container
  const popupContainer = document.createElement('div');
  popupContainer.className = 'custom-popup-container';
  
  // Set container styles
  popupContainer.style.cssText = `
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
    opacity: 0;
    transition: opacity 0.3s ease;
  `;

  // Determine color based on type
  let color = '#3f51b5'; // Default blue
  let icon = 'fa-info-circle';
  
  if (type === 'success') {
    color = '#4CAF50'; // Green
    icon = 'fa-check-circle';
  } else if (type === 'error') {
    color = '#F44336'; // Red
    icon = 'fa-exclamation-circle';
  } else if (type === 'warning') {
    color = '#FF9800'; // Orange
    icon = 'fa-exclamation-triangle';
  }

  // Create the popup content
  popupContainer.innerHTML = `
    <div class="custom-popup-content" style="
      background-color: rgba(15, 15, 20, 0.95);
      border-radius: 15px;
      padding: 25px;
      max-width: 400px;
      width: 90%;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      border: 2px solid rgba(156, 39, 176, 0.4);
      transform: scale(0.9);
      transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    ">
      <div style="font-size: 40px; color: ${color}; margin-bottom: 15px;">
        <i class="fas ${icon}"></i>
      </div>
      <h3 style="color: white; margin-bottom: 15px; font-size: 22px;">${title}</h3>
      <p style="color: white; margin-bottom: 20px; font-size: 16px;">${message}</p>
      <button class="btn custom-popup-close" style="
        padding: 10px 25px;
        background: linear-gradient(45deg, #9c27b0, #3f51b5);
        color: white;
        border: none;
        border-radius: 8px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s;
      ">Close</button>
    </div>
  `;

  // Add the popup to the document
  document.body.appendChild(popupContainer);

  // Force reflow to enable transition
  void popupContainer.offsetWidth;

  // Show the popup with animation
  popupContainer.style.opacity = '1';
  setTimeout(() => {
    const content = popupContainer.querySelector('.custom-popup-content');
    content.style.transform = 'scale(1)';
  }, 10);

  // Add event listener to close button
  const closeBtn = popupContainer.querySelector('.custom-popup-close');
  closeBtn.addEventListener('click', () => {
    const content = popupContainer.querySelector('.custom-popup-content');
    content.style.transform = 'scale(0.9)';
    popupContainer.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(popupContainer);
    }, 300);
  });

  // Auto-close after 5 seconds for success messages
  if (type === 'success') {
    setTimeout(() => {
      if (popupContainer.parentNode) {
        const content = popupContainer.querySelector('.custom-popup-content');
        content.style.transform = 'scale(0.9)';
        popupContainer.style.opacity = '0';
        setTimeout(() => {
          if (popupContainer.parentNode) {
            document.body.removeChild(popupContainer);
          }
        }, 300);
      }
    }, 5000);
  }
}

// Function to handle login form with Firebase
function handleLoginForm(form) {
  const formData = new FormData(form);
  const email = formData.get('email');
  const password = formData.get('password');
  
  console.log(`Login attempt with email: ${email}`);
  
  // Check if Firebase is available
  if (typeof firebase !== 'undefined' && firebase.auth) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Logging in...';
    submitBtn.disabled = true;
    
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log("User logged in:", user.email);
        
        // Store user email in session storage for page protection
        sessionStorage.setItem('loggedInUser', user.email);
        
        // Show success popup
        showCustomPopup('Login Successful', `Welcome back, ${user.email}!`, 'success');
        
        // User-specific redirects based on email after a short delay
        setTimeout(() => {
          if (user.email === 'akshaytest@gmail.com') {
            window.location.href = 'akax.html';
          } else if (user.email === 'ak2@gmail.com') {
            window.location.href = 'page3.html';
          } else {
            // Default redirect for other authenticated users
            window.location.href = 'dashboard.html';
          }
        }, 1500);
      })
      .catch((error) => {
        console.error("Login error:", error.code, error.message);
        
        // Show error popup instead of alert
        showCustomPopup('Login Failed', error.message, 'error');
        
        // Reset button state
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
      });
  } else {
    // Fallback if Firebase is not initialized
    console.error("Firebase not available");
    showCustomPopup('System Error', 'Login functionality is not available. Please try again later.', 'error');
  }
}
