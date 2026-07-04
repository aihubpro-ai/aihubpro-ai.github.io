// AIHubPro - brains.js - Final Bomb-Proof Version
// Trial: 5 minutes | Payment: Razorpay with Payment Link Fallback

// ===== 1. CONFIG & CONSTANTS =====
let trialTime = 300; // 5 minutes = 300 seconds
let trialInterval;

// NAYA: Payment Links for Netlify failover
const PAYMENT_LINKS = {
  PRO: 'https://rzp.io/rzp/pE0rfxQx', // ₹666 Pro Plan
  PREMIUM: 'https://rzp.io/rzp/NQBaTPN' // ₹999 Premium Plan
};

// ===== 2. TRIAL FUNCTION - TERA PURANA CODE =====
function startTrial() {
  alert("Free Trial Started! You have 5 minutes of access.");

  // Timer dikhao
  if (document.getElementById('trialTimer')) {
    document.getElementById('trialTimer').style.display = 'block';
  }

  // Trial page pe bhejo
  window.location.href = "/trial.html";

  // Timer chalu karo
  trialInterval = setInterval(function() {
    trialTime--;
    let minutes = Math.floor(trialTime / 60);
    let seconds = trialTime % 60;

    // Timer update karo
    if (document.getElementById('time')) {
      document.getElementById('time').textContent =
        String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
    }

    // Time khatam ho gaya
    if (trialTime <= 0) {
      clearInterval(trialInterval);
      alert("Trial Ended! Buy subscription to continue.");
      window.location.href = "/"; // Wapas home page
    }
  }, 1000);
}

// ===== 3. BUY PLAN - UPGRADED WITH FALLBACK =====
async function buyPlan(plan) {
  // Checkbox check karo
  if (!document.getElementById('agreeHike') || !document.getElementById('agreeHike').checked) {
    alert('Please tick the checkbox and agree to Terms first');
    return;
  }

  // STEP 1: Netlify function se Razorpay key aur order manga
  try {
    const res = await fetch('/.netlify/functions/get-key');
    
    // Agar Netlify response OK nahi hai to error throw karo
    if (!res.ok) {
      throw new Error('Netlify function failed');
    }
    
    const { key } = await res.json();

    var amount = plan === 'PRO' ? 66600 : 99900; // paise mein
    var planName = plan === 'PRO' ? 'AIHubPro PRO' : 'AIHubPro PREMIUM';

    var options = {
      "key": key,
      "amount": amount,
      "currency": "INR",
      "name": "Vasu Enterprises",
      "description": planName + " Monthly Subscription",
      "handler": function (response){
        alert('Payment Success! Payment ID: ' + response.razorpay_payment_id + '\nAb aap PRO user ho!');
        window.location.href = "/success.html";
      },
      "prefill": {
        "name": "AIHubPro Customer",
        "email": ""
      },
      "theme": {
        "color": "#FFD700"
      }
    };

    var rzp1 = new Razorpay(options);
    rzp1.on('payment.failed', function (response){
      alert('Payment Failed: ' + response.error.description);
    });
    rzp1.open();

  } catch (error) {
    // STEP 2: NETLIFY FAIL → DIRECT PAYMENT LINK FALLBACK
    console.log('Netlify Error:', error);
    alert('Server busy. Redirecting to secure Razorpay payment page...');
    window.location.href = PAYMENT_LINKS; // PRO ya PREMIUM ka link khulega
  }
}

// ===== 4. PAGE LOAD PE TIMER AUR POPUP HIDE KAR DO =====
window.onload = function() {
  if (document.getElementById('trialTimer')) {
    document.getElementById('trialTimer').style.display = 'none';
  }
  if (document.getElementById('buyPopup')) {
    document.getElementById('buyPopup').style.display = 'none';
  }
}
