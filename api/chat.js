export async function onRequestPost(c){
  const h={'Content-Type':'application/json','Access-Control-Allow-Origin':'*'};
  try{
    const body=await c.request.json().catch(()=>({}));
    const msg=(body.message||'').toString().trim();
    if(!msg) return Response.json({reply:'Hi! Kuch likho toh sahi 😊'}, {headers:h});

    // 5 min trial
    try{
      const ip=c.request.headers.get('CF-Connecting-IP')||'u1';
      const k='trial_'+ip;
      const s=await c.env.SUBSCRIPTIONS?.get(k);
      if(!s) await c.env.SUBSCRIPTIONS?.put(k,Date.now().toString(),{expirationTtl:86400});
      else if(Date.now()-parseInt(s)>300000){
        return Response.json({reply:'TRIAL_ENDED',razorpay_key:c.env.RAZORPAY_KEY_ID||null,message:'Trial Khatam!'}, {headers:h});
      }
    }catch(e){}

    let finalReply = null;

    // 1. GROQ try
    if(c.env.GROQ_API_KEY){
      try{
        const r=await fetch('https://api.groq.com/openai/v1/chat/completions',{
          method:'POST',
          headers:{'Content-Type':'application/json','Authorization':'Bearer '+c.env.GROQ_API_KEY},
          body:JSON.stringify({model:'llama-3.3-70b-versatile',messages:[{role:'user',content:msg}]})
        });
        const j=await r.json();
        if(j.choices && j.choices[0] && j.choices[0].message) finalReply=j.choices[0].message.content;
      }catch(e){ finalReply=null; }
    }

    // 2. Agar GROQ fail toh direct jawab - KHALI KABHI NAHI
    if(!finalReply || finalReply.trim()===''){
      finalReply=`Ram Ram Ji! 🙏 Aapne "${msg}" bola!\n\nMain AIHUBPRO hun - Aapka apna AI assistant!\n\nAap "${msg}" ke baare me detail me batao, mai help karunga!\n\n(Tools bhi use kar sakte ho - GST, Invoice, PDF sab hai!)`;
    }

    return Response.json({reply:finalReply}, {headers:h});
  }catch(e){
    return Response.json({reply:'Ram Ram Ji! 🙏 Main bilkul chal raha hu! Aap "'+ (e.message||'') +'" phir se bhejo!'}, {headers:h});
  }
}
export async function onRequestGet(){ return Response.json({ok:true,msg:'API Live! POST karo /api/chat pe'}, {headers:{'Access-Control-Allow-Origin':'*'}}); }
export async function onRequestOptions(){ return new Response(null,{status:200,headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'POST, GET, OPTIONS','Access-Control-Allow-Headers':'Content-Type'}}); }
