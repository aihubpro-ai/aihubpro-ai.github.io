function buyPlan(plan) {
    if(!document.getElementById('agreeHike').checked) {
        alert('Please tick the checkbox and agree to Terms first');
        return;
    }
    
    var amount = plan === 'PRO' ? 66600 : 99900;
    var planName = plan === 'PRO' ? 'AIHubPro PRO' : 'AIHubPro PRO MAX';
    
    var options = {
        "key": "rzp_live_T7M4Hj1fpWQ5tK", // ← LIVE KEY LAG GAYI
        "amount": amount,
        "currency": "INR",
        "name": "Vasu Enterprises",
        "description": planName + " Monthly Subscription",
        "handler": function (response){
            alert('Payment Success! Payment ID: ' + response.razorpay_payment_id + '\nAb aap PRO user ho!');
            // Yahan PRO access dene ka code baad mein add karenge
        },
        "prefill": {
            "name": "AIHubPro Customer",
            "email": "vasu081120@gmail.com"
        },
        "theme": {
            "color": "#00d4ff"
        }
    };
    var rzp1 = new Razorpay(options);
    rzp1.on('payment.failed', function (response){
        alert('Payment Failed: ' + response.error.description);
    });
    rzp1.open();
}
