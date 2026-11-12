/* Mestre Chalita — Astrology & Human Design
   Astronomy Engine (MIT): see vendor/astronomy.browser.min.js
   Inputs: UTC instant, optional latitude/longitude. All calculations client-side.
   Human Design is a symbolic tradition; planets based on Astronomy Engine,
   lunar nodes approximate mean node, gates start at 302° tropical longitude.
*/
(function(root) {
"use strict";
const E=root.Astronomy;
const DEG=Math.PI/180;
const norm=x=>(x%360+360)%360;
const rd=(x,d=2)=>+x.toFixed(d);
const zod=["Áries","Touro","Gêmeos","Câncer","Leão","Virgem","Libra","Escorpião","Sagitário","Capricórnio","Aquário","Peixes"];
const bodies=[["Sol","Sun"],["Lua","Moon"],["Mercúrio","Mercury"],["Vênus","Venus"],["Marte","Mars"],["Júpiter","Jupiter"],["Saturno","Saturn"],["Urano","Uranus"],["Netuno","Neptune"],["Plutão","Pluto"]];
const gateOrder=[41,19,13,49,30,55,37,63,22,36,25,17,21,51,42,3,27,24,2,23,8,20,16,35,45,12,15,52,39,53,62,56,31,33,7,4,29,59,40,64,47,6,46,18,48,57,32,50,28,44,1,43,14,34,9,5,26,11,10,58,38,54,61,60];
const gateCenters={
  Cabeça:[64,61,63],Ajna:[47,24,4,17,43,11],Garganta:[62,23,56,31,8,33,16,20,12,35,45],
  G:[7,1,13,2,15,46,10,25],Sacral:[14,5,29,34,27,59,3,9,42],
  Baço:[57,48,44,18,28,32,50],Ego:[21,26,51,40],
  "Plexo Solar":[22,36,6,49,55,30,37],Raiz:[58,38,54,60,52,53,19,39,41]
};
const centerByGate=Object.fromEntries(Object.entries(gateCenters).flatMap(([c,gates])=>gates.map(g=>[g,c])));
const channelPairs=[[64,47],[61,24],[63,4],[17,62],[43,23],[11,56],[1,8],[7,31],[13,33],[10,20],[57,20],[10,57],[34,57],[20,34],[10,34],[16,48],[35,36],[12,22],[45,21],[25,51],[26,44],[37,40],[59,6],[27,50],[32,54],[28,38],[18,58],[42,53],[3,60],[9,52],[39,55],[41,30],[19,49],[29,46],[5,15],[2,14]];
const places=[
  [/s[aã]o paulo/i,-23.5505,-46.6333],[/rio de janeiro/i,-22.9068,-43.1729],
  [/bras[ií]lia/i,-15.7939,-47.8828],[/belo horizonte/i,-19.9167,-43.9345],
  [/porto alegre/i,-30.0346,-51.2177],[/salvador/i,-12.9777,-38.5016],
  [/curitiba/i,-25.4284,-49.2733],[/recife/i,-8.0476,-34.877],
  [/fortaleza/i,-3.7319,-38.5267],[/goi[aâ]nia/i,-16.6869,-49.2648],
  [/manaus/i,-3.119,-60.0217],[/bel[eé]m/i,-1.4558,-48.4902],
  [/campinas/i,-22.9099,-47.0626],[/florian[oó]polis/i,-27.5954,-48.548],
  [/vit[oó]ria/i,-20.2976,-40.2958],[/natal/i,-5.7945,-35.211],
  [/s[aã]o lu[ií]s/i,-2.53,-44.3068],[/jo[aã]o pessoa/i,-7.1195,-34.845],
  [/ter[eê]sina/i,-5.0919,-42.8034],[/macei[oó]/i,-9.6658,-35.7353],
  [/aracaju/i,-10.9472,-37.0731],[/campo grande/i,-20.4697,-54.6201],
  [/cuiab[aá]/i,-15.6014,-56.0979],[/porto velho/i,-8.7608,-63.8999],
  [/rio branco/i,-9.97499,-67.8243],[/boa vista/i,2.8235,-60.6758],
  [/macap[aá]/i,0.0356,-51.0705],[/palmas/i,-10.184,-48.3336],
  [/lisboa/i,38.7223,-9.1393],[/porto,?\s*portugal/i,41.1579,-8.6291],
  [/new york/i,40.7128,-74.006],[/london|londres/i,51.5072,-0.1276],
  [/paris/i,48.8566,2.3522]
];
function coords(input){
  const lat=String(input.latitude??"").trim(),lon=String(input.longitude??"").trim();
  if(lat!==""||lon!==""){
    if(lat===""||lon===""||!Number.isFinite(+lat)||!Number.isFinite(+lon)||Math.abs(+lat)>90||Math.abs(+lon)>180)throw Error("Informe latitude e longitude válidas juntas");
    return {latitude:+lat,longitude:+lon,source:"coordenadas informadas"};
  }
  const place=String(input.birth_place||"");
  const match=places.find(p=>p[0].test(place));
  return match?{latitude:match[1],longitude:match[2],source:"coordenadas aproximadas da cidade"}:null;
}
function geolon(body,t){
  if(!E)throw Error("Biblioteca de efemérides não carregada");
  if(body==="Sun")return E.SunPosition(t).elon;
  if(body==="Moon")return E.EclipticGeoMoon(t).lon;
  return E.Ecliptic(E.GeoVector(body,t,true)).elon;
}
function meanNode(t){
  const T=(t.getTime()/86400000+2440587.5-2451545)/36525;
  return norm(125.04455501-1934.13626197*T+0.002075611*T*T+T*T*T/467441-T*T*T*T/60616000);
}
function sky(t){
  const longitudes={};
  for(const [name,b] of bodies)longitudes[name]=geolon(b,t);
  longitudes.Terra=norm(longitudes.Sol+180);
  longitudes["Nodo Norte"]=meanNode(t);
  longitudes["Nodo Sul"]=norm(longitudes["Nodo Norte"]+180);
  return longitudes;
}
function gate(lon){
  const sector=norm(lon-302);
  const position=Math.floor(sector/5.625);
  return {gate:gateOrder[position],line:Math.min(6,Math.floor((sector-position*5.625)/0.9375)+1)};
}
function designInstant(birth){
  const target=norm(geolon("Sun",birth)-88);
  let lo=birth.getTime()-100*86400000,hi=birth.getTime()-75*86400000;
  for(let i=0;i<48;i++){
    const mid=(lo+hi)/2,diff=norm(geolon("Sun",new Date(mid))-target);
    if(diff<180)hi=mid; else lo=mid;
  }
  const t=new Date((lo+hi)/2);
  if(Math.abs(norm(geolon("Sun",birth)-geolon("Sun",t))-88)>0.001)throw Error("Não foi possível verificar o instante de design");
  return t;
}
function zodiac(lon){const value=norm(lon);return {sign:zod[Math.floor(value/30)],degree:rd(value%30),longitude:rd(value,5)}}
function ascMc(date,latitude,longitude){
  const theta=norm(E.SiderealTime(date)*15+longitude)*DEG,phi=latitude*DEG,eps=(23.439291-0.0130042*((date.getTime()/86400000+2440587.5-2451545)/36525))*DEG;
  const A=Math.cos(phi)*Math.cos(theta),B=Math.sin(phi)*Math.sin(eps)+Math.cos(phi)*Math.sin(theta)*Math.cos(eps);
  return {ascendant:norm(Math.atan2(A,-B)/DEG),midheaven:norm(Math.atan2(Math.sin(theta),Math.cos(eps)*Math.cos(theta))/DEG)};
}
function aspects(planets){
  const angles=[["Conjunção",0,6],["Sextil",60,4],["Quadratura",90,5],["Trígono",120,5],["Oposição",180,6]];
  const out=[];
  for(let i=0;i<planets.length;i++)for(let j=i+1;j<planets.length;j++){
    const a=planets[i],b=planets[j],d=Math.abs(a.longitude-b.longitude),dist=Math.min(d,360-d);
    for(const [name,angle,orb] of angles)if(Math.abs(dist-angle)<=orb){
      out.push({a:a.body,b:b.body,aspect:name,orb:rd(Math.abs(dist-angle))});break;
    }
  }
  return out.sort((a,b)=>a.orb-b.orb).slice(0,12);
}
function chart(t,skyAt,location){
  const asc=location?ascMc(t,location.latitude,location.longitude):null;
  const planets=bodies.map(([name])=>{
    const lon=skyAt[name],z=zodiac(lon);
    return {body:name,...z,...(asc?{house:Math.floor(norm(lon-asc.ascendant)/30)+1}:{})};
  });
  return {
    status:"computed",system:"Astrologia tropical — casas iguais",
    sun_sign:zodiac(skyAt.Sol).sign,sun_degree:zodiac(skyAt.Sol).degree,
    sun_longitude:rd(skyAt.Sol,5),
    moon_sign:zodiac(skyAt.Lua).sign,
    ascendant:asc?zodiac(asc.ascendant):null,
    midheaven:asc?zodiac(asc.midheaven):null,
    houses:asc?Array.from({length:12},(_,i)=>({...zodiac(asc.ascendant+i*30),house:i+1})):null,
    location:location||null,
    planets,aspects:aspects(planets),utc_birth:t.toISOString(),
    message:"Sol em "+zodiac(skyAt.Sol).sign+", Lua em "+zodiac(skyAt.Lua).sign+(asc?", ascendente em "+zodiac(asc.ascendant).sign:"; ascendente e casas exigem local reconhecido ou coordenadas")+". Posições geocêntricas pelo Astronomy Engine; casas iguais"+(asc?".":" quando houver coordenadas.")+" Fuso histórico deve ser conferido."
  };
}
function networks(activated){
  const channels=channelPairs.filter(([a,b])=>activated.has(a)&&activated.has(b)).map(([a,b])=>({gates:[a,b],centers:[centerByGate[a],centerByGate[b]]}));
  const defined=new Set(channels.flatMap(x=>x.centers));
  const graph=Object.fromEntries([...defined].map(c=>[c,new Set()]));
  for(const {centers:[a,b]} of channels){graph[a].add(b);graph[b].add(a)}
  const seen=new Set(),components=[];
  for(const c of defined)if(!seen.has(c)){
    const stack=[c],component=[];
    while(stack.length){const q=stack.pop();if(seen.has(q))continue;seen.add(q);component.push(q);for(const to of graph[q])if(!seen.has(to))stack.push(to)}
    components.push(component);
  }
  const connected=(from,to)=>components.some(c=>c.includes(from)&&c.includes(to));
  const throatMotor=["Sacral","Plexo Solar","Ego","Raiz"].some(c=>connected("Garganta",c));
  const sacral=defined.has("Sacral");
  const type=sacral?(throatMotor?"Gerador Manifestante":"Gerador"):(throatMotor?"Manifestador":defined.size?"Projetor":"Refletor");
  const strategy={"Gerador":"Responder","Gerador Manifestante":"Responder e informar","Manifestador":"Informar","Projetor":"Aguardar convite/reconhecimento","Refletor":"Observar um ciclo lunar"}[type];
  const authority=defined.has("Plexo Solar")?"Emocional":sacral?"Sacral":defined.has("Baço")?"Esplênica":defined.has("Ego")?"Ego":defined.has("G")&&connected("G","Garganta")?"Autoprojetada":type==="Refletor"?"Lunar":"Ambiente/Mental";
  const definition=components.length===0?"Sem definição":["","Simples","Dupla","Tripla","Quádrupla"][Math.min(4,components.length)];
  return {type,strategy,authority,definition,channels,defined_centers:[...defined],undefined_centers:Object.keys(gateCenters).filter(c=>!defined.has(c)),connected_components:components};
}
function compute(birth,input){
  if(!birth)return {astrology:{status:"missing_birth_details",message:"Informe hora e fuso para calcular o mapa natal."},human_design:{status:"missing_birth_details",message:"Informe hora e fuso para calcular o BodyGraph."}};
  const location=coords(input||{});
  const pSky=sky(birth),designDate=designInstant(birth),dSky=sky(designDate);
  const ast=chart(birth,pSky,location);
  const personality=Object.fromEntries(Object.entries(pSky).map(([name,lon])=>[name,{...gate(lon),longitude:rd(lon,5)}]));
  const design=Object.fromEntries(Object.entries(dSky).map(([name,lon])=>[name,{...gate(lon),longitude:rd(lon,5)}]));
  const allGates=new Set([...Object.values(personality),...Object.values(design)].map(a=>a.gate));
  const graph=networks(allGates);
  const profile=personality.Sol.line+"/"+design.Sol.line;
  const cross=[personality.Sol.gate,personality.Terra.gate,design.Sol.gate,design.Terra.gate];
  const hd={
    status:"computed",system:"Human Design — BodyGraph simbólico",
    ...graph,profile,incarnation_cross_gates:cross,
    personality_sun:personality.Sol,design_sun:design.Sol,
    personality_activations:personality,design_activations:design,
    design_utc:designDate.toISOString(),
    nodal_method:"Nodos lunares médios (aproximação)",
    message:"Tipo "+graph.type+", perfil "+profile+", autoridade "+graph.authority+", estratégia: "+graph.strategy+". Centros definidos: "+(graph.defined_centers.join(", ")||"nenhum")+". "+graph.channels.length+" canais completos. Portas calculadas na mandala Rave (início em 302°); nodos lunares médios aproximados."
  };
  return {astrology:ast,human_design:hd};
}
root.MestreAstroHD={compute,gate,networks,sky,designInstant,ascMc,coords,gateOrder,channelPairs,centerByGate,version:"1.0"};
})(globalThis);
