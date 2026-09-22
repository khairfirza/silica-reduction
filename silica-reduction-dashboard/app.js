(() => {
  'use strict';

  const STORAGE_KEY = 'silica-reduction-dashboard-v1';
  const DAILY_SHEETS = ['Silica','Washing','Bypass','Bark','Screening flow','Screening operation','pH','OV reject','Headbox pH'];
  const TF_SHEETS = ['TF PD1 Old','TF PD1 New','TF PD2 Old','TF PD2 New','TF PD3 L1','TF PD3 L2','TF PD3 L3'];
  const PASTE_SHEETS = [...DAILY_SHEETS, ...TF_SHEETS, 'Actions'];
  const COLORS = ['#2f6fad','#5b9a76','#a86c3a','#7f6db0','#3c8798','#9a5f7a','#738c43','#4b5f7a','#b08542'];

  const P = {
    ch1:'Silica after chipper · AE · Chp1 (ppm)',
    ch2:'Silica after chipper · AE · Chp2 (ppm)',
    ch4:'Silica after chipper · AE · Chp4 (ppm)',
    ch5:'Silica after chipper · AE · F3 (Chp5) (ppm)',
    ch6:'Silica after chipper · AE · SF3 (Chp6) (ppm)',
    ch78:'Silica after chipper · AE · F4 (Chp7/8) (ppm)',
    ch910:'Silica after chipper · AE · F6 (Chp9/10) (ppm)',
    ch11:'Silica after chipper · AE · F6 (Chp11) (ppm)',
    ch12:'Silica after chipper · AE · SF6 (Chp12) (ppm)',
    chipFL1:'Silica Chip to FL1 · AE (ppm)',
    chipFL2:'Silica Chip to FL2 · AE (ppm)',
    chipLy:'Silica Chip to FL2 · Lyocell (ppm)',
    unbFL1:'Silica unbleached · FL1 (ppm)',
    unbFL2:'Silica unbleached · FL2 (ppm)',
    unbLy:'Silica unbleached · FL2 Lyocell (ppm)',
    pdFL1:'Silica pulp dryer · FL1 · AE (ppm)',
    pdFL2:'Silica pulp dryer · FL2 · AE (ppm)',
    pdLy:'Silica pulp dryer · FL2 · Lyocell (ppm)',
    slushPD1:'Silica slush to APR · PD1 (ppm)',
    slushPD2:'Silica slush to APR · PD2 (ppm)',
    slushPD3:'Silica slush to APR · PD3 (ppm)',
    barkAE:'Bark on chip · AE · Bark (%)',
    barkLy:'Bark on chip · Lyocell · Bark (%)'
  };

  const SILICA_META = [
    {key:P.ch1,label:'Ch1',area:'Woodyard',target:160,rule:'<'},
    {key:P.ch2,label:'Ch2',area:'Woodyard',target:160,rule:'<'},
    {key:P.ch4,label:'Ch4',area:'Woodyard',target:160,rule:'<'},
    {key:P.ch5,label:'Ch5',area:'Woodyard',target:160,rule:'<'},
    {key:P.ch6,label:'Ch6',area:'Woodyard',target:160,rule:'<'},
    {key:P.ch78,label:'Ch7/8',area:'Woodyard',target:160,rule:'<'},
    {key:P.ch910,label:'Ch9/10',area:'Woodyard',target:160,rule:'<'},
    {key:P.ch11,label:'Ch11',area:'Woodyard',target:160,rule:'<'},
    {key:P.ch12,label:'Ch12',area:'Woodyard',target:160,rule:'<'},
    {key:P.chipFL1,label:'Chip FL1 · AE',area:'Fiberline',target:160,rule:'<='},
    {key:P.chipFL2,label:'Chip FL2 · AE',area:'Fiberline',target:160,rule:'<='},
    {key:P.chipLy,label:'Chip FL2 · Lyocell',area:'Fiberline',target:160,rule:'<='},
    {key:P.unbFL1,label:'Unbleached FL1',area:'Fiberline',target:250,rule:'<='},
    {key:P.unbFL2,label:'Unbleached FL2',area:'Fiberline',target:250,rule:'<='},
    {key:P.unbLy,label:'Unbleached FL2 Lyocell',area:'Fiberline',target:250,rule:'<='},
    {key:P.pdFL1,label:'FL1 · AE',area:'Pulp Dryer',target:55,rule:'<='},
    {key:P.pdFL2,label:'FL2 · AE',area:'Pulp Dryer',target:55,rule:'<='},
    {key:P.pdLy,label:'FL2 · Lyocell',area:'Pulp Dryer',target:40,rule:'<='}
  ];

  const SHEET_HEADERS = {
    'Silica':['Date',...SILICA_META.map(x=>x.key),P.slushPD1,P.slushPD2,P.slushPD3],
    'Washing':['Date','Log washing pressure · WY1/2 · P001 (bar)','Log washing pressure · WY1/2 · P002 (bar)','Log washing pressure · WY1/2 · P003 (bar)','Log washing pressure · WY3 (bar)','Log washing pressure · WY4 (bar)','Log washing pressure · WY5 (bar)','Log washing pressure · WY6 (bar)'],
    'Bypass':['Date','Chip screen / CTS bypass · FL1 · Inlet chip screen (%)','Chip screen / CTS bypass · FL1 · CTS 341C335 (%)','Chip screen / CTS bypass · FL1 · Master screen (%)','Chip screen / CTS bypass · FL1 · Fines screen (%)','Chip screen / CTS bypass · FL2 · Inlet chip screen (%)','Chip screen / CTS bypass · FL2 · CTS 341C501 (%)','Chip screen / CTS bypass · FL2 · Master screen (%)','Chip screen / CTS bypass · FL2 · Fines screen (%)'],
    'Bark':['Date',P.barkAE,P.barkLy],
    'Screening flow':['Date','Screening reject flow · FL1 quaternary screen · E032 (lps)','Screening reject flow · FL1 quaternary screen · E108 (lps)'],
    'Screening operation':['Date','Screening operation · Primary screen junk traps · Online (%)','Screening operation · Primary screen junk traps · Available (%)','Screening operation · 2nd / 3rd / 4th trap system · Online (%)','Screening operation · 2nd / 3rd / 4th trap system · Available (%)','Screening operation · Cyclones 84–87 · Online (%)','Screening operation · Cyclones 84–87 · Available (%)'],
    'pH':['Date','Bleaching pH · FL1 D0 · Lab (pH)','Bleaching pH · FL1 D1 · Lab (pH)','Bleaching pH · FL1 D2 STP · Lab (pH)','Bleaching pH · FL1 D2 STP · Online (pH)'],
    'OV reject':['Date','OV reject · PD1 Old line · Stage 4 (%)','OV reject · PD1 Old line · Stage 5 (%)','OV reject · PD1 Old line · Stage 6 (%)','OV reject · PD1 New line · Stage 4 (%)','OV reject · PD1 New line · Stage 5 (%)','OV reject · PD1 New line · Stage 6 (%)','OV reject · PD2 Old line · Stage 4 (%)','OV reject · PD2 Old line · Stage 5 (%)','OV reject · PD2 Old line · Stage 6 (%)','OV reject · PD2 New line · Stage 4 (%)','OV reject · PD2 New line · Stage 5 (%)','OV reject · PD2 New line · Stage 6 (%)','OV reject · PD3 Line 1 · Stage 4 (%)','OV reject · PD3 Line 1 · Stage 5 (%)','OV reject · PD3 Line 1 · Stage 6 (%)','OV reject · PD3 Line 2 · Stage 4 (%)','OV reject · PD3 Line 2 · Stage 5 (%)','OV reject · PD3 Line 2 · Stage 6 (%)','OV reject · PD3 Line 3 · Stage 7 (%)'],
    'Headbox pH':['Date','Headbox pH · PD1 · SP (pH)','Headbox pH · PD1 · Act (pH)','Headbox pH · PD2 · SP (pH)','Headbox pH · PD2 · Act (pH)','Headbox pH · PD3 · SP (pH)','Headbox pH · PD3 · Act (pH)']
  };

  let state = loadState() || createDemoState();
  let currentSection = 'executive';
  let actionFilter = 'All';
  let chartsGeneration = 0;

  const el = id => document.getElementById(id);

  document.addEventListener('DOMContentLoaded', init);

  function init(){
    if(!localStorage.getItem(STORAGE_KEY)) saveState();
    const defaultEnd = state.settings.weekEnd || '2026-09-22';
    el('weekEnd').value = defaultEnd;
    el('monthPicker').value = defaultEnd.slice(0,7);
    el('reportMode').value = state.settings.reportMode || 'weekly';
    syncPeriodControls();
    fillPasteSheets();
    bindEvents();
    renderAll();
  }

  function bindEvents(){
    document.querySelectorAll('.nav-item').forEach(btn=>btn.addEventListener('click',()=>switchSection(btn.dataset.section)));
    el('sidebarToggle').addEventListener('click',()=>el('sidebar').classList.toggle('open'));
    el('reportMode').addEventListener('change',()=>{ state.settings.reportMode=el('reportMode').value; syncPeriodControls(); saveState(); renderAll(); });
    el('weekEnd').addEventListener('change',()=>{ state.settings.weekEnd=el('weekEnd').value; saveState(); renderAll(); });
    el('monthPicker').addEventListener('change',()=>{ state.settings.month=el('monthPicker').value; saveState(); renderAll(); });
    el('exportPdfBtn').addEventListener('click',exportPdf);
    el('exportExcelBtn').addEventListener('click',exportExcel);
    el('addActionBtn').addEventListener('click',()=>openActionDialog());
    el('saveActionBtn').addEventListener('click',saveActionFromDialog);
    el('resetDemoBtn').addEventListener('click',resetDemo);
    el('excelInput').addEventListener('change',e=>{ if(e.target.files[0]) importWorkbook(e.target.files[0]); });
    el('pasteImportBtn').addEventListener('click',importPastedData);
    el('downloadBackupBtn').addEventListener('click',downloadBackup);
    el('restoreBackupInput').addEventListener('change',e=>{if(e.target.files[0]) restoreBackup(e.target.files[0]);});
    const dz=el('dropzone');
    ['dragenter','dragover'].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.add('drag')}));
    ['dragleave','drop'].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.remove('drag')}));
    dz.addEventListener('drop',e=>{const f=e.dataTransfer.files[0];if(f)importWorkbook(f)});
    window.addEventListener('afterprint',()=>document.querySelectorAll('.section-page').forEach(x=>x.classList.remove('print-active')));
  }

  function switchSection(name){
    currentSection=name;
    document.querySelectorAll('.nav-item').forEach(x=>x.classList.toggle('active',x.dataset.section===name));
    document.querySelectorAll('.section-page').forEach(x=>x.classList.toggle('active',x.id===`section-${name}`));
    el('sidebar').classList.remove('open');
    if(name==='appendix') renderAppendix();
    if(name==='actions') renderActions();
    if(name==='data') renderDataCoverage();
  }

  function syncPeriodControls(){
    const monthly=el('reportMode').value==='monthly';
    el('weekEndWrap').classList.toggle('hidden',monthly);
    el('monthWrap').classList.toggle('hidden',!monthly);
    if(!el('monthPicker').value) el('monthPicker').value=(state.settings.weekEnd||'2026-09-22').slice(0,7);
  }

  function renderAll(){
    chartsGeneration++;
    updatePeriodHeader();
    renderExecutive();
    renderActions();
    renderAppendix();
    renderDataCoverage();
  }

  function updatePeriodHeader(){
    const p=getPeriod();
    el('periodLabel').textContent=p.label;
    el('periodSubtitle').textContent=el('reportMode').value==='weekly' ? 'Weekly Reports And Daily Trends Across Each Month.' : 'Monthly Reports And Daily Trends Across The Selected Month.';
    el('dataStatus').textContent=`${countDailyRows().toLocaleString()} daily rows available`;
  }

  function getPeriod(){
    const mode=el('reportMode')?.value || state.settings.reportMode || 'weekly';
    if(mode==='monthly'){
      const ym=el('monthPicker')?.value || state.settings.month || (state.settings.weekEnd||'2026-09-22').slice(0,7);
      const [y,m]=ym.split('-').map(Number);
      const start=new Date(Date.UTC(y,m-1,1));
      const end=new Date(Date.UTC(y,m,0));
      return {mode,start:iso(start),end:iso(end),label:formatMonth(start),month:ym};
    }
    const endStr=el('weekEnd')?.value || state.settings.weekEnd || '2026-09-22';
    const end=parseDate(endStr); const start=addDays(end,-6);
    return {mode,start:iso(start),end:iso(end),label:`${formatShort(start)} – ${formatShort(end)}`};
  }

  function renderExecutive(){
    const host=el('executiveContent');
    if(!host) return;
    host.innerHTML='';
    const areas=['Woodyard','Fiberline','Pulp Dryer'];
    areas.forEach(area=>host.appendChild(renderArea(area)));
    host.appendChild(renderExecutiveReadout());
  }

  function renderArea(area){
    const block=document.createElement('div'); block.className='area-block';
    const stats=getAreaStats(area);
    const pending=state.actions.filter(a=>a.Area===area && a.Status==='Pending');
    const header=document.createElement('div'); header.className='area-header';
    header.innerHTML=`<div class="area-title"><h2>${escapeHtml(area)}</h2><span class="achievement">${Math.round(stats.achievement)}% achievement · ${pending.length} pending ${pending.length===1?'action':'actions'}</span></div>`;
    block.appendChild(header);

    const grid=document.createElement('div');grid.className='area-grid';
    const summary=document.createElement('div');summary.className='summary-side';
    summary.appendChild(summaryPanel(area,stats));
    summary.appendChild(pendingPanel(area,pending));
    grid.appendChild(summary);

    const charts=document.createElement('div'); charts.className='charts-grid';
    if(area==='Woodyard'){
      charts.appendChild(makeMixedChartCard('Silica After Chipper','Monthly average bars · selected-period daily lines',[
        {key:P.ch1,label:'Ch1'},{key:P.ch2,label:'Ch2'},{key:P.ch4,label:'Ch4'},{key:P.ch5,label:'Ch5'}
      ],{target:160,yMin:130,yMax:220}));
      charts.appendChild(makeMixedChartCard('Chipper Comparison','Ch6 through Ch12 comparison',[
        {key:P.ch6,label:'Ch6'},{key:P.ch78,label:'Ch7/8'},{key:P.ch910,label:'Ch9/10'},{key:P.ch11,label:'Ch11'},{key:P.ch12,label:'Ch12'}
      ],{target:160,yMin:130,yMax:220}));
    } else if(area==='Fiberline'){
      charts.appendChild(makeMixedChartCard('Chip To Fiberline','Monthly average bars · selected-period daily lines',[
        {key:P.chipFL1,label:'FL1 · AE'},{key:P.chipFL2,label:'FL2 · AE'},{key:P.chipLy,label:'FL2 · Lyocell'}
      ],{target:160,yMin:110,yMax:200}));
      charts.appendChild(makeMixedChartCard('Unbleached Pulp Silica','Monthly average bars · selected-period daily lines',[
        {key:P.unbFL1,label:'FL1'},{key:P.unbFL2,label:'FL2'},{key:P.unbLy,label:'FL2 Lyocell'}
      ],{target:250,yMin:190,yMax:290}));
    } else {
      charts.appendChild(makeMixedChartCard('FL1 · AE','Monthly average bars · selected-period daily line',[{key:P.pdFL1,label:'Silica'}],{target:55,yMin:30,yMax:90}));
      charts.appendChild(makeMixedChartCard('FL2 · AE','Monthly average bars · selected-period daily line',[{key:P.pdFL2,label:'Silica'}],{target:55,yMin:30,yMax:90}));
      charts.appendChild(makeMixedChartCard('FL2 · Lyocell','Monthly average bars · selected-period daily line',[{key:P.pdLy,label:'Silica'}],{target:40,yMin:30,yMax:90}));
      charts.appendChild(makeSlushChartCard());
    }
    grid.appendChild(charts); block.appendChild(grid); return block;
  }

  function summaryPanel(area,stats){
    const panel=document.createElement('article');panel.className='panel';
    const title=el('reportMode').value==='weekly'?'Weekly Silica Summary':'Monthly Silica Summary';
    panel.innerHTML=`<div class="panel-heading"><div><h3>${title}</h3><p>Average and target achievement from measured daily values.</p></div></div>`;
    const table=document.createElement('table');table.className='summary-table';
    table.innerHTML='<thead><tr><th>Parameter</th><th>Target</th><th>Avg</th><th>Acc. Level</th></tr></thead>';
    const body=document.createElement('tbody');
    stats.metrics.forEach(m=>{
      const tr=document.createElement('tr');
      const avgBad=Number.isFinite(m.avg) && !passes(m.avg,m.target,m.rule);
      tr.innerHTML=`<td>${escapeHtml(m.label)}</td><td class="target-chip">${ruleSymbol(m.rule)} ${fmt(m.target,0)}</td><td class="${avgBad?'bad':'good'}">${fmt(m.avg,1)}</td><td class="${m.acc<100?'bad':'good'}">${Number.isFinite(m.acc)?Math.round(m.acc)+'%':'—'}</td>`;
      body.appendChild(tr);
    });
    table.appendChild(body);panel.appendChild(table);return panel;
  }

  function pendingPanel(area,actions){
    const box=document.createElement('div');box.className='pending-card';
    box.innerHTML=`<div class="pending-card-head"><strong>Pending Actions (${actions.length})</strong><button class="mini-btn" data-go-actions="${escapeAttr(area)}">View All →</button></div>`;
    const list=document.createElement('div');list.className='pending-list';
    if(!actions.length) list.innerHTML='<div class="empty-state">No pending actions.</div>';
    actions.slice(0,4).forEach(a=>{const item=document.createElement('div');item.className='pending-item';item.innerHTML=`<span class="pending-dot"></span><span>${escapeHtml(a.Action)}</span>`;list.appendChild(item)});
    box.appendChild(list);
    box.querySelector('[data-go-actions]')?.addEventListener('click',()=>{actionFilter=area;switchSection('actions');renderActions()});
    return box;
  }

  function getAreaStats(area){
    const rows=getPeriodRows('Silica');
    let metas=SILICA_META.filter(x=>x.area===area).map(resolveMeta);
    const metrics=metas.map(meta=>metricStats(rows,meta));
    if(area==='Pulp Dryer') metrics.push(slushStats(rows));
    const all=metrics.reduce((acc,m)=>({pass:acc.pass+m.pass,count:acc.count+m.count}),{pass:0,count:0});
    return {metrics,achievement:all.count?100*all.pass/all.count:0,pass:all.pass,count:all.count};
  }

  function metricStats(rows,meta){
    const values=rows.map(r=>toNumber(r[meta.key])).filter(Number.isFinite);
    const pass=values.filter(v=>passes(v,meta.target,meta.rule)).length;
    return {...meta,avg:mean(values),acc:values.length?100*pass/values.length:NaN,pass,count:values.length};
  }

  function slushStats(rows){
    const values=rows.map(r=>rowSlush(r)).filter(Number.isFinite);
    const target=55,rule='<=';const pass=values.filter(v=>passes(v,target,rule)).length;
    return {label:'Slush APR',key:'__slush__',target,rule,avg:mean(values),acc:values.length?100*pass/values.length:NaN,pass,count:values.length};
  }

  function renderExecutiveReadout(){
    const rows=getPeriodRows('Silica');
    const metrics=[...SILICA_META.map(resolveMeta).map(m=>metricStats(rows,m)),slushStats(rows)];
    const assessed=metrics.reduce((n,m)=>n+m.count,0); const passed=metrics.reduce((n,m)=>n+m.pass,0); const outside=assessed-passed;
    const tf=getLatestTFSummary(); const pending=state.actions.filter(a=>a.Status==='Pending'); const overdue=pending.filter(isOverdue).length;
    const panel=document.createElement('div'); panel.className='readout-grid';
    panel.innerHTML=`
      <article class="panel">
        <div class="panel-heading"><div><h3>Executive Readout</h3><p>What Needs Attention</p></div></div>
        <div class="readout-list">
          <div class="readout-stat"><strong>${outside}</strong><span>of ${assessed} assessed silica readings outside configured targets</span></div>
          <div class="readout-stat"><strong>${tf.low}</strong><span>latest cleaner stages below the 1.50 thickening-factor limit</span></div>
          <div class="readout-stat"><strong>${overdue}</strong><span>overdue pending actions based on today, not the selected report date</span></div>
        </div>
      </article>
      <article class="panel commentary"><div class="panel-heading"><div><h3>${el('reportMode').value==='weekly'?'Weekly':'Monthly'} Commentary</h3><p>Investigation Note</p></div></div><p>${escapeHtml(state.settings.commentary||'Review silica, washing pressure, screening availability and cleaner conditions together. Process trends support investigation; they do not prove causation.')}</p></article>`;
    return panel;
  }

  function makeMixedChartCard(title,subtitle,series,opts={}){
    const card=makeChartCard(title,subtitle);
    requestAnimationFrame(()=>renderMixedChart(card.querySelector('.svg-chart'),series,opts));
    fillLegend(card,series.map((s,i)=>({label:s.label,color:COLORS[i]})),opts.target);
    return card;
  }

  function makeSlushChartCard(){
    const card=makeChartCard('Slush To APR','Overall aggregates PD1, PD2 and PD3 daily readings');
    const series=[{key:P.slushPD1,label:'PD1'},{key:P.slushPD2,label:'PD2'},{key:P.slushPD3,label:'PD3'},{key:'__slush__',label:'Overall'}];
    requestAnimationFrame(()=>renderMixedChart(card.querySelector('.svg-chart'),series,{target:55,yMin:30,yMax:90}));
    fillLegend(card,series.map((s,i)=>({label:s.label,color:COLORS[i]})),55);return card;
  }

  function makeChartCard(title,subtitle){
    const frag=el('chartCardTemplate').content.cloneNode(true);const card=frag.querySelector('.chart-card');
    card.querySelector('.chart-title').textContent=title;card.querySelector('.chart-subtitle').textContent=subtitle||'';return card;
  }

  function fillLegend(card,items,target){
    const host=card.querySelector('.chart-legend');
    items.forEach(item=>{const d=document.createElement('div');d.className='legend-item';d.innerHTML=`<span class="legend-swatch" style="background:${item.color}"></span><span>${escapeHtml(item.label)}</span>`;host.appendChild(d)});
    if(Number.isFinite(target)){const d=document.createElement('div');d.className='legend-item';d.innerHTML='<span class="legend-swatch" style="background:#b35f5f"></span><span>Target</span>';host.appendChild(d)}
  }

  function renderMixedChart(host,series,opts){
    if(!host) return; const period=getPeriod();
    const historyMonths=previousMonths(period.start,8);
    const days=dateRange(period.start,period.end);
    const labels=[...historyMonths.map(m=>formatMonthShort(parseDate(m+'-01'))),...days.map(d=>formatDay(parseDate(d)))];
    const monthlyCount=historyMonths.length;
    const datasets=series.map((s,i)=>({
      ...s,color:COLORS[i%COLORS.length],
      monthly:historyMonths.map(m=>effectiveMonthlyValue('Silica',s.key,m)),
      daily:days.map(d=>getDailyValue('Silica',d,s.key))
    }));
    drawMixedSvg(host,labels,monthlyCount,datasets,opts);
  }

  function drawMixedSvg(host,labels,monthlyCount,datasets,opts={}){
    const W=760,H=230,m={l:42,r:14,t:10,b:36}; const pw=W-m.l-m.r,ph=H-m.t-m.b;
    let values=[];datasets.forEach(ds=>values.push(...ds.monthly,...ds.daily));values=values.filter(Number.isFinite); if(Number.isFinite(opts.target))values.push(opts.target);
    let yMin=Number.isFinite(opts.yMin)?opts.yMin:Math.floor((Math.min(...values,0))*0.9); let yMax=Number.isFinite(opts.yMax)?opts.yMax:Math.ceil((Math.max(...values,1))*1.1); if(yMax<=yMin)yMax=yMin+1;
    const x=i=>m.l+(labels.length<=1?pw/2:i*pw/(labels.length-1)); const y=v=>m.t+ph-(v-yMin)*ph/(yMax-yMin);
    let svg=`<svg viewBox="0 0 ${W} ${H}" role="img">`;
    for(let i=0;i<=4;i++){const val=yMin+(yMax-yMin)*i/4;const yy=y(val);svg+=`<line class="chart-grid" x1="${m.l}" y1="${yy}" x2="${W-m.r}" y2="${yy}"/><text class="chart-text" x="${m.l-7}" y="${yy+3}" text-anchor="end">${fmt(val,0)}</text>`}
    svg+=`<line class="chart-axis" x1="${m.l}" y1="${m.t+ph}" x2="${W-m.r}" y2="${m.t+ph}"/>`;
    if(Number.isFinite(opts.target)){const yy=y(opts.target);svg+=`<line class="chart-target" x1="${m.l}" y1="${yy}" x2="${W-m.r}" y2="${yy}"/>`}
    if(monthlyCount>0 && monthlyCount<labels.length){const sx=(x(monthlyCount-1)+x(monthlyCount))/2;svg+=`<line x1="${sx}" y1="${m.t}" x2="${sx}" y2="${m.t+ph}" stroke="#c9d4df" stroke-dasharray="2 3"/><text class="chart-caption" x="${sx-5}" y="${m.t+10}" text-anchor="end">Monthly Avg</text><text class="chart-caption" x="${sx+5}" y="${m.t+10}">Daily</text>`}
    const groupW=Math.max(3,Math.min(11,(pw/Math.max(1,labels.length))*0.7/Math.max(1,datasets.length)));
    datasets.forEach((ds,di)=>{ds.monthly.forEach((v,i)=>{if(!Number.isFinite(v))return;const xx=x(i)+(di-(datasets.length-1)/2)*groupW;const yy=y(v);svg+=`<rect class="chart-bar" x="${xx-groupW*.42}" y="${yy}" width="${groupW*.84}" height="${m.t+ph-yy}" rx="1" fill="${ds.color}"/>`})});
    datasets.forEach((ds,di)=>{let pts=[];ds.daily.forEach((v,j)=>{if(Number.isFinite(v))pts.push([x(monthlyCount+j),y(v),v])});if(pts.length){svg+=`<polyline class="chart-line" stroke="${ds.color}" points="${pts.map(p=>p[0]+','+p[1]).join(' ')}"/>`;pts.forEach(p=>svg+=`<circle class="chart-dot" cx="${p[0]}" cy="${p[1]}" r="2.7" fill="${ds.color}"/>`)}});
    labels.forEach((lab,i)=>{if(labels.length>16 && i%2) return;svg+=`<text class="chart-text" x="${x(i)}" y="${H-10}" text-anchor="middle">${escapeSvg(lab)}</text>`});
    svg+='</svg>';host.innerHTML=svg;
  }

  function renderActions(){
    const host=el('actionsContent');if(!host)return;
    const statuses=['All','Pending','Done','Cancelled']; const areaFilters=['Woodyard','Fiberline','Pulp Dryer','Technical'];
    const filterRow=document.createElement('div');filterRow.className='actions-toolbar';
    const chips=document.createElement('div');chips.className='status-filter';
    [...statuses,...areaFilters].forEach(s=>{const b=document.createElement('button');b.className='filter-chip'+(actionFilter===s?' active':'');b.textContent=s;b.addEventListener('click',()=>{actionFilter=s;renderActions()});chips.appendChild(b)});
    const pending=state.actions.filter(a=>a.Status==='Pending'); const overdue=pending.filter(isOverdue).length;
    filterRow.append(chips);filterRow.insertAdjacentHTML('beforeend',`<div class="action-counts">${pending.length} pending · ${overdue} overdue</div>`);
    const highlights=document.createElement('div');highlights.className='highlight-grid';
    const areaCount=a=>state.actions.filter(x=>x.Area===a&&x.Status==='Pending').length;
    [['Pending',pending.length,'Open actions'],['Overdue',overdue,'Based on today'],['Woodyard',areaCount('Woodyard'),'Pending'],['Fiberline + PD',areaCount('Fiberline')+areaCount('Pulp Dryer'),'Pending']].forEach(x=>highlights.insertAdjacentHTML('beforeend',`<div class="highlight-card"><span class="kicker">${x[0]}</span><strong>${x[1]}</strong><small>${x[2]}</small></div>`));
    let rows=state.actions.slice(); if(statuses.includes(actionFilter)&&actionFilter!=='All') rows=rows.filter(a=>a.Status===actionFilter); if(areaFilters.includes(actionFilter))rows=rows.filter(a=>a.Area===actionFilter);
    rows.sort((a,b)=>(a.Status==='Pending'?-1:1)-(b.Status==='Pending'?-1:1) || (a.Due||'9999').localeCompare(b.Due||'9999'));
    const wrap=document.createElement('div');wrap.className='action-table-wrap';
    const table=document.createElement('table');table.className='action-table';table.innerHTML='<thead><tr><th>Area</th><th>Action</th><th>PIC</th><th>Due</th><th>Status</th><th>Update</th><th></th></tr></thead>';
    const tb=document.createElement('tbody'); rows.forEach(a=>{const tr=document.createElement('tr');const overdueClass=isOverdue(a)?'overdue':'';tr.innerHTML=`<td>${escapeHtml(a.Area)}</td><td class="action-name">${escapeHtml(a.Action)}</td><td>${escapeHtml(a.PIC||'—')}</td><td class="${overdueClass}">${a.Due?formatShort(parseDate(a.Due)):'—'}${isOverdue(a)?' · Overdue':''}</td><td><span class="status-pill status-${(a.Status||'').toLowerCase()}">${escapeHtml(a.Status)}</span></td><td>${escapeHtml(a.Update||'—')}</td><td><div class="row-actions"><button class="mini-btn" data-edit="${a.id}">Edit</button><button class="mini-btn" data-delete="${a.id}">Delete</button></div></td>`;tb.appendChild(tr)});table.appendChild(tb);wrap.appendChild(table);
    host.replaceChildren(filterRow,highlights,wrap);
    host.querySelectorAll('[data-edit]').forEach(b=>b.addEventListener('click',()=>openActionDialog(b.dataset.edit)));
    host.querySelectorAll('[data-delete]').forEach(b=>b.addEventListener('click',()=>deleteAction(b.dataset.delete)));
    el('pendingBadge').textContent=pending.length;
  }

  function openActionDialog(id){
    const a=id?state.actions.find(x=>x.id===id):null;el('actionDialogTitle').textContent=a?'Edit Action':'Add Action';el('actionId').value=a?.id||'';el('actionArea').value=a?.Area||'Woodyard';el('actionStatus').value=a?.Status||'Pending';el('actionText').value=a?.Action||'';el('actionPic').value=a?.PIC||'';el('actionDue').value=a?.Due||'';el('actionUpdate').value=a?.Update||'';el('actionDialog').showModal();
  }
  function saveActionFromDialog(){
    const actionText=el('actionText').value.trim();if(!actionText){el('actionText').focus();return}
    const id=el('actionId').value||uid(); const existing=state.actions.find(x=>x.id===id); const obj={id,Area:el('actionArea').value,Action:actionText,PIC:el('actionPic').value.trim(),Due:el('actionDue').value,Status:el('actionStatus').value,Update:el('actionUpdate').value.trim()};
    if(existing)Object.assign(existing,obj);else state.actions.push(obj);saveState();el('actionDialog').close();renderAll();
  }
  function deleteAction(id){if(!confirm('Delete this action?'))return;state.actions=state.actions.filter(a=>a.id!==id);saveState();renderAll()}
  function isOverdue(a){return a.Status==='Pending'&&a.Due&&a.Due<iso(new Date())}

  function renderAppendix(){
    const host=el('appendixContent');if(!host)return;host.innerHTML='';
    host.appendChild(appendixGroup('Woodyard Process Evidence',[
      lineSpec('Log Washing Pressure','Washing',SHEET_HEADERS.Washing.slice(1),{yMin:0,yMax:10,target:8}),
      lineSpec('Silica After Chipper Detail','Silica',[P.ch1,P.ch2,P.ch4,P.ch5,P.ch6,P.ch78,P.ch910,P.ch11,P.ch12],{yMin:120,yMax:220,target:160})
    ]));
    host.appendChild(appendixGroup('Fiberline Process Evidence',[
      lineSpec('CTS / Chip Screen Bypass · FL1','Bypass',SHEET_HEADERS.Bypass.slice(1,5),{yMin:0,yMax:100}),
      lineSpec('CTS / Chip Screen Bypass · FL2','Bypass',SHEET_HEADERS.Bypass.slice(5),{yMin:0,yMax:100}),
      dualSpec('AE · Bark On Vs Silica',P.barkAE,[P.chipFL1,P.chipFL2]),
      dualSpec('Lyocell · Bark On Vs Silica',P.barkLy,[P.chipLy]),
      lineSpec('Screening Reject Flow','Screening flow',SHEET_HEADERS['Screening flow'].slice(1),{}),
      lineSpec('Screening Operation','Screening operation',SHEET_HEADERS['Screening operation'].slice(1),{yMin:0,yMax:100}),
      lineSpec('Bleaching pH','pH',SHEET_HEADERS.pH.slice(1),{})
    ]));
    host.appendChild(appendixGroup('Pulp Dryer Process Evidence',[
      lineSpec('OV Reject · PD1','OV reject',SHEET_HEADERS['OV reject'].slice(1,7),{yMin:30,yMax:100}),
      lineSpec('OV Reject · PD2','OV reject',SHEET_HEADERS['OV reject'].slice(7,13),{yMin:30,yMax:100}),
      lineSpec('OV Reject · PD3','OV reject',SHEET_HEADERS['OV reject'].slice(13),{yMin:30,yMax:100}),
      lineSpec('Headbox pH','Headbox pH',SHEET_HEADERS['Headbox pH'].slice(1),{})
    ]));
    host.appendChild(renderTFSection());
  }

  function appendixGroup(title,specs){const group=document.createElement('div');group.className='appendix-group';group.innerHTML=`<div class="appendix-group-head"><h3>${escapeHtml(title)}</h3></div>`;const grid=document.createElement('div');grid.className='appendix-grid';specs.forEach(spec=>grid.appendChild(spec));group.appendChild(grid);return group}
  function lineSpec(title,sheet,keys,opts){const card=makeChartCard(title,'Selected-period daily readings');fillLegend(card,keys.map((k,i)=>({label:shortParam(k),color:COLORS[i%COLORS.length]})),opts.target);requestAnimationFrame(()=>renderLineChart(card.querySelector('.svg-chart'),sheet,keys,opts));return card}
  function dualSpec(title,barkKey,silicaKeys){const card=makeChartCard(title,'Bark on shown as bars · silica shown as line');fillLegend(card,[{label:'Bark On (%)',color:'#9aa9b7'},...silicaKeys.map((k,i)=>({label:shortParam(k),color:COLORS[i]}))],160);requestAnimationFrame(()=>renderDualChart(card.querySelector('.svg-chart'),barkKey,silicaKeys));return card}

  function renderLineChart(host,sheet,keys,opts={}){
    const rows=getPeriodRows(sheet);const labels=rows.map(r=>formatDay(parseDate(r.Date)));const datasets=keys.map((k,i)=>({key:k,label:shortParam(k),color:COLORS[i%COLORS.length],values:rows.map(r=>toNumber(r[k]))}));drawLineSvg(host,labels,datasets,opts)
  }
  function drawLineSvg(host,labels,datasets,opts={}){
    const W=760,H=230,m={l:42,r:14,t:10,b:36},pw=W-m.l-m.r,ph=H-m.t-m.b;let vals=[];datasets.forEach(d=>vals.push(...d.values));vals=vals.filter(Number.isFinite);if(Number.isFinite(opts.target))vals.push(opts.target);if(!vals.length){host.innerHTML='<div class="empty-state">No data in this period.</div>';return}
    let yMin=Number.isFinite(opts.yMin)?opts.yMin:Math.floor(Math.min(...vals)*.9*10)/10;let yMax=Number.isFinite(opts.yMax)?opts.yMax:Math.ceil(Math.max(...vals)*1.1*10)/10;if(yMax<=yMin)yMax=yMin+1;const x=i=>m.l+(labels.length<=1?pw/2:i*pw/(labels.length-1));const y=v=>m.t+ph-(v-yMin)*ph/(yMax-yMin);let svg=`<svg viewBox="0 0 ${W} ${H}">`;
    for(let i=0;i<=4;i++){const v=yMin+(yMax-yMin)*i/4,yy=y(v);svg+=`<line class="chart-grid" x1="${m.l}" y1="${yy}" x2="${W-m.r}" y2="${yy}"/><text class="chart-text" x="${m.l-7}" y="${yy+3}" text-anchor="end">${fmt(v,1)}</text>`}svg+=`<line class="chart-axis" x1="${m.l}" y1="${m.t+ph}" x2="${W-m.r}" y2="${m.t+ph}"/>`;if(Number.isFinite(opts.target)){const yy=y(opts.target);svg+=`<line class="chart-target" x1="${m.l}" y1="${yy}" x2="${W-m.r}" y2="${yy}"/>`}
    datasets.forEach(ds=>{const pts=[];ds.values.forEach((v,i)=>{if(Number.isFinite(v))pts.push([x(i),y(v)])});if(pts.length){svg+=`<polyline class="chart-line" stroke="${ds.color}" points="${pts.map(p=>p.join(',')).join(' ')}"/>`;pts.forEach(p=>svg+=`<circle class="chart-dot" cx="${p[0]}" cy="${p[1]}" r="2.4" fill="${ds.color}"/>`)}});labels.forEach((lab,i)=>{if(labels.length>16&&i%2)return;svg+=`<text class="chart-text" x="${x(i)}" y="${H-10}" text-anchor="middle">${escapeSvg(lab)}</text>`});svg+='</svg>';host.innerHTML=svg;
  }

  function renderDualChart(host,barkKey,silicaKeys){
    const p=getPeriod();const dates=dateRange(p.start,p.end);const barkRows=indexRows(state.daily.Bark);const silicaRows=indexRows(state.daily.Silica);const labels=dates.map(d=>formatDay(parseDate(d)));const bark=dates.map(d=>toNumber(barkRows[d]?.[barkKey]));const sil= silicaKeys.map((k,i)=>({label:shortParam(k),color:COLORS[i],values:dates.map(d=>toNumber(silicaRows[d]?.[k]))}));
    const W=760,H=230,m={l:42,r:42,t:10,b:36},pw=W-m.l-m.r,ph=H-m.t-m.b;const x=i=>m.l+(labels.length<=1?pw/2:i*pw/(labels.length-1)),yb=v=>m.t+ph-v*ph/100,ys=v=>m.t+ph-(v-100)*ph/120;let svg=`<svg viewBox="0 0 ${W} ${H}">`;
    for(let i=0;i<=4;i++){const b=25*i,s=100+30*i,yy=m.t+ph-i*ph/4;svg+=`<line class="chart-grid" x1="${m.l}" y1="${yy}" x2="${W-m.r}" y2="${yy}"/><text class="chart-text" x="${m.l-6}" y="${yy+3}" text-anchor="end">${b}%</text><text class="chart-text" x="${W-m.r+6}" y="${yy+3}">${s}</text>`}
    bark.forEach((v,i)=>{if(!Number.isFinite(v))return;const xx=x(i);svg+=`<rect class="chart-bar" x="${xx-7}" y="${yb(v)}" width="14" height="${m.t+ph-yb(v)}" rx="2" fill="#9aa9b7"/>`});
    sil.forEach(ds=>{const pts=[];ds.values.forEach((v,i)=>{if(Number.isFinite(v))pts.push([x(i),ys(v)])});if(pts.length){svg+=`<polyline class="chart-line" stroke="${ds.color}" points="${pts.map(p=>p.join(',')).join(' ')}"/>`;pts.forEach(p=>svg+=`<circle class="chart-dot" cx="${p[0]}" cy="${p[1]}" r="2.4" fill="${ds.color}"/>`)}});const targetY=ys(160);svg+=`<line class="chart-target" x1="${m.l}" y1="${targetY}" x2="${W-m.r}" y2="${targetY}"/>`;labels.forEach((lab,i)=>{if(labels.length>16&&i%2)return;svg+=`<text class="chart-text" x="${x(i)}" y="${H-10}" text-anchor="middle">${escapeSvg(lab)}</text>`});svg+='</svg>';host.innerHTML=svg;
  }

  function renderTFSection(){
    const sec=document.createElement('div');sec.className='tf-section panel';sec.innerHTML='<div class="panel-heading"><div><h3>Thickening Factor</h3><p>Seven historical tables retained. Values &lt;1.50 are highlighted for inspection; exactly 1.50 meets the limit.</p></div></div>';
    const tabs=document.createElement('div');tabs.className='tf-tabs';TF_SHEETS.forEach((s,i)=>{const b=document.createElement('button');b.className='tf-tab'+(i===0?' active':'');b.textContent=s.replace('TF ','');b.addEventListener('click',()=>{tabs.querySelectorAll('.tf-tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderTFTable(tableHost,s)});tabs.appendChild(b)});const tableHost=document.createElement('div');sec.append(tabs,tableHost);renderTFTable(tableHost,TF_SHEETS[0]);return sec;
  }
  function renderTFTable(host,sheet){const rows=(state.tf[sheet]||[]).slice().sort((a,b)=>a.Date.localeCompare(b.Date));const headers=rows.length?Object.keys(rows[0]):['Date'];const wrap=document.createElement('div');wrap.className='tf-table-wrap';const table=document.createElement('table');table.className='tf-table';table.innerHTML=`<thead><tr>${headers.map(h=>`<th>${escapeHtml(h)}</th>`).join('')}</tr></thead>`;const tb=document.createElement('tbody');rows.forEach(r=>{tb.innerHTML+=`<tr>${headers.map(h=>{const v=r[h];const low=h!=='Date'&&Number.isFinite(toNumber(v))&&toNumber(v)<1.5;return `<td class="${low?'tf-low':''}">${h==='Date'?formatShort(parseDate(v)):fmt(v,2)}</td>`}).join('')}</tr>`});table.appendChild(tb);wrap.appendChild(table);host.replaceChildren(wrap)}
  function getLatestTFSummary(){let low=0,total=0;TF_SHEETS.forEach(s=>{const rows=(state.tf[s]||[]).slice().sort((a,b)=>a.Date.localeCompare(b.Date));const r=rows.at(-1);if(!r)return;Object.entries(r).forEach(([k,v])=>{if(k==='Date')return;const n=toNumber(v);if(Number.isFinite(n)){total++;if(n<1.5)low++}})});return {low,total}}

  function renderDataCoverage(){const host=el('dataCoverage');if(!host)return;const grid=document.createElement('div');grid.className='coverage-grid';DAILY_SHEETS.forEach(s=>{const rows=state.daily[s]||[];const dates=rows.map(r=>r.Date).filter(Boolean).sort();grid.innerHTML+=`<div class="coverage-card"><strong>${escapeHtml(s)}</strong><span>${rows.length.toLocaleString()} rows · ${dates.length?formatShort(parseDate(dates[0]))+' to '+formatShort(parseDate(dates.at(-1))):'No data'}</span></div>`});host.replaceChildren(grid)}

  function fillPasteSheets(){const sel=el('pasteSheet');PASTE_SHEETS.forEach(s=>{const o=document.createElement('option');o.value=s;o.textContent=s;sel.appendChild(o)})}

  async function importWorkbook(file){
    const preview=el('importPreview');preview.classList.remove('hidden');preview.textContent='Reading workbook…';
    try{
      await ensureXLSX();
      const ab=await file.arrayBuffer();const wb=XLSX.read(ab,{type:'array',cellDates:true});let counts=[];
      DAILY_SHEETS.forEach(sheet=>{const ws=wb.Sheets[sheet];if(!ws)return;const rows=XLSX.utils.sheet_to_json(ws,{defval:null,raw:true});const n=mergeWideRows(state.daily[sheet],normalizeRows(rows));counts.push(`${sheet}: ${n}`)});
      [['Monthly silica','Silica'],['Monthly bark','Bark']].forEach(([sheet,key])=>{const ws=wb.Sheets[sheet];if(!ws)return;const rows=normalizeRows(XLSX.utils.sheet_to_json(ws,{defval:null,raw:true}),true);const n=mergeWideRows(state.monthlyOverrides[key],rows);counts.push(`${sheet}: ${n}`)});
      TF_SHEETS.forEach(sheet=>{const ws=wb.Sheets[sheet];if(!ws)return;const rows=normalizeRows(XLSX.utils.sheet_to_json(ws,{defval:null,raw:true}));const n=mergeWideRows(state.tf[sheet],rows);counts.push(`${sheet}: ${n}`)});
      if(wb.Sheets.Actions){const rows=XLSX.utils.sheet_to_json(wb.Sheets.Actions,{defval:null,raw:true});mergeActions(rows);counts.push(`Actions: ${rows.length}`)}
      if(wb.Sheets.Limits){const rows=XLSX.utils.sheet_to_json(wb.Sheets.Limits,{defval:null,raw:true});state.limits=rows.filter(r=>r.Parameter).map(r=>({...r,'Upper / target':toNumber(r['Upper / target'])}));counts.push(`Limits: ${state.limits.length}`)}
      if(wb.Sheets.Setup){const rows=XLSX.utils.sheet_to_json(wb.Sheets.Setup,{header:1,defval:null,raw:true});readSetupRows(rows)}
      state.settings.dataSource=file.name;saveState();preview.innerHTML=`<b>Import complete.</b> ${counts.join(' · ')}`;renderAll();
    }catch(err){console.error(err);preview.textContent='Could not read this workbook. Check that the workbook uses the expected sheet names and includes a Date column.'}
  }

  function normalizeRows(rows,monthMode=false){return rows.map(r=>{const out={};Object.entries(r).forEach(([k,v])=>{const key=canonicalHeader(k);if(key==='Date')out.Date=normalizeDateValue(v,monthMode);else out[key]=blank(v)?null:(typeof v==='number'?v:v)});return out}).filter(r=>r.Date)}
  function canonicalHeader(h){const s=String(h||'').trim();if(/^date$/i.test(s))return'Date';const aliases=[
    [/slush.*pd1/i,P.slushPD1],[/slush.*pd2/i,P.slushPD2],[/slush.*pd3/i,P.slushPD3]
  ];for(const [rx,key] of aliases)if(rx.test(s))return key;return s}
  function normalizeDateValue(v,monthMode=false){let d;if(v instanceof Date)d=v;else if(typeof v==='number'&&typeof XLSX!=='undefined'){const p=XLSX.SSF.parse_date_code(v);if(p)d=new Date(Date.UTC(p.y,p.m-1,p.d))}else if(typeof v==='string'){const x=v.trim();if(/^\d{4}-\d{2}(-\d{2})?$/.test(x))d=parseDate(x.length===7?x+'-01':x);else{const tmp=new Date(x);if(!isNaN(tmp))d=new Date(Date.UTC(tmp.getFullYear(),tmp.getMonth(),tmp.getDate()))}}if(!d||isNaN(d))return null;if(monthMode)d=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),1));return iso(d)}
  function mergeWideRows(target,incoming){let changed=0;const map=new Map(target.map(r=>[r.Date,r]));incoming.forEach(row=>{if(!row.Date)return;let dst=map.get(row.Date);if(!dst){dst={Date:row.Date};target.push(dst);map.set(row.Date,dst)}Object.entries(row).forEach(([k,v])=>{if(k==='Date'||blank(v))return;dst[k]=coerceValue(v);changed++})});target.sort((a,b)=>a.Date.localeCompare(b.Date));return changed}
  function mergeActions(rows){rows.forEach(r=>{if(!r.Action)return;const key=`${r.Area||''}|${r.Action}`;let a=state.actions.find(x=>`${x.Area||''}|${x.Action}`===key);const obj={Area:String(r.Area||a?.Area||'Technical'),Action:String(r.Action),PIC:String(r.PIC??a?.PIC??''),Due:normalizeDateValue(r.Due)||a?.Due||'',Status:['Done','Cancelled','Pending'].includes(String(r.Status))?String(r.Status):(a?.Status||'Pending'),Update:String(r.Update??a?.Update??'')};if(a)Object.assign(a,obj);else state.actions.push({id:uid(),...obj})})}
  function readSetupRows(rows){for(let i=0;i<rows.length;i++){const key=String(rows[i]?.[0]||'').trim().toLowerCase(),v=rows[i]?.[1];if(key==='week ending'){const d=normalizeDateValue(v);if(d){state.settings.weekEnd=d;el('weekEnd').value=d;el('monthPicker').value=d.slice(0,7)}}if(key==='commentary'&&v)state.settings.commentary=String(v)}}

  function importPastedData(){const sheet=el('pasteSheet').value;const raw=el('pasteData').value.trim();const msg=el('pasteMessage');if(!raw){msg.textContent='Paste data first.';msg.className='inline-message error';return}try{const lines=raw.split(/\r?\n/).filter(Boolean);const headers=lines[0].split('\t').map(x=>canonicalHeader(x.trim()));if(!headers.includes('Date')&&sheet!=='Actions')throw new Error('Date header is required.');const rows=lines.slice(1).map(line=>{const vals=line.split('\t');const r={};headers.forEach((h,i)=>r[h]=vals[i]===''?null:vals[i]);return r});let changed=0;if(DAILY_SHEETS.includes(sheet))changed=mergeWideRows(state.daily[sheet],normalizeRows(rows));else if(TF_SHEETS.includes(sheet))changed=mergeWideRows(state.tf[sheet],normalizeRows(rows));else if(sheet==='Actions'){mergeActions(rows);changed=rows.length}saveState();renderAll();msg.textContent=`Saved ${changed} updated value${changed===1?'':'s'}.`;msg.className='inline-message success'}catch(e){msg.textContent=e.message||'Could not parse pasted data.';msg.className='inline-message error'}}

  async function exportExcel(){
    try{ await ensureXLSX(); }catch{ alert('Excel library could not be loaded. Use JSON backup or Paste Data until the CDN is accessible.'); return; }
    const wb=XLSX.utils.book_new();
    const setup=[['Setting','Value'],['Week ending',getPeriod().end],['Data source',state.settings.dataSource||'Browser data'],['Commentary',state.settings.commentary||'']];XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(setup),'Setup');
    DAILY_SHEETS.forEach(s=>XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(state.daily[s]||[],{header:SHEET_HEADERS[s]}),s));
    XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(buildMonthlySheet('Silica')),'Monthly silica');
    XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(buildMonthlySheet('Bark')),'Monthly bark');
    TF_SHEETS.forEach(s=>XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(state.tf[s]||[]),s));
    XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(state.actions.map(({id,...a})=>a),{header:['Area','Action','PIC','Due','Status','Update']}),'Actions');
    XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(state.limits||[]),'Limits');
    XLSX.writeFile(wb,'Silica_Reduction_Dashboard_Export.xlsx');
  }
  function buildMonthlySheet(sheet){const rows=state.daily[sheet]||[];const months=[...new Set(rows.map(r=>r.Date.slice(0,7)))].sort();const keys=SHEET_HEADERS[sheet]?.slice(1)||[];return months.map(m=>{const r={Date:m+'-01'};keys.forEach(k=>r[k]=effectiveMonthlyValue(sheet,k,m));return r})}

  function exportPdf(){document.querySelectorAll('.section-page').forEach(x=>x.classList.remove('print-active'));const section=el(`section-${currentSection}`);section.classList.add('print-active');setTimeout(()=>window.print(),60)}
  function downloadBackup(){const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});downloadBlob(blob,`silica-dashboard-backup-${iso(new Date())}.json`)}
  async function restoreBackup(file){try{const data=JSON.parse(await file.text());if(!data.daily||!data.actions)throw new Error();state=data;saveState();renderAll();alert('Backup restored.')}catch{alert('This is not a valid Silica Reduction Dashboard backup.')}}
  function downloadBlob(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
  function resetDemo(){if(!confirm('Reset all browser-stored dashboard data to the synthetic demo dataset?'))return;state=createDemoState();saveState();el('weekEnd').value=state.settings.weekEnd;el('monthPicker').value=state.settings.weekEnd.slice(0,7);renderAll()}


  function ensureXLSX(){
    if(typeof XLSX!=='undefined') return Promise.resolve(XLSX);
    if(window.__xlsxLoading) return window.__xlsxLoading;
    window.__xlsxLoading=new Promise((resolve,reject)=>{
      const script=document.createElement('script');
      script.src='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
      script.async=true;
      const timer=setTimeout(()=>{script.remove();reject(new Error('SheetJS load timeout'));window.__xlsxLoading=null;},10000);
      script.onload=()=>{clearTimeout(timer);typeof XLSX!=='undefined'?resolve(XLSX):reject(new Error('SheetJS unavailable'));};
      script.onerror=()=>{clearTimeout(timer);reject(new Error('SheetJS load failed'));window.__xlsxLoading=null;};
      document.head.appendChild(script);
    });
    return window.__xlsxLoading;
  }

  function effectiveMonthlyValue(sheet,key,ym){const override=(state.monthlyOverrides[sheet]||[]).find(r=>r.Date.slice(0,7)===ym);if(override&&!blank(override[key]))return toNumber(override[key]);const vals=(state.daily[sheet]||[]).filter(r=>r.Date.startsWith(ym)).map(r=>key==='__slush__'?rowSlush(r):toNumber(r[key])).filter(Number.isFinite);return mean(vals)}
  function getDailyValue(sheet,date,key){const r=(state.daily[sheet]||[]).find(x=>x.Date===date);if(!r)return NaN;return key==='__slush__'?rowSlush(r):toNumber(r[key])}
  function getPeriodRows(sheet){const p=getPeriod();return (state.daily[sheet]||[]).filter(r=>r.Date>=p.start&&r.Date<=p.end).sort((a,b)=>a.Date.localeCompare(b.Date))}
  function rowSlush(r){const vals=[P.slushPD1,P.slushPD2,P.slushPD3].map(k=>toNumber(r[k])).filter(Number.isFinite);return mean(vals)}
  function resolveMeta(meta){const custom=(state.limits||[]).find(x=>x.Sheet==='Silica'&&x.Parameter===meta.key);if(!custom)return meta;const target=toNumber(custom['Upper / target']);return {...meta,target:Number.isFinite(target)?target:meta.target,rule:custom.Rule||meta.rule}}

  function createDemoState(){
    const s={version:1,settings:{weekEnd:'2026-09-22',month:'2026-09',reportMode:'weekly',dataSource:'Synthetic demo data',commentary:'Woodyard silica remains the main attention area. Review washing pressure and screen availability alongside silica trends. These observations do not establish causation.'},daily:{},monthlyOverrides:{Silica:[],Bark:[]},tf:{},actions:[],limits:[]};DAILY_SHEETS.forEach(k=>s.daily[k]=[]);TF_SHEETS.forEach(k=>s.tf[k]=[]);
    const start=parseDate('2025-01-01'),end=parseDate('2026-09-22');let idx=0;for(let d=start;d<=end;d=addDays(d,1)){const ds=iso(d);idx++;const yearPhase=(d.getUTCFullYear()-2025)*.6;const q=(base,amp,shift=0)=>round(base+amp*Math.sin(idx/17+shift)+amp*.35*Math.sin(idx/5.3+shift*2)+yearPhase,1);
      const silica={Date:ds};
      const chipBase= ds<'2026-01-01'?182:171;[[P.ch1,9,0],[P.ch2,8,.5],[P.ch4,10,1],[P.ch5,9,1.5],[P.ch6,9,2],[P.ch78,8,2.5],[P.ch910,9,3],[P.ch11,10,3.5],[P.ch12,11,4]].forEach(([k,a,sh])=>silica[k]=q(chipBase,a,sh));
      silica[P.chipFL1]=q(ds<'2026-01-01'?159:151,8,.4);silica[P.chipFL2]=q(ds<'2026-01-01'?168:158,10,1.3);silica[P.chipLy]=q(ds<'2026-01-01'?171:163,10,2.1);silica[P.unbFL1]=q(228,16,.4);silica[P.unbFL2]=q(247,18,1.2);silica[P.unbLy]=q(244,17,2);silica[P.pdFL1]=q(53,7,.3);silica[P.pdFL2]=q(45,6,1.1);silica[P.pdLy]=q(42,5,2.1);silica[P.slushPD1]=q(49,5,.6);silica[P.slushPD2]=q(47,5,1.4);silica[P.slushPD3]=q(50,5,2.4);s.daily.Silica.push(silica);
      const washing={Date:ds};SHEET_HEADERS.Washing.slice(1).forEach((k,i)=>washing[k]=round(6.6+.65*Math.sin(idx/13+i*.55)+.25*Math.sin(idx/3.7),2));s.daily.Washing.push(washing);
      const bypass={Date:ds};SHEET_HEADERS.Bypass.slice(1).forEach((k,i)=>bypass[k]=Math.max(0,round(18+20*Math.sin(idx/11+i*.9)+9*Math.sin(idx/4.9+i),1)));s.daily.Bypass.push(bypass);
      const bark={Date:ds,[P.barkAE]:round(28+8*Math.sin(idx/19)+3*Math.sin(idx/6),2),[P.barkLy]:round(31+7*Math.sin(idx/23+1)+3*Math.sin(idx/7),2)};s.daily.Bark.push(bark);
      s.daily['Screening flow'].push({Date:ds,[SHEET_HEADERS['Screening flow'][1]]:round(8+.45*Math.sin(idx/13),2),[SHEET_HEADERS['Screening flow'][2]]:round(8.2+.45*Math.sin(idx/13+1),2)});
      const sop={Date:ds};SHEET_HEADERS['Screening operation'].slice(1).forEach((k,i)=>sop[k]=round(92+4*Math.sin(idx/15+i*.6),2));s.daily['Screening operation'].push(sop);
      const ph={Date:ds};ph[SHEET_HEADERS.pH[1]]=round(2.45+.12*Math.sin(idx/12),2);ph[SHEET_HEADERS.pH[2]]=round(4.25+.35*Math.sin(idx/17),2);ph[SHEET_HEADERS.pH[3]]=round(4.25+.4*Math.sin(idx/18+1),2);ph[SHEET_HEADERS.pH[4]]=round(4.0+.18*Math.sin(idx/16+2),2);s.daily.pH.push(ph);
      const ov={Date:ds};SHEET_HEADERS['OV reject'].slice(1).forEach((k,i)=>ov[k]=round(65+(i%3)*7+9*Math.sin(idx/16+i*.33),2));s.daily['OV reject'].push(ov);
      const hb={Date:ds};SHEET_HEADERS['Headbox pH'].slice(1).forEach((k,i)=>hb[k]=i%2===0?3.8:round(3.85+.22*Math.sin(idx/14+i),2));s.daily['Headbox pH'].push(hb);
    }
    const tfHeaders={
      'TF PD1 Old':['1st A','1st B','1st C','2nd A','2nd B','3rd','4th','5th','6th','Rev A','Rev B','Rev C'],
      'TF PD1 New':['1st A','1st B','1st C','1st D','2nd','3rd','4th','5th','6th','Rev A','Rev B','Rev C','Rev D'],
      'TF PD2 Old':['1st A','1st B','1st C','2nd A','2nd B','3rd','4th','5th','6th','Rev A','Rev B','Rev C'],
      'TF PD2 New':['1st A','1st B','1st C','1st D','2nd','3rd','4th','5th','6th','Rev A','Rev B','Rev C','Rev D'],
      'TF PD3 L1':['1st A','1st B','1st C','1st D','2nd A','2nd B','3rd','4th','5th','6th','Rev A','Rev B','Rev C','Rev D'],
      'TF PD3 L2':['1st A','1st B','1st C','1st D','2nd A','2nd B','3rd','4th','5th','6th','Rev A','Rev B','Rev C','Rev D'],
      'TF PD3 L3':['1st A','1st B','1st C','2nd','3rd','4th','5th','6th','7th','Rev A','Rev B','Rev C']};
    TF_SHEETS.forEach((sheet,si)=>{for(let y=2025;y<=2026;y++){const last=y===2026?9:12;for(let m=1;m<=last;m++){const r={Date:`${y}-${String(m).padStart(2,'0')}-${String(6+si).padStart(2,'0')}`};tfHeaders[sheet].forEach((h,j)=>{let v=1.65+1.25*((Math.sin(m*1.3+j*.8+si)+1)/2);if((m+j+si)%13===0)v=1.2;r[h]=round(v,2)});s.tf[sheet].push(r)}}});
    s.actions=[
      {id:uid(),Area:'Woodyard',Action:'Restore washing pressure and verify nozzle coverage',PIC:'Woodyard team',Due:'2026-09-21',Status:'Pending',Update:'Pump inspection completed; pressure verification pending.'},
      {id:uid(),Area:'Woodyard',Action:'Complete individual washing-pump configuration',PIC:'Maintenance team',Due:'2026-10-03',Status:'Pending',Update:'Confirm installation window.'},
      {id:uid(),Area:'Fiberline',Action:'Resolve CTS bypass and inspect the affected screen',PIC:'Fiberline team',Due:'2026-09-22',Status:'Pending',Update:'Spare part delivery to be confirmed.'},
      {id:uid(),Area:'Pulp Dryer',Action:'Inspect primary cleaner canisters',PIC:'Pulp dryer team',Due:'2026-09-28',Status:'Pending',Update:'Inspection sequence agreed.'},
      {id:uid(),Area:'Pulp Dryer',Action:'Verify reject-flow measurement and control valve',PIC:'Instrument team',Due:'2026-09-20',Status:'Done',Update:'Functional check completed.'},
      {id:uid(),Area:'Woodyard',Action:'Check bark carryover after debarking',PIC:'Quality team',Due:'',Status:'Pending',Update:'Continue weekly sampling.'}
    ];
    s.limits=SILICA_META.map(m=>({Sheet:'Silica',Parameter:m.key,Lower:null,'Upper / target':m.target,Rule:m.rule,'Secondary target':null,'Secondary target name':null}));return s;
  }

  function loadState(){try{const x=JSON.parse(localStorage.getItem(STORAGE_KEY));return x?.version===1?x:null}catch{return null}}
  function saveState(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch(e){console.warn('Could not save dashboard state',e)}}
  function countDailyRows(){return Object.values(state.daily).reduce((n,r)=>n+(r?.length||0),0)}

  function previousMonths(startDateStr,count){const d=parseDate(startDateStr);d.setUTCDate(1);const out=[];for(let i=count;i>=1;i--){const x=new Date(d);x.setUTCMonth(x.getUTCMonth()-i);out.push(`${x.getUTCFullYear()}-${String(x.getUTCMonth()+1).padStart(2,'0')}`)}return out}
  function dateRange(start,end){const a=parseDate(start),b=parseDate(end),out=[];for(let d=a;d<=b;d=addDays(d,1))out.push(iso(d));return out}
  function indexRows(rows){return Object.fromEntries((rows||[]).map(r=>[r.Date,r]))}
  function parseDate(s){const [y,m,d]=String(s).slice(0,10).split('-').map(Number);return new Date(Date.UTC(y,m-1,d||1))}
  function addDays(d,n){const x=new Date(d);x.setUTCDate(x.getUTCDate()+n);return x}
  function iso(d){return new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate())).toISOString().slice(0,10)}
  function formatShort(d){return new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(d)}
  function formatDay(d){return new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',timeZone:'UTC'}).format(d)}
  function formatMonth(d){return new Intl.DateTimeFormat('en-GB',{month:'short',year:'numeric',timeZone:'UTC'}).format(d)}
  function formatMonthShort(d){return new Intl.DateTimeFormat('en-GB',{month:'short',timeZone:'UTC'}).format(d)}
  function mean(a){const v=a.filter(Number.isFinite);return v.length?v.reduce((x,y)=>x+y,0)/v.length:NaN}
  function passes(v,t,rule){if(!Number.isFinite(v)||!Number.isFinite(t))return false;return rule==='<'?v<t:v<=t}
  function ruleSymbol(rule){return rule==='<'?'<' :'≤'}
  function fmt(v,d=1){const n=toNumber(v);return Number.isFinite(n)?n.toFixed(d).replace(/\.0+$/,''):'—'}
  function toNumber(v){if(v===null||v===undefined||v==='')return NaN;const n=Number(v);return Number.isFinite(n)?n:NaN}
  function blank(v){return v===null||v===undefined||String(v).trim()===''}
  function coerceValue(v){if(blank(v))return null;const n=Number(v);return Number.isFinite(n)?n:String(v).trim()}
  function round(v,d=1){const p=10**d;return Math.round(v*p)/p}
  function uid(){return 'a'+Math.random().toString(36).slice(2,10)+Date.now().toString(36)}
  function shortParam(k){return String(k).replace(/\s*\([^)]*\)\s*$/,'').replace(/^Silica\s*/i,'').replace(/^Chip screen \/ CTS bypass · /,'').replace(/^Screening operation · /,'').replace(/^OV reject · /,'').replace(/^Headbox pH · /,'')}
  function escapeHtml(s){return String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
  function escapeAttr(s){return escapeHtml(s).replace(/'/g,'&#39;')}
  function escapeSvg(s){return escapeHtml(s)}
})();
