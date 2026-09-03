const destinations=[
{name:"Kodaikanal Slow Escape",state:"tamil-nadu",loc:"TAMIL NADU · HILL STATION",desc:"Cloudy hills, local cafés, village roads and quiet viewpoints for a refreshing escape.",img:"https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=85",interest:"Kodaikanal hill-station trip"},
{name:"Thanjavur & the Big Temple",state:"tamil-nadu",loc:"TAMIL NADU · TEMPLE + HERITAGE",desc:"Chola heritage, temple streets, traditional food, crafts and local culture around Thanjavur.",img:"https://static.wixstatic.com/media/9b44ed_8111c1a489b7406c8081e0584eeff72f~mv2.jpg/v1/fill/w_980%2Ch_653%2Cal_c%2Cq_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/9b44ed_8111c1a489b7406c8081e0584eeff72f~mv2.jpg",interest:"Thanjavur Big Temple and local heritage"},
{name:"Andhra Village Stories",state:"andhra",loc:"ANDHRA PRADESH · LOCAL VILLAGES",desc:"Explore Andhra villages, farm roads, traditional homes, regional food and everyday rural life.",img:"https://static2.tripoto.com/media/filter/tst/img/407801/SpotDocument/1590439282_1590439275056.jpg.webp",interest:"Andhra local village experience"},
{name:"Hampi With Local Stories",state:"karnataka",loc:"KARNATAKA · HERITAGE",desc:"Explore Hampi's ruins, village paths, local food and stories beyond a standard sightseeing route.",img:"https://images.unsplash.com/photo-1606298855672-3efb63017be8?auto=format&fit=crop&w=900&q=85",interest:"Hampi local trip"},
{name:"Wayanad Village Walk",state:"kerala",loc:"KERALA · VILLAGE + NATURE",desc:"Walk through green landscapes, meet local communities and experience everyday Wayanad.",img:"https://www.responsibletourismindia.com/public/uploads/article/Wayanad_Village-walk-1-slider1.jpg",interest:"Wayanad village experience"},
{name:"Valparai Offbeat Escape",state:"tamil-nadu",loc:"TAMIL NADU · TEA + HILLS",desc:"Tea estates, forest roads, viewpoints and slow mornings away from crowded routes.",img:"https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=85",interest:"Valparai local hill trip"}
];

const cardContainer=document.getElementById("destinationCards");

function whatsappLink(interest){
  const text=`Hi TravelVibe! 👋 I'm interested in the ${interest}. I'd like to know about the itinerary, dates, availability and pricing.`;
  return `https://wa.me/919392214698?text=${encodeURIComponent(text)}`;
}

function renderDestinations(filter="all"){
  if(!cardContainer)return;

  const items=destinations.filter(
    d=>filter==="all"||d.state===filter
  );

  cardContainer.innerHTML=items.map(d=>`
    <article class="card">
      <div class="pic" style="background-image:url('${d.img}')"></div>
      <div class="body">
        <span class="badge">${d.state.replace("-", " ").toUpperCase()}</span>
        <span class="location">${d.loc}</span>
        <h3>${d.name}</h3>
        <p>${d.desc}</p>
        <div class="contactrow">
          <a class="smallbtn" href="contact.html?destination=${encodeURIComponent(d.name)}&interest=${encodeURIComponent(d.interest)}">Enquire</a>
          <a class="smallbtn" href="${whatsappLink(d.name)}" target="_blank" rel="noopener">WhatsApp</a>
        </div>
      </div>
    </article>
  `).join("");
}

document.querySelectorAll(".filters button").forEach(
  b=>b.addEventListener("click",()=>{
    document.querySelectorAll(".filters button")
      .forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
    renderDestinations(b.dataset.filter);
  })
);

renderDestinations();
