export async function onRequestPost(context) {
  const { env } = context;

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentDate = now.getDate();

    // 1. MARCH 1 - EMAIL NOTIFICATION (1 month before April increase)
    if (currentMonth === 3 && currentDate === 1) {
      await sendRateIncreaseEmails(env);
      return Response.json({
        success: true,
        message: 'Rate increase emails sent to all users'
      }, { headers });
    }

    // 2. APRIL 1 - AUTO 9% PRICE INCREASE
    if (currentMonth === 4 && currentDate === 1) {
      const newRates = await updatePricing(env);
      return Response.json({
        success: true,
        message: '9% rate increase applied',
        newRates: newRates
      }, { headers });
    }

    return Response.json({
      success: true,
      message: 'No action today',
      nextIncrease: getNextApril1st()
    }, { headers });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers });
  }
}

// FUNCTION: Send email to all paid users
async function sendRateIncreaseEmails(env) {
  // Get all paid users from KV
  const users = await env.USERS_DB?.list({ prefix: 'user_' });
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;

  let emailsSent = 0;

  for (const key of users.keys) {
    const userData = await env.USERS_DB.get(key.name);
    if (!userData) continue;

    const user = JSON.parse(userData);
    if (!user.email ||!user.isPaid) continue;

    // Calculate new price
    const oldPrice = user.plan === '999'? 999 : 666;
    const newPrice = Math.round(oldPrice * 1.09); // 9% increase

    // Send email via SendGrid/Mailgun API
    await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: user.email }],
          subject: 'AihubPro - Annual Price Update Notice'
        }],
        from: { email: 'billing@aihubpro.com', name: 'AihubPro Billing' },
        content: [{
          type: 'text/html',
          value: `
            <h2>Annual Price Update - Effective April 1, ${nextYear}</h2>
            <p>Dear ${user.name},</p>
            <p>As per our Terms & Conditions Clause 4.2, prices increase by 9% annually every April 1st.</p>
            <p><b>Your Current Plan:</b> ₹${oldPrice}/month</p>
            <p><b>New Price from April 1:</b> ₹${newPrice}/month</p>
            <p><b>Effective Date:</b> April 1, ${nextYear}</p>
            <p>If you wish to cancel, please do so before March 31, ${nextYear}.</p>
            <p>Thank you for being a valued customer.</p>
            <p>Team AihubPro</p>
            <hr>
            <small>Legal: Disputes subject to Yamunanagar Court jurisdiction only.</small>
          `
        }]
      })
    });

    emailsSent++;
  }

  return emailsSent;
}

// FUNCTION: Update pricing in KV
async function updatePricing(env) {
  const old666 = await env.PRICING?.get('plan_666') || '666';
  const old999 = await env.PRICING?.get('plan_999') || '999';

  const new666 = Math.round(parseInt(old666) * 1.09);
  const new999 = Math.round(parseInt(old999) * 1.09);

  await env.PRICING.put('plan_666', new666.toString());
  await env.PRICING.put('plan_999', new999.toString());
  await env.PRICING.put('last_update', new Date().toISOString());

  return { plan_666: new666, plan_999: new999 };
}

function getNextApril1st() {
  const now = new Date();
  const year = now.getMonth() >= 3? now.getFullYear() + 1 : now.getFullYear();
  return new Date(year, 3, 1).toISOString();
}
