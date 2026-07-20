<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AIHUBPRO | AI Chat, Business Tools, PDF Tools & More</title>
<meta name="description" content="AIHUBPRO - India's Smart AI Platform">
<meta name="theme-color" content="#f8fafc">
<link rel="manifest" href="manifest.json">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_ID" crossorigin="anonymous"></script>
<style>
:root{--bg:#f8fafc;--card:#ffffff;--border:#e2e8f0;--text:#0f172a;--accent:#3b82f6}
*{margin:0;padding:0;box-sizing:border-box} body{font-family:'Poppins',system-ui;background:var(--bg);color:var(--text)}
#loader{position:fixed;inset:0;background:#f8fafc;display:flex;flex-direction:column;justify-content:center;align-items:center;z-index:9999;font-weight:800}
header{display:flex;justify-content:space-between;align-items:center;padding:16px 20px;background:white;border-bottom:1px solid var(--border);position:sticky;top:0;z-index:100}
.logo{font-weight:800;font-size:22px} nav ul{display:flex;gap:16px;list-style:none} nav a{text-decoration:none;color:var(--text);font-weight:500}
.hero{text-align:center;padding:70px 20px;background:linear-gradient(180deg,#ffffff,#f8fafc)}
.hero h1{font-size:42px;font-weight:800} .hero p{margin:12px 0;color:#475569}
.hero-buttons button{padding:14px 28px;border:none;border-radius:12px;font-weight:600;cursor:pointer;margin:6px}
#chatBtn{background:var(--accent);color:white} #toolsBtn{background:white;border:1px solid var(--border)}
#topAd{text-align:center;padding:10px;background:#f1f5f9;display:none}
.search-section{text-align:center;padding:24px} #searchBox{padding:12px 16px;border:1px solid var(--border);border-radius:12px;width:90%;max-width:500px;font-size:15px}
.tools-section{max-width:1200px;margin:0 auto;padding:20px} .section-title{font-size:22px;margin-bottom:16px;font-weight:700}
.tools-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px}
.tool-card{background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:20px;transition:0.2s}
.tool-card:hover{transform:translateY(-3px);box-shadow:0 8px 20px rgba(0,0,0,0.06)}
.tool-icon{font-size:36px;margin-bottom:10px} .tool-card h3{font-size:18px;margin-bottom:5px} .tool-card p{font-size:13px;color:#64748b}
.tool-card button{margin-top:12px;padding:8px 16px;background:#3b82f6;color:white;border:none;border-radius:8px;cursor:pointer}
.chat-widget{position:fixed;top:85px;right:20px;width:390px;height:560px;background:white;border:1px solid var(--border);border-radius:16px;display:none;flex-direction:column;z-index:999;box-shadow:0 10px 30px rgba(0,0,0,0.15)}
.chat-header{padding:14px 16px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;font-weight:700}
.chat-box{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px}
.message{padding:10px 14px;border-radius:14px;max-width:85%;font-size:14px;line-height:1.4}
.ai-msg{background:#f1f5f9;align-self:flex-start} .user-msg{background:#3b82f6;color:white;align-self:flex-end}
.chat-input{display:flex;gap:8px;padding:12px;border-top:1px solid #e2e8f0}
.chat-input input{flex:1;padding:10px;border:1px solid var(--border);border-radius:8px}
.chat-input button{padding:10px 14px;background:var(--accent);color:white;border:none;border-radius:8px;cursor:pointer}
@media(max-width:768px){.hero h1{font-size:32px} .tools-grid{grid-template-columns:1fr 1fr} .chat-widget{width:95%;right:2.5%;height:80vh;top:10%}}
</style>
</head>
<body>

<div id="loader"><div style="font-size:28px">⚡ AIHUBPRO</div><div style="margin-top:8px;font-weight:400">Loading India's Most Powerful AI...</div></div>

<header><div class="logo">⚡ AIHUBPRO</div><nav><ul><li><a href="#">Home</a></li><li><a href="#tools">Tools</a></li><li><a href="#">Pricing</a></li></ul></nav></header>

<section class="hero">
<h1>India's Most Powerful AI Platform</h1>
<p>AI Chat • Business Tools • PDF Tools • Image Tools • Developer Tools</p>
<div class="hero-buttons"><button id="chatBtn">🤖 Start AI Chat</button><button id="toolsBtn">🛠️ Explore Tools</button></div>
</section>

<div id="topAd">Advertisement • PLUS Plan me ads nahi • <a href="#" onclick="pay(666)" style="color:#3b82f6;font-weight:600">Upgrade to PLUS</a></div>

<section class="search-section"><input type="text" id="searchBox" placeholder="Search any tool... e.g. GST, PDF, QR"></section>

<main id="tools">
<section class="tools-section"><h2 class="section-title">💼 Business Tools</h2><div class="tools-grid">
<div class="tool-card"><div class="tool-icon">📊</div><h3>GST Calculator</h3><p>Inclusive, Exclusive, Reverse GST</p><button onclick="openTool('gst-calculator')">Open</button></div>
<div class="tool-card"><div class="tool-icon">🧾</div><h3>Invoice Generator</h3><p>Create GST Invoice with PDF</p><button onclick="openTool('invoice-generator')">Open</button></div>
<div class="tool-card"><div class="tool-icon">📝</div><h3>Quotation Generator</h3><p>Create Professional Quotations</p><button onclick="openTool('quotation-generator')">Open</button></div>
<div class="tool-card"><div class="tool-icon">💰</div><h3>Profit Margin Calculator</h3><p>Calculate Profit, Margin</p><button onclick="openTool('profit-margin')">Open</button></div>
<div class="tool-card"><div class="tool-icon">🏷️</div><h3>GST Rate Finder</h3><p>Search GST Rates Quickly</p><button onclick="openTool('gst-rate-finder')">Open</button></div>
</div></section>
<section class="tools-section"><h2 class="section-title">💰 Finance Tools</h2><div class="tools-grid">
<div class="tool-card"><div class="tool-icon">🏦</div><h3>EMI Calculator</h3><p>Loan EMI Calculator with Charts</p><button onclick="openTool('emi-calculator')">Open</button></div>
<div class="tool-card"><div class="tool-icon">📈</div><h3>SIP Calculator</h3><p>Future Wealth Calculator</p><button onclick="openTool('sip-calculator')">Open</button></div>
<div class="tool-card"><div class="tool-icon">💳</div><h3>Loan Calculator</h3><p>Complete Loan Analysis</p><button onclick="openTool('loan-calculator')">Open</button></div>
<div class="tool-card"><div class="tool-icon">📊</div><h3>GST Advanced</h3><p>Advanced GST Calculations</p><button onclick="openTool('gst-advanced')">Open</button></div>
</div></section>
<section class="tools-section"><h2 class="section-title">📄 PDF Tools</h2><div class="tools-grid">
<div class="tool-card"><div class="tool-icon">📑</div><h3>Merge PDF</h3><p>Merge Multiple PDFs into One</p><button onclick="openTool('merge-pdf')">Open</button></div>
<div class="tool-card"><div class="tool-icon">✂️</div><h3>Split PDF</h3><p>Split PDF into Pages</p><button onclick="openTool('split-pdf')">Open</button></div>
<div class="tool-card"><div class="tool-icon">🗜️</div><h3>Compress PDF</h3><p>Reduce PDF Size</p><button onclick="openTool('compress-pdf')">Open</button></div>
</div></section>
<section class="tools-section"><h2 class="section-title">🖼️ Image Tools</h2><div class="tools-grid">
<div class="tool-card"><div class="tool-icon">📷</div><h3>Image Compressor</h3><p>Compress Image Size</p><button onclick="openTool('image-compressor')">Open</button></div>
<div class="tool-card"><div class="tool-icon">📐</div><h3>Image Resizer</h3><p>Resize Images Quickly</p><button onclick="openTool('image-resizer')">Open</button></div>
<div class="tool-card"><div class="tool-icon">🖼️</div><h3>JPG → PNG</h3><p>Convert JPG to PNG</p><button onclick="openTool('jpg-to-png')">Open</button></div>
</div></section>
<section class="tools-section"><h2 class="section-title">💻 Developer Tools</h2><div class="tools-grid">
<div class="tool-card"><div class="tool-icon">⬛</div><h3>QR Generator</h3><p>Create QR Codes Instantly</p><button onclick="openTool('qr-generator')">Open</button></div>
<div class="tool-card"><div class="tool-icon">🔐</div><h3>Password Generator</h3><p>Generate Secure Passwords</p><button onclick="openTool('password-generator')">Open</button></div>
<div class="tool-card"><div class="tool-icon">{ }</div><h3>JSON Formatter</h3><p>Format & Beautify JSON</p><button onclick="openTool('json-formatter')">Open</button></div>
</div></section>
</main>

<div class="chat-widget" id="chatWidget">
<div class="chat-header">🤖 AIHUBPRO <button onclick="closeChat()" style="background:none;border:none;font-size:18px;cursor:pointer">✕</button></div>
<div class="chat-box" id="chatBox"><div class="message ai-msg">Hi! Main AIHUBPRO hun. 5 min free trial hai! 😊</div></div>
<div class="chat-input"><input type="text" id="chatInput" placeholder="Message likho..." onkeypress="if(event.key==='Enter')sendChat()"><button onclick="sendChat()">Send</button></div>
</div>

<div id="paymentModal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.75); z-index:10000; justify-content:center; align-items:center;">
  <div style="background:white; padding:24px; border-radius:16px; width:92%; max-width:400px; text-align:center;">
    <h2>⏰ 5 Minute Free Trial Khatam!</h2>
    <p style="margin:8px 0;color:#475569">Continue karne ke liye plan lo</p>
    <p style="font-size:12px;color:#64748b">Agla Free Access: <span id="nextTime"></span></p>
    <div style="display:flex; gap:12px; margin:18px 0;">
      <div onclick="pay(666)" style="flex:1; border:2px solid #3b82f6; border-radius:12px; padding:14px; cursor:pointer;"><h3 style="color:#3b82f6">₹666</h3><p style="font-size:12px">1 Month PLUS</p><button style="margin-top:8px; background:#3b82f6; color:white; border:none; padding:8px 14px; border-radius:8px; width:100%">Buy Now</button></div>
      <div onclick="pay(999)" style="flex:1; border:2px solid #f59e0b; border-radius:12px; padding:14px; cursor:pointer;"><h3 style="color:#f59e0b">₹999</h3><p style="font-size:12px">3 Month PRO</p><button style="margin-top:8px; background:#f59e0b; color:white; border:none; padding:8px 14px; border-radius:8px; width:100%">Buy Now</button></div>
    </div>
    <p style="font-size:11px;color:#94a3b8">⚖️ Jurisdiction: Yamunanagar Court Only</p>
  </div>
</div>

<script>
window.addEventListener('load',()=>{
  setTimeout(()=>{document.getElementById('loader').style.display='none'},500);
  document.getElementById('toolsBtn').addEventListener('click',()=>{document.getElementById('tools').scrollIntoView({behavior:'smooth'})});
  document.getElementById('chatBtn').addEventListener('click',()=>{openChat()});
  document.getElementById('searchBox').addEventListener('input',function(){
    const q=this.value.toLowerCase().trim();
    document.querySelectorAll('.tool-card').forEach(c=>{ c.style.display = c.innerText.toLowerCase().includes(q) ? 'block' : 'none'; });
  });
});
function openChat(){document.getElementById('chatWidget').style.display='flex';}
function closeChat(){document.getElementById('chatWidget').style.display='none';}
function isPro(){ return localStorage.getItem('plan')==='pro' || localStorage.getItem('isPaid')==='true'; }
if(!isPro()){ document.getElementById('topAd').style.display='block'; }
let trialStart = localStorage.getItem('trialStart');
if(!trialStart){ localStorage.setItem('trialStart', Date.now()); trialStart = Date.now(); } else trialStart = parseInt(trialStart);
function showLock(){
  const next = new Date(Date.now()+24*60*60*1000);
  document.getElementById('nextTime').innerText = next.toLocaleString('en-IN');
  document.getElementById('paymentModal').style.display='flex';
}
function checkTrialLock(){
  if(isPro()) return true;
  if(Date.now() - trialStart > 5*60*1000){ showLock(); return false; }
  return true;
}
setInterval(checkTrialLock, 2000);
function openTool(name){
  if(!checkTrialLock()) return;
  window.location.href='/tools/'+name;
}
let currentTrialData=null;
async function sendChat(){
  if(!checkTrialLock()) return;
  const input=document.getElementById('chatInput'); const msg=input.value.trim(); if(!msg) return;
  const box=document.getElementById('chatBox'); 
  box.innerHTML+=`<div class="message user-msg">${msg}</div>`;
  input.value=''; 
  const loadId='load-'+Date.now(); 
  box.innerHTML+=`<div class="message ai-msg" id="${loadId}">Typing...</div>`; 
  box.scrollTop=box.scrollHeight;
  try{
    const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:msg})});
    const data=await res.json(); 
    const el=document.getElementById(loadId);
    if(data.reply==='TRIAL_ENDED' || data.error==='TRIAL_ENDED'){ 
      currentTrialData=data; 
      el.innerHTML=`<div>⏰ 5 min khatam! Plan lo: <button onclick="pay(666)" style="background:#3b82f6;color:white;border:none;padding:4px 8px;border-radius:4px">₹666</button> <button onclick="pay(999)" style="background:#f59e0b;color:white;border:none;padding:4px 8px;border-radius:4px">₹999</button></div>`; 
      showLock();
    } else { 
      el.innerHTML=window.marked?marked.parse(data.reply||''):data.reply||'No reply';
    }
  }catch(e){ document.getElementById(loadId).innerHTML='❌ /api/chat error: '+e.message; }
  box.scrollTop=box.scrollHeight;
}
async function pay(amount){
  try{
    let orderId=null, keyId=null;
    try{
      const oRes=await fetch('/api/create-order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({amount:amount, plan: amount==666?'plus':'pro'})});
      const oData=await oRes.json(); 
      orderId=oData.order_id || oData.orderId || oData.id || null; 
      keyId=oData.key || oData.keyId || oData.razorpay_key || currentTrialData?.razorpay_key || null;
      currentTrialData = oData;
    }catch(err){ console.log('order error', err); }
    const options={
      key: keyId,
      amount: (currentTrialData?.amount || amount)*100,
      currency: 'INR',
      name: 'AIHUBPRO',
      description: amount==666 ? '1 Month PLUS Plan' : '3 Month PRO Plan',
      order_id: orderId || undefined,
      handler: async function(response){
        try{
          await fetch('/api/verify-payment',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...response, amount})});
        }catch(e){}
        localStorage.setItem('isPaid','true');
        localStorage.setItem('plan','pro');
        alert('✅ Payment Complete! ₹'+amount+' Plan Activated! Automatic payment jama ho gaya!');
        document.getElementById('paymentModal').style.display='none';
        location.reload();
      },
      theme:{color:'#3b82f6'}
    };
    const rzp = new Razorpay(options);
    rzp.open();
  }catch(e){ alert('Pay error: '+e.message); }
}
</script>
</body>
</html>
