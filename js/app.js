
/* =========================================================
   MOBILE NAVIGATION
========================================================= */
document.querySelectorAll(".nav-toggle").forEach(button => {
  button.addEventListener("click", () => {
    const nav = button.closest(".navin");
    const links = nav?.querySelector(".navlinks");
    if (!links) return;
    const open = links.classList.toggle("open");
    button.setAttribute("aria-expanded", String(open));
    button.textContent = open ? "×" : "☰";
  });
});

/* =========================================================
   CONTACT PREFILL FROM TRIP / PLANNER LINKS
========================================================= */
(function prefillContactForm(){
  const form = document.getElementById("leadForm");
  if (!form) return;

  const params = new URLSearchParams(location.search);
  const set = (id, value) => {
    const el = document.getElementById(id);
    if (el && value) el.value = value;
  };

  set("destination", params.get("destination") || "");
  set("people", params.get("people") || "");
  set("dates", params.get("date") || "");
  set("message", params.get("message") || "");

  const interests = params.get("interests") || params.get("interest") || "";
  set("interest", interests);

  if (!params.get("message")) {
    const destination = params.get("destination");
    const budget = params.get("budget");
    const days = params.get("days");
    const date = params.get("date");
    const msg = [];
    if (destination) msg.push(`I'm interested in ${destination}.`);
    if (days) msg.push(`I'm looking for a ${days}-day trip.`);
    if (budget) msg.push(`My total budget is ₹${budget}.`);
    if (date) msg.push(`Preferred date: ${date}.`);
    if (interests) msg.push(`Interests: ${interests}.`);
    if (msg.length) set("message", msg.join(" "));
  }
})();

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


/* =========================================================
   TRAVELVIBE DIRECT WHATSAPP CONTACT
========================================================= */
(function addWhatsAppButton(){
  if(document.querySelector('.whatsapp-float')) return;
  const link=document.createElement('a');
  link.className='whatsapp-float';
  link.href='https://wa.me/919392214698?text=Hi%20TravelVibe!%20I%20would%20like%20to%20know%20about%20your%20trips.';
  link.target='_blank';
  link.rel='noopener';
  link.setAttribute('aria-label','Chat with TravelVibe on WhatsApp');
  link.title='WhatsApp TravelVibe';
  link.innerHTML='<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16 3.2A12.7 12.7 0 0 0 5 22.2L3.4 28.6l6.6-1.7A12.7 12.7 0 1 0 16 3.2Zm0 23.1c-2 0-4-.5-5.7-1.6l-.4-.2-3.9 1 1-3.8-.2-.4A10.4 10.4 0 1 1 16 26.3Zm5.7-7.8c-.3-.2-1.7-.8-2-.9-.3-.1-.5-.2-.7.2-.2.3-.7.9-.8 1.1-.2.2-.3.2-.6.1-1.6-.8-2.7-1.5-3.8-3.4-.3-.5.3-.5.8-1.6.1-.3.1-.5 0-.7-.1-.2-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.9s1.2 3.4 1.4 3.6c.2.2 2.3 3.6 5.6 5 .8.3 1.4.5 1.9.7.8.3 1.5.2 2 .1.6-.1 1.7-.7 2-1.3.3-.6.3-1.2.2-1.3-.1-.2-.3-.2-.6-.4Z"/></svg>'; 
  document.body.appendChild(link);
})();
