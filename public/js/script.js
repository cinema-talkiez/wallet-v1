document.addEventListener('DOMContentLoaded', () => {
  console.log("✅ Script loaded");

  const form = document.getElementById('auth-form');
  const title = document.getElementById('form-title');
  const submitBtn = document.getElementById('submit-btn');
  const toggleText = document.getElementById('toggle-text');
  const nameField = document.getElementById('name-field');
  let isLogin = true;

  // 🔁 Toggle between login/register
  function setupToggle() {
    const link = document.getElementById('toggle-link');
    if (!link) return;

    link.addEventListener('click', (e) => {
      e.preventDefault();
      isLogin = !isLogin;

      if (isLogin) {
        title.textContent = 'Login';
        submitBtn.textContent = 'Login';
        toggleText.innerHTML = `Don't have an account? <a href="#" id="toggle-link">Register</a>`;
        nameField.style.display = 'none';
      } else {
        title.textContent = 'Register';
        submitBtn.textContent = 'Register';
        toggleText.innerHTML = `Already have an account? <a href="#" id="toggle-link">Login</a>`;
        nameField.style.display = 'block';
      }

      setupToggle(); // Re-attach listener to new link
    });
  }

  setupToggle();

  // 🧩 Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log("🟡 Form submitted");

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const name = isLogin ? null : document.getElementById('name').value.trim();

    if (!email || !password || (!isLogin && !name)) {
      alert("⚠️ Please fill all required fields.");
      return;
    }

    const endpoint = isLogin
      ? '/.netlify/functions/login'
      : '/.netlify/functions/register';
    const body = isLogin ? { email, password } : { name, email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      // The backend should always return JSON
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error("❌ Response not JSON:", text);
        alert("Server error: invalid response format");
        return;
      }

      if (data.success) {
        alert(isLogin ? "Login successful!" : "Registration successful!");
        window.location.href = "/index.html";
      } else {
        alert(data.error || data.message || "Something went wrong.");
      }

    } catch (err) {
      console.error("❌ Network error:", err);
      alert("Network error. Please try again later.");
    }
  });
});
