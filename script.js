function scrollToTools(){
  document.getElementById('business-tools').scrollIntoView({behavior:'smooth'});
}
function openTool(name){
  window.location.href = `/tools/${name}/`;
}
function startAIChat(){
  document.getElementById('chat-modal').classList.remove('hidden');
}
async function sendMessage(){
  const msg = document.getElementById('chat-input').value;
  const res = await fetch('/api/chat',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({message: msg})
  });
  const data = await res.json();
  // Fixed: pehle aiData.choices check nahi tha, isliye crash hota tha
  if(!data.reply &&!data.choices) alert(data.error);
}
