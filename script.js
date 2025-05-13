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

// Open modal
Object.entries(modals).forEach(([btnId, modalId]) => {
  const btn = document.getElementById(btnId);
  const modal = document.getElementById(modalId);
  
  if (btn && modal) {
    btn.addEventListener('click', () => {
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
        throw new Error(`Server responded with ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      console.log("Webhook response:", data);
      
      // Show success message
      const modal = form.closest('.modal');
      const modalContent = modal.querySelector('.modal-content');
      const originalContent = modalContent.innerHTML;
      
      // Replace with success message
      modalContent.innerHTML = `
        <h2 class="modal-title" style="color: #4CAF50; margin-bottom: 20px;">Success!</h2>
        <p style="text-align: center; margin-bottom: 20px;">Your submission has been received.</p>
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
      alert("There was an error submitting your form. Please try again later.");
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
