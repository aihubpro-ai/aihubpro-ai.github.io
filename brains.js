async function buyPlan(plan) {
  if(!document.getElementById('agreeHike').checked) {
    alert('Please tick the checkbox and agree to Terms first');
    return;
  }

  // Netlify function se key manga
  const res = await fetch('/.netlify/functions/get-key');
  const { key } = await res.json();

  var amount = plan === 'PRO' ? 66600 : 99900;
  var planName = plan === 'PRO' ? 'AIHubPro PRO' : 'AIHubPro PRO MAX';

  var options = {
    "key": key, // ← Ab secure tarike se ENV se aayega
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
      "color": "#00d4ff"
    }
  };
  var rzp1 = new Razorpay(options);
  rzp1.on('payment.failed', function (response){
    alert('Payment Failed: ' + response.error.description);
  });
  rzp1.open();
}
