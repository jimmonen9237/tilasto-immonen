// Dashboard controls and rendering
const $=id=>document.getElementById(id), fmt=n=>n==null||!Number.isFinite(n)?'—':n.toLocaleString('en-US',{
  minimumFractionDigits:1,maximumFractionDigits:1
});
const ny=D.years.length, no=D.offences.length, nc=D.countries.length, na=D.ages.length;
const countries=D.countries.map((c,i)=>({
  code:c[0],name:c[1],i,aggregate:!/^[0-9]{3}$/.test(c[0])
}));
function fill(id,arr){
  $(id).innerHTML=arr.map((x,i)=>`<option value="${i}">${String(x).replace(/&/g,'&amp;').replace(/</g,'&lt;')}</option>`).join('')
}fill('year',D.years);
fill('offence',D.offences);
fill('age',D.ages);
$('age').value='0';
let current=[];
function value(y,o,c,a){
  return D.values[(((y*no+o)*nc+c)*na+a)]
}function esc(s){
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;')
}function render(){
  let y=+$('year').value, o=+$('offence').value, a=+$('age').value, search=$('search').value.toLowerCase().trim(), showZero=$('includeZero').value==='yes';
  let all=countries.filter(c=>!c.aggregate).map(c=>({
    ...c,v:value(y,o,c.i,a)
  })).filter(c=>c.v!=null&&Number.isFinite(c.v)&&(showZero||c.v!==0)).sort((a,b)=>b.v-a.v||a.name.localeCompare(b.name));
  let filtered=all.filter(c=>c.name.toLowerCase().includes(search));
  current=filtered;
  let fin=countries.find(c=>c.name==='Finland'), foreign=countries.find(c=>c.name==='FOREIGN COUNTRIES, TOTAL');
  $('finland').textContent=fmt(value(y,o,fin.i,a));
  $('foreign').textContent=fmt(value(y,o,foreign.i,a));
  $('highest').textContent=all.length?fmt(all[0].v):'—';
  $('highestName').textContent=all.length?all[0].name:'No data';
  $('count').textContent=filtered.length;
  $('countDetail').textContent=`of ${countries.filter(c=>!c.aggregate).length} nationalities`;
let limit=$('top').value==='all'?filtered.length:+$('top').value, shown=filtered.slice(0,limit), max=Math.max(...shown.map(c=>c.v),1), sqrt=$('scale').value==='sqrt';
  $('plot').innerHTML=shown.length?shown.map((c,i)=>{
    let width=100*(sqrt?Math.sqrt(c.v/max):c.v/max); return `<div class="barrow" title="${esc(c.name)}: ${fmt(c.v)} suspects per 10,000"><span class="rank">${i+1}</span><span class="name">${esc(c.name)}</span><span class="track"><span class="bar ${c.name==='Finland'?'fin':''}" style="display:block;width:${width}%"></span></span><span class="num">${fmt(c.v)}</span></div>`
  }).join(''):'<p class="muted">No matching nationalities.</p>';
  $('axis').innerHTML=`<span>0</span><span>${fmt(max/2)}</span><span>${fmt(max)}</span>`;
  $('tbody').innerHTML=filtered.map((c,i)=>`<tr><td>${i+1}</td><td>${esc(c.name)}</td><td>${fmt(c.v)}</td></tr>`).join('');
}
for(let id of ['year','offence','age','top','includeZero','scale','search'])$(id).addEventListener(id==='search'?'input':'change',render);
$('reset').onclick=()=>{
  $('year').value='0';
  $('offence').value='0';
  $('age').value='0';
  $('top').value='all';
  $('includeZero').value='yes';
  $('scale').value='linear';
  $('search').value='';
  render()
};
$('csv').onclick=()=>{
  let y=+$('year').value, o=+$('offence').value, a=+$('age').value;
  let lines=[['Rank', 'Nationality', 'Suspects per 10000', 'Year', 'Offence category', 'Sex', 'Age'].join(',')];
  current.forEach((c,i)=>lines.push([i+1,'"'+c.name.replace(/"/g,'""')+'"',c.v,D.years[y],'"'+D.offences[o].replace(/"/g,'""')+'"','Females','"'+D.ages[a]+'"'].join(',')));
  let blob=new Blob([lines.join('\r\n')],{
    type:'text/csv;charset=utf-8'
  }), url=URL.createObjectURL(blob), link=document.createElement('a');
  link.href=url;
  link.download=`suspects_nationality_${D.years[y]}.csv`;
  link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000)
};
render();
