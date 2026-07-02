// AIHubPro - brains.js - Final Version
// Trial: 5 minutes | Payment: Razorpay

let trialTime = 300; // 5 minutes = 300 seconds
let trialInterval;

function startTrial() {
    alert("Free Trial Started! You have 5 minutes of access.");
    
    // Timer dikhao
    document.getElementById('trialTimer').style.display = 'block';
    
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

async function buyPlan(plan) {
    // Checkbox check karo
    if (!document.getElementById('agreeHike').checked) {
        alert('Please tick the checkbox and agree to Terms first');
        return;
    }

    // Netlify function se Razorpay key manga
    try {
        const res = await fetch('/.netlify/functions/get-key');
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
        alert('Error: Razorpay key nahi mili. Netlify function check karo.');
        console.log(error);
    }
}

// Page load hote hi timer aur popup hide kar do
window.onload = function() {
    if (document.getElementById('trialTimer')) {
        document.getElementById('trialTimer').style.display = 'none';
    }
    if (document.getElementById('buyPopup')) {
        document.getElementById('buyPopup').style.display = 'none';
    }
}
