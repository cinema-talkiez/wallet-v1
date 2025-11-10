// js/script.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('auth-form');
  const title = document.getElementById('form-title');
  const submitBtn = document.getElementById('submit-btn');
  const toggleText = document.getElementById('toggle-text');
  const nameField = document.getElementById('name-field');
  let isLogin = true;

  function setupToggle() {
    const link = document.getElementById('toggle-link');
    if (!link) return;

    // CHANGED: Use onclick instead of addEventListener
    link.onclick = (e) => {
      e.preventDefault();
      isLogin = !isLogin;

      if (isLogin) {
        title.textContent = 'Login';
        submitBtn.textContent = 'Login';
        nameField.style.display = 'none';
        toggleText.innerHTML = `Don't have an account? <a href="#" id="toggle-link">Register</a>`;
      } else {
        title.textContent = 'Register';
        submitBtn.textContent = 'Register';
        nameField.style.display = 'block';
        toggleText.innerHTML = `Already have an account? <a href="#" id="toggle-link">Login</a>`;
      }
      setupToggle(); // Re-attach
    };
  }

  setupToggle();

  // CHANGED: Use onsubmit + await res.json()
  form.onsubmit = async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const name = isLogin ? null : document.getElementById('name').value.trim();

    if (!email || !password || (!isLogin && !name)) {
      alert("Please fill all fields");
      return;
    }

    const endpoint = isLogin ? '/.netlify/functions/login' : '/.netlify/functions/register';
    const body = isLogin ? { email, password } : { name, email, password };

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Loading...';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json(); // SIMPLIFIED

      if (data.success) {
        localStorage.setItem('token', data.token); // ADDED
        window.location.href = data.redirect || '/dashboard.html'; // IMPROVED
      } else {
        alert(data.error || data.msg || 'Authentication failed'); // IMPROVED
      }
    } catch (err) {
      console.error('Auth Error:', err);
      alert('Network error. Please try again.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = isLogin ? 'Login' : 'Register'; // RESET
    }
  };
});
