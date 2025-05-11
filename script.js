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

  btn.addEventListener('click', () => {
    modal.style.display = 'block';
    setTimeout(() => {
      modal.classList.add('active');
    }, 10);
  });
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

// Form submission handlers
document.querySelectorAll('form').forEach(form => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formId = form.id;

    // Webhook logic for ban appeal form only
    if (formId === "appeal-form") {
      const username = form.querySelector('#username').value;
      const discordId = form.querySelector('#discord').value;
      const reason = form.querySelector('#reason').value;

      const webhookURL = 'https://discord.com/api/webhooks/1371143336135491645/-WshRcFpKQcT4GEo98LCBlSvGldg0_MJrGlz-WSoI8INgo8jEqGk06NWOem_rCziZApr';

      const payload = {
        content: `📩 **New Ban Appeal Submitted**\n\n**Username:** ${username}\n**Discord ID:** ${discordId}\n**Reason:** ${reason}`
      };

      try {
        const res = await fetch(webhookURL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('Webhook failed');
      } catch (err) {
        alert('Failed to send appeal to Discord.');
        return;
      }
    }

    // Success message logic
    const modal = form.closest('.modal');
    const modalContent = modal.querySelector('.modal-content');
    const originalContent = modalContent.innerHTML;

    modalContent.innerHTML = `
      <h2 class="modal-title" style="color: #4CAF50; margin-bottom: 20px;">Success!</h2>
      <p style="text-align: center; margin-bottom: 20px;">Your submission has been received.</p>
      <button class="btn" style="width: 100%; background: linear-gradient(45deg, #9c27b0, #3f51b5);">Close</button>
    `;

    modalContent.querySelector('button').addEventListener('click', () => {
      modal.classList.remove('active');
      setTimeout(() => {
        modal.style.display = 'none';
        setTimeout(() => {
          modalContent.innerHTML = originalContent;
          modalContent.querySelector('.close-modal').addEventListener('click', () => {
            modal.classList.remove('active');
            setTimeout(() => {
              modal.style.display = 'none';
            }, 300);
          });
        }, 300);
      }, 300);
    });
  });
});

// External links functionality
document.getElementById('discord-btn').addEventListener('click', () => {
  window.open('https://discord.gg/EynZRyFq3c', '_blank');
});

document.getElementById('youtube-btn').addEventListener('click', () => {
  window.open('https://youtube.com/@Akaxorzo', '_blank');
});

document.getElementById('subscribe-btn').addEventListener('click', (e) => {
  e.preventDefault();
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
document.getElementById('games-btn').addEventListener('click', () => {
  alert('Games section coming soon! Stay tuned for interactive games and challenges!');
});
