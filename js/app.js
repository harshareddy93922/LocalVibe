const API_BASE="https://localvibe-backend-umwl.onrender.com";

async function sendToBackend(data){
  const r=await fetch(`${API_BASE}/api/enquiries`,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(data)
  });
  if(!r.ok) throw new Error("Backend rejected enquiry");
  return await r.json();
}

const form=document.getElementById("leadForm");
if(form){
  const params=new URLSearchParams(location.search);
  const interest=params.get("interest");
  if(interest && document.getElementById("interest")) document.getElementById("interest").value=interest;

  form.addEventListener("submit",async e=>{
    e.preventDefault();
    const msg=document.getElementById("formMsg");
    msg.textContent="Sending enquiry...";
    const data={
      name:document.getElementById("name").value.trim(),
      phone:document.getElementById("phone").value.trim(),
      email:document.getElementById("email").value.trim()||null,
      destination:document.getElementById("destination").value.trim(),
      people:document.getElementById("people").value,
      dates:document.getElementById("dates").value.trim(),
      message:document.getElementById("message").value.trim(),
      interest:document.getElementById("interest")?.value||""
    };
    try{
      const result=await sendToBackend(data);
      msg.textContent=`Enquiry submitted successfully. Your enquiry ID is #${result.id}.`;
      form.reset();
    }catch(err){
      msg.textContent="Could not reach the server. Please make sure the LocalVibe backend is running.";
    }
  });
}

async function loadAdmin(){
  const box=document.getElementById("leads");
  if(!box)return;
  try{
    const r=await fetch(`${API_BASE}/api/enquiries`);
    const data=await r.json();
    box.innerHTML=data.items.length?data.items.map(l=>`
      <div class="lead">
        <b>#${l.id} · ${escapeHtml(l.name)}</b> · ${escapeHtml(l.phone)}
        <br><small>${escapeHtml(l.created_at)} · ${escapeHtml(l.destination||l.interest||"General")} · ${escapeHtml(l.people||"")}</small>
        <br>${escapeHtml(l.message||"")}
        <br><strong>Status: ${escapeHtml(l.status)}</strong>
        <select onchange="changeStatus(${l.id},this.value)">
          ${["NEW","CONTACTED","FOLLOW-UP","CONFIRMED","COMPLETED"].map(s=>`<option ${s===l.status?"selected":""}>${s}</option>`).join("")}
        </select>
      </div>`).join(""):"<p class='notice'>No enquiries yet.</p>";
  }catch(e){box.innerHTML="<p class='notice'>Backend not reachable. Start FastAPI first.</p>"}
}
function escapeHtml(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
async function changeStatus(id,status){
  await fetch(`${API_BASE}/api/enquiries/${id}/status?status=${encodeURIComponent(status)}`,{method:"PATCH"});
  loadAdmin();
}
function login(){
  const e=document.getElementById("adminEmail").value,p=document.getElementById("adminPassword").value;
  if(e==="admin@localvibe.test"&&p==="localvibe123"){
    document.getElementById("login").style.display="none";
    document.getElementById("dash").style.display="block";
    loadAdmin();
  }else alert("Invalid demo credentials");
}
if(document.getElementById("leads")) loadAdmin();
