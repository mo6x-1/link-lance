/**
 * Login & Sign Up Page JavaScript
 * Handles form submission, validation, auth state, and messaging
 */

document.addEventListener('DOMContentLoaded', function() {

  // ============ UTILITY FUNCTIONS ============
  function q(selector, ctx = document) { return ctx.querySelector(selector); }
  function qa(selector, ctx = document) { return Array.from((ctx || document).querySelectorAll(selector)); }

  function showMessage(form, text, type = 'info') {
    if (!form) return alert(text);
    let msg = q('.form-message', form);
    if (!msg) {
      msg = document.createElement('div');
      msg.className = 'form-message';
      form.insertBefore(msg, form.firstChild);
    }
    msg.textContent = text;
    msg.dataset.type = type;
    setTimeout(() => {
      try {
        if (msg && msg.parentNode) msg.parentNode.removeChild(msg);
      } catch(e) {}
    }, 5000);
  }

  // ============ STORAGE HELPERS ============
  function getStoredUsers() {
    try {
      return JSON.parse(localStorage.getItem('ll_users') || '{}');
    } catch(e) {
      return {};
    }
  }

  function setStoredUsers(obj) {
    localStorage.setItem('ll_users', JSON.stringify(obj));
  }

  // ============ FORM SELECTION ============
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');

  // ============ SIGNUP HANDLER ============
  if (signupForm) {
    signupForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const f = signupForm.elements;
      const username = (f['username']?.value || '').trim();
      const email = (f['email']?.value || '').trim().toLowerCase();
      const pass = f['password']?.value || '';
      const pass2 = f['confirm_password']?.value || '';
      const accept = !!f['accept_terms']?.checked;

      // Validation
      if (!username || !email || !pass || !pass2) {
        return showMessage(signupForm, 'Please fill all required fields', 'error');
      }
      if (pass.length < 6) {
        return showMessage(signupForm, 'Password must be at least 6 characters', 'error');
      }
      if (pass !== pass2) {
        return showMessage(signupForm, 'Passwords do not match', 'error');
      }
      if (!accept) {
        return showMessage(signupForm, 'You must accept the terms', 'error');
      }

      // Check if email already exists
      const users = getStoredUsers();
      if (users[email]) {
        return showMessage(signupForm, 'An account with that email already exists', 'error');
      }

      // Create new user
      users[email] = { username, email, password: pass };
      setStoredUsers(users);
      localStorage.setItem('ll_auth', email);

      showMessage(signupForm, 'Account created — redirecting...', 'success');

      // Update navbar if available
      try {
        if (window.updateAuthNav) {
          window.updateAuthNav();
        }
      } catch(e) {}

      // Redirect to profile page
      setTimeout(() => {
        window.location.href = 'profile.html';
      }, 900);
    });
  }

  // ============ LOGIN HANDLER ============
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const f = loginForm.elements;
      const email = (f['email']?.value || '').trim().toLowerCase();
      const pass = f['password']?.value || '';

      // Validation
      if (!email || !pass) {
        return showMessage(loginForm, 'Enter email and password', 'error');
      }

      // Check credentials
      const users = getStoredUsers();
      const user = users[email];
      if (!user || user.password !== pass) {
        return showMessage(loginForm, 'Invalid email or password', 'error');
      }

      // Set authenticated state
      localStorage.setItem('ll_auth', email);
      showMessage(loginForm, 'Login successful — redirecting...', 'success');

      // Update navbar if available
      try {
        if (window.updateAuthNav) {
          window.updateAuthNav();
        }
      } catch(e) {}

      // Redirect to home
      setTimeout(() => {
        window.location.href = 'main.html';
      }, 700);
    });

    // ============ FORGOT PASSWORD ============
    const forgot = q('.forgot-password');
    if (forgot) {
      forgot.addEventListener('click', function() {
        const emailInput = (loginForm.elements['email']?.value || '').trim().toLowerCase();
        const email = emailInput || prompt('Enter your account email to reset password:');

        if (!email) return;

        const users = getStoredUsers();
        if (!users[email]) {
          return alert('No account found for that email');
        }

        alert('Password reset link simulated — check your email (simulation).');
      });
    }

    // Auto-focus email field
    try {
      if (loginForm.elements['email']) {
        loginForm.elements['email'].focus();
      }
    } catch(e) {}
  }

  // ============ SOCIAL BUTTONS ============
  qa('.social-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      alert('Social sign-in is not implemented in this demo.');
    });
  });

});
// End of login-signup.js
