exports.handler = async () => {
  return {
    statusCode: 200,
    headers: { "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify({ 
      key: process.env.RAZORPAY_KEY_ID 
    })
  }
}
