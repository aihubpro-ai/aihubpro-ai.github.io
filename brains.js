let trialTime = 300;
let trialInterval;

function startTrial() {
    alert("Free Trial Started! You have 5 minutes of access.");
    document.getElementById('trialTimer').style.display = 'block';
    
    trialInterval = setInterval(function() {
        trialTime--;
        let minutes = Math.floor(trialTime / 60);
        let seconds = trialTime % 60;
        document.getElementById('time').textContent = 
            String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
        
        if (trialTime <= 0) {
            clearInterval(trialInterval);
            document.getElementById('buyPopup').style.display = 'block';
        }
    }, 1000);
}

async function buyPlan(plan) {
    if(!document.getElementById('agreeHike').checked) {
        alert('Please tick the checkbox and agree to Terms first');
        return;
    }

    // Netlify function se key manga
    const res = await fetch('/.netlify/functions/get-key');
    const { key } = await res.json();

    var amount = plan === 'PRO' ? 66600 : 99900;
    var planName = plan === 'PRO' ? 'AIHubPro PRO' : 'AIHubPro PREMIUM';

    var options = {
        "key": key,  // Ab secure tarike se ENV se aayega
        "amount": amount,
        "currency": "INR",
        "name": "Vasu Enterprises",
        "description": planName + " Monthly Subscription",
        "handler": function (response){
            alert('Payment Success! Payment ID: ' + response.razorpay_payment_id + '\nAb aap PRO user ho!');
            // Yahan PRO access dene ka code webhook handle karega
        },
        "prefill": {
            "name": "AIHubPro Customer",
            "email": "" // User ka email yahan daalna baad mein
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
}

window.onload = function() {
    document.getElementById('trialTimer').style.display = 'none';
    document.getElementById('buyPopup').style.display = 'none';
}
