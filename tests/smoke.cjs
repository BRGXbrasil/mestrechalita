/* Testes sem dependências, Node.js >=20. Execute: node tests/smoke.cjs */
"use strict";
const assert = require("node:assert/strict");
const {readFileSync} = require("node:fs");
const {join} = require("node:path");
const {runInNewContext} = require("node:vm");
const {webcrypto} = require("node:crypto");
const {TextEncoder} = require("node:util");
const html=readFileSync(join(__dirname,"..","index.html"),"utf8");
const js=html.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(js,"Script principal presente");
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(ids.length,new Set(ids).size,"IDs HTML devem ser exclusivos");
const nodes=Object.fromEntries(ids.map(id=>[id,{
  value:"",hidden:false,innerHTML:"",textContent:"",disabled:false,
  addEventListener(){},scrollIntoView(){},
  querySelector(){return {disabled:false}}
}]));
const document={getElementById(id){assert.ok(nodes[id],"Elemento ausente: "+id);return nodes[id]}};
const context={document,crypto:webcrypto,TextEncoder,Date,console,Math,Intl};
runInNewContext(js[1]+"\n;globalThis.__app={consult,render,solarLongitude,normDeg,findDesignDate,gateFromLongitude,astroHD};",context,{timeout:3000});
const app=context.__app;
const input={
  name:"Maria da Silva",birth_date:"1990-04-20",
  birth_time:"12:30",utc_offset:"-3",birth_place:"São Paulo, Brasil",
  event_date:"2026-11-12",domain:"geral",
  question:"Como organizar minhas prioridades?",oracle_seed:"teste-reproduzivel"
};
(async()=>{
  let count=0;
  function check(condition,description){assert.ok(condition,description);console.log("OK "+(++count)+" "+description)}
  const r=await app.consult(input);
  check(r.oracles.tarot.length===3,"Tiragem Tarot com 3 cartas");
  check(new Set(r.oracles.tarot.map(x=>x.name)).size===3,"Cartas Tarot sem repetição");
  check(r.oracles.baralho.cards.length===3,"Baralho Lenormand com 3 cartas");
  check(new Set(r.oracles.baralho.cards.map(x=>x.number)).size===3,"Baralho sem repetição");
  check(r.oracles.baralho.cards.every(x=>x.number>=1&&x.number<=36),"Baralho: cartas no intervalo 1 a 36");
  check(r.oracles.iching.hexagram>=1&&r.oracles.iching.hexagram<=64,"I Ching: hexagrama válido");
  check(r.oracles.iching.changing_line>=1&&r.oracles.iching.changing_line<=6,"I Ching: linha válida");
  check(!!r.oracles.rune.name,"Runa presente");
  check(r.numerology.life_path>0,"Caminho de vida calculado");
  check(r.integrations.astrology.sun_sign==="Touro","Sol tropical: 20/04/1990");
  check(r.integrations.human_design.personality_sun.gate>=1,"Porta solar de personalidade");
  check(r.integrations.human_design.design_sun.line>=1&&r.integrations.human_design.design_sun.line<=6,"Linha solar de design");
  const a=new Date(r.integrations.astrology.utc_birth),b=new Date(r.integrations.human_design.design_utc);
  const solarDifference=app.normDeg(app.solarLongitude(a)-app.solarLongitude(b));
  check(Math.abs(solarDifference-88)<0.0001,"Design solar ~88° antes");
  check(b<a,"Design solar anterior ao nascimento");
  check(JSON.stringify(r.oracles)===JSON.stringify((await app.consult(input)).oracles),"Mesmo seed reproduz mesma tiragem");
  app.render(r);
  check(!nodes.result.hidden,"Painel de resultado visível");
  check(nodes.reading.innerHTML.includes("Baralho Lenormand"),"Baralho aparece na leitura consolidada");
  check(nodes.reading.innerHTML.includes("Síntese integrada"),"Leitura contém síntese");
  check(nodes.extended.innerHTML.includes("Sol tropical"),"Painel de astrologia calculado");
  check(nodes.extended.innerHTML.includes("Ativação solar"),"Painel de Human Design calculado");
  const noHour=await app.consult({...input,birth_time:"",utc_offset:""});
  check(noHour.integrations.astrology.status==="missing_birth_details","Consulta sem hora continua possível");
  for (const data of [
    {...input,birth_time:"12:30",utc_offset:""},
    {...input,birth_time:"",utc_offset:"-3"},
    {...input,birth_time:"12:30",utc_offset:"15"}
  ]){await assert.rejects(()=>app.consult(data));count++;console.log("OK "+count+" Hora/fuso incompletos ou inválidos rejeitados")}
  await assert.rejects(()=>app.consult({...input,birth_date:"2001-02-29"}));
  count++;console.log("OK "+count+" Dia inexistente rejeitado");
  await assert.rejects(()=>app.consult({...input,birth_date:"2999-01-01"}));
  count++;console.log("OK "+count+" Nascimento futuro rejeitado");
  await assert.rejects(()=>app.consult({...input,name:"   "}));
  count++;console.log("OK "+count+" Nome em branco rejeitado");
  const xss=await app.consult({...input,question:'<img src=x onerror="alert(1)">'});
  app.render(xss);
  check(!nodes.reading.innerHTML.includes("<img"),"Pergunta HTML é escapada");
  check(!html.includes("MIII_PASSWORD"),"Nenhuma variável de senha no código público");
  console.log("TODOS OS "+count+" TESTES PASSARAM");
})().catch(err=>{console.error(err);process.exitCode=1});
