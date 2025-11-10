<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Withdrawal Request</title>
  <link rel="stylesheet" href="css/style.css" />
</head>
<body>
  <div class="dashboard">
    <div class="wallet-balance">
      Wallet: $<span id="wallet">0</span>
    </div>

    <div class="container">
      <div class="profile-card">
        <h2>Request Withdrawal</h2>
        <p><strong>Available Balance:</strong> $<span id="balance">0</span></p>

        <form id="withdraw-form">
          <div class="input-group">
            <label>Amount (Min $10)</label>
            <input type="number" id="amount" min="10" placeholder="Enter amount" required />
          </div>
          <div class="input-group">
            <label>UPI ID</label>
            <input type="text" id="upiId" placeholder="yourname@upi" required />
          </div>
          <button type="submit" class="earn-btn">Submit Request</button>
        </form>

        <div id="message" style="margin-top: 15px; font-weight: bold; text-align: center;"></div>
      </div>

      <div class="profile-card" style="margin-top: 30px;">
        <h3>Withdrawal History</h3>
        <div id="history-list"></div>
      </div>

      <div class="nav-links">
        <a href="/dashboard.html" class="nav-btn">Start Page</a>
        <a href="/withdrawal.html" class="nav-btn active">Withdrawal Requests</a>
      </div>

      <button id="logout-btn" class="logout-btn">Logout</button>
    </div>
  </div>

  <script src="js/script.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/';
        return;
      }

      let userData;
      try {
        const res = await fetch('/.netlify/functions/check', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!data.loggedIn) throw new Error();

        userData = data.user;
        document.getElementById('wallet').textContent = userData.wallet;
        document.getElementById('balance').textContent = userData.wallet;
      } catch {
        localStorage.removeItem('token');
        window.location.href = '/';
        return;
      }

      const loadHistory = async () => {
        try {
          const res = await fetch('/.netlify/functions/get-withdrawals', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const result = await res.json();
          const list = document.getElementById('history-list');
          list.innerHTML = '';

          if (result.requests.length === 0) {
            list.innerHTML = '<p style="color:#666; text-align:center;">No requests yet.</p>';
            return;
          }

          result.requests.forEach(req => {
            const statusText = req.status === 'rejected' 
              ? '<span style="color:red;">REJECTED (Refunded)</span>' 
              : req.status === 'success' 
                ? '<span style="color:green;">SUCCESS</span>' 
                : '<span style="color:orange;">PENDING</span>';

            const item = document.createElement('div');
            item.className = 'history-item';
            item.innerHTML = `
              <p><strong>Amount:</strong> $${req.amount}</p>
              <p><strong>UPI:</strong> ${req.upiId}</p>
              <p><strong>Status:</strong> ${statusText}</p>
              <p><strong>Date:</strong> ${new Date(req.requestedAt).toLocaleString()}</p>
              <hr style="margin:10px 0; border-color:#eee;">
            `;
            list.appendChild(item);
          });
        } catch (err) {
          console.error('Failed to load history');
        }
      };

      loadHistory();

      document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = '/';
      });

      document.getElementById('withdraw-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const amount = parseFloat(document.getElementById('amount').value);
        const upiId = document.getElementById('upiId').value.trim();
        const messageEl = document.getElementById('message');

        if (amount > userData.wallet) {
          messageEl.style.color = 'red';
          messageEl.textContent = 'Insufficient balance';
          return;
        }

        try {
          const res = await fetch('/.netlify/functions/request-withdrawal', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ amount, upiId })
          });
          const result = await res.json();

          if (result.success) {
            messageEl.style.color = 'green';
            messageEl.textContent = result.message;
            document.getElementById('wallet').textContent = result.newBalance;
            document.getElementById('balance').textContent = result.newBalance;
            userData.wallet = result.newBalance;
            document.getElementById('amount').value = '';
            document.getElementById('upiId').value = '';
            loadHistory();
          } else {
            messageEl.style.color = 'red';
            messageEl.textContent = result.msg;
          }
        } catch (err) {
          messageEl.style.color = 'red';
          messageEl.textContent = 'Network error';
        }
      });
    });
  </script>
</body>
</html>
