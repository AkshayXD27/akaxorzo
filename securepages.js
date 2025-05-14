// Function to create a secure page protection system for all admin pages
function setupSecurePageProtection() {
  // Create an object with authorized pages and their allowed users
  const pageAccess = {
    'akax.html': ['akshaytest@gmail.com'],
    'page3.html': ['ak2@gmail.com'],
    // Add more pages and their authorized users as needed
  };

  function applyUniversalPageProtection() {
    // Get the current page path
    const currentPage = window.location.pathname.split('/').pop();
    
    // Hide the entire body content initially
    document.body.style.visibility = 'hidden';
    
    // Create loading overlay with security verification animation
    const securityOverlay = document.createElement('div');
    securityOverlay.id = 'security-overlay';
    securityOverlay.style.position = 'fixed';
    securityOverlay.style.top = '0';
    securityOverlay.style.left = '0';
    securityOverlay.style.width = '100%';
    securityOverlay.style.height = '100%';
    securityOverlay.style.backgroundColor = 'rgba(18, 18, 18, 0.97)';
    securityOverlay.style.backdropFilter = 'blur(10px)';
    securityOverlay.style.display = 'flex';
    securityOverlay.style.flexDirection = 'column';
    securityOverlay.style.justifyContent = 'center';
    securityOverlay.style.alignItems = 'center';
    securityOverlay.style.zIndex = '9999';
    securityOverlay.style.transition = 'opacity 0.5s ease';
    
    securityOverlay.innerHTML = `
      <div style="color: white; font-family: 'Poppins', sans-serif; text-align: center; padding: 20px;">
        <div style="margin-bottom: 20px;">
          <i class="fas fa-shield-alt" style="font-size: 48px; color: #9c27b0;"></i>
        </div>
        <h2 style="margin-bottom: 10px;">Secure Authentication</h2>
        <div style="margin: 20px 0;">
          <i class="fas fa-spinner fa-spin" style="font-size: 24px;"></i>
        </div>
        <p>Verifying credentials...</p>
      </div>
    `;
    
    document.body.appendChild(securityOverlay);
    
    // Get current user from session storage
    const currentUser = sessionStorage.getItem('loggedInUser');
    
    // Check if the page is protected
    if (pageAccess[currentPage]) {
      // This is a protected page, verify authorization
      
      // Check if user is logged in
      if (!currentUser) {
        showAuthError('Authentication Required', 'Please log in to access this page.', 'index.html');
        return;
      }
      
      // Check if user is authorized for this specific page
      if (!pageAccess[currentPage].includes(currentUser)) {
        // Find the user's authorized page, if any
        let userAuthorizedPage = null;
        
        Object.entries(pageAccess).forEach(([page, users]) => {
          if (users.includes(currentUser)) {
            userAuthorizedPage = page;
          }
        });
        
        showAuthError(
          'Access Denied', 
          'You are not authorized to view this page.',
          userAuthorizedPage || 'index.html'
        );
        return;
      }
      
      // User is authorized, show content after brief delay
      setTimeout(() => {
        securityOverlay.style.opacity = '0';
        setTimeout(() => {
          securityOverlay.remove();
          document.body.style.visibility = 'visible';
          
          // Update user info if element exists
          const userEmailElement = document.getElementById('user-email');
          if (userEmailElement) {
            userEmailElement.textContent = currentUser;
          }
        }, 500);
      }, 1000);
      
    } else {
      // Not a protected page, remove overlay immediately
      securityOverlay.remove();
      document.body.style.visibility = 'visible';
    }
  }
  
  // Function to display authentication errors and redirect
  function showAuthError(title, message, redirectTo) {
    const overlay = document.getElementById('security-overlay');
    
    overlay.innerHTML = `
      <div style="color: white; font-family: 'Poppins', sans-serif; text-align: center; max-width: 80%; padding: 30px;">
        <div style="margin-bottom: 20px;">
          <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #F44336;"></i>
        </div>
        <h2 style="color: #F44336; margin-bottom: 20px;">${title}</h2>
        <p style="font-size: 18px; margin-bottom: 20px;">${message}</p>
        <p>Redirecting you to the appropriate page...</p>
        <div class="auth-progress-bar" style="
          width: 100%; 
          height: 4px; 
          background-color: rgba(255,255,255,0.2); 
          margin-top: 30px; 
          border-radius: 2px; 
          overflow: hidden;
        ">
          <div class="auth-progress-fill" style="
            height: 100%; 
            width: 0%; 
            background: linear-gradient(45deg, #9c27b0, #3f51b5); 
            transition: width 2s linear;
          "></div>
        </div>
      </div>
    `;
    
    // Animate progress bar
    setTimeout(() => {
      const progressFill = document.querySelector('.auth-progress-fill');
      if (progressFill) progressFill.style.width = '100%';
    }, 50);
    
    // Redirect after delay
    setTimeout(() => {
      window.location.href = redirectTo;
    }, 2000);
  }
  
  // Apply protection when DOM is loaded
  document.addEventListener('DOMContentLoaded', applyUniversalPageProtection);
}

// Call this in a global script that's included on all admin pages
setupSecurePageProtection();

