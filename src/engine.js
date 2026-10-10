/* TakeHomePayPro calculator engine (same maths as https://takehomepaypro.co.uk). Tax years 2023/24 to 2026/27. */
"use strict";
var TY={
  '2324':{pa:12570,blind:2870,marriage:1260,be:[{f:0,t:12570,r:0},{f:12570,t:50270,r:.20},{f:50270,t:125140,r:.40},{f:125140,t:1e9,r:.45}],bs:[{f:0,t:12570,r:0},{f:12570,t:14732,r:.19},{f:14732,t:25688,r:.20},{f:25688,t:43662,r:.21},{f:43662,t:125140,r:.42},{f:125140,t:1e9,r:.47}],np:12570,nu:50270,nr:.115,nu2:.02,ln:{plan1:22015,plan2:27295,plan4:27660,plan5:25000,postgrad:21000},lr:{plan1:.09,plan2:.09,plan4:.09,plan5:.09,postgrad:.06},al:6240,au:50270},
  '2425':{pa:12570,blind:3070,marriage:1260,be:[{f:0,t:12570,r:0},{f:12570,t:50270,r:.20},{f:50270,t:125140,r:.40},{f:125140,t:1e9,r:.45}],bs:[{f:0,t:12570,r:0},{f:12570,t:14876,r:.19},{f:14876,t:26561,r:.20},{f:26561,t:43662,r:.21},{f:43662,t:75000,r:.42},{f:75000,t:125140,r:.45},{f:125140,t:1e9,r:.48}],np:12570,nu:50270,nr:.08,nu2:.02,ln:{plan1:24990,plan2:27295,plan4:31395,plan5:25000,postgrad:21000},lr:{plan1:.09,plan2:.09,plan4:.09,plan5:.09,postgrad:.06},al:6240,au:50270},
  '2526':{pa:12570,blind:3130,marriage:1260,be:[{f:0,t:12570,r:0},{f:12570,t:50270,r:.20},{f:50270,t:125140,r:.40},{f:125140,t:1e9,r:.45}],bs:[{f:0,t:12570,r:0},{f:12570,t:15397,r:.19},{f:15397,t:27491,r:.20},{f:27491,t:43662,r:.21},{f:43662,t:75000,r:.42},{f:75000,t:125140,r:.45},{f:125140,t:1e9,r:.48}],np:12570,nu:50270,nr:.08,nu2:.02,ln:{plan1:26065,plan2:28470,plan4:32745,plan5:25000,postgrad:21000},lr:{plan1:.09,plan2:.09,plan4:.09,plan5:.09,postgrad:.06},al:6240,au:50270},
  '2627':{pa:12570,blind:3250,marriage:1260,be:[{f:0,t:12570,r:0},{f:12570,t:50270,r:.20},{f:50270,t:125140,r:.40},{f:125140,t:1e9,r:.45}],bs:[{f:0,t:12570,r:0},{f:12570,t:16537,r:.19},{f:16537,t:29526,r:.20},{f:29526,t:43662,r:.21},{f:43662,t:75000,r:.42},{f:75000,t:125140,r:.45},{f:125140,t:1e9,r:.48}],np:12570,nu:50270,nr:.08,nu2:.02,ln:{plan1:26900,plan2:29385,plan4:33795,plan5:25000,postgrad:21000},lr:{plan1:.09,plan2:.09,plan4:.09,plan5:.09,postgrad:.06},al:6240,au:50270}
};

function pCode(code,yr,reg){
  var y=TY[yr],c=(code||'').toUpperCase().replace(/\s+/g,'');
  c=c.replace(/(W1|M1|X)$/,'').replace(/^[SC](?=\d|BR|D\d|K|NT|0T)/,'');
  if(c==='NT')return{pa:1e12,flat:null};
  var sc=reg==='scotland';
  var flat={BR:.20,D0:sc?.21:.40,D1:sc?.42:.45,D2:sc?.45:null,D3:sc?.48:null};
  if(Object.prototype.hasOwnProperty.call(flat,c)?flat[c]!==null:false)return{pa:0,flat:flat[c]};
  var k=c.match(/^K(\d+)$/);if(k)return{pa:-parseInt(k[1],10)*10,flat:null};
  var m=c.match(/^(\d+)[A-Z]$/);if(m)return{pa:parseInt(m[1],10)*10,flat:null};
  return{pa:y.pa,flat:null};
}

function cTax(g,pa,reg,yr,flat){
  if(flat!=null){var ft=Math.max(g,0)*flat;return{tax:ft,tx:Math.max(g,0),adjPA:0,bands:ft>0?[{r:flat,amt:ft}]:[]};}
  /* PA taper: £1 lost for every £2 above £100,000 (positive allowances only) */
  var adjPA=pa;
  if(pa>0?g>100000:false){adjPA=Math.max(pa-Math.floor((g-100000)/2),0);}
  var taxable=Math.max(g-adjPA,0);
  if(taxable<=0)return{tax:0,tx:0,adjPA:adjPA,bands:[]};
  var tax=0,bands=[],list;
  /* Bands for the chosen tax year, turned into taxable-income widths.
     Thresholds below 125,140 sit on top of the 12,570 allowance; the top band
     starts at 125,140 of taxable income, where the allowance is fully tapered. */
  var src=(reg==='scotland')?TY[yr].bs:TY[yr].be;
  list=[];
  for(var j=0;j<src.length;j++){
    var sb=src[j];if(sb.r===0)continue;
    var f=sb.f>=125140?sb.f:sb.f-12570, t=sb.t>=125140?sb.t:sb.t-12570;
    list.push({from:f,to:t,r:sb.r});
  }
  for(var i=0;i<list.length;i++){var b=list[i];if(taxable<=b.from)break;var sl=Math.min(taxable,b.to)-b.from;if(sl>0){tax+=sl*b.r;bands.push({r:b.r,amt:sl*b.r});}}
  return{tax:tax,tx:taxable,adjPA:adjPA,bands:bands};
}
function cNI(g,yr,noNI){if(noNI)return 0;var y=TY[yr];if(g<=y.np)return 0;var ni=(Math.min(g,y.nu)-y.np)*y.nr;if(g>y.nu)ni+=(g-y.nu)*y.nu2;return Math.max(ni,0);}
/* Student loan: on earnings for NI purposes, rounded down to whole pounds per monthly payslip like PAYE does */
function cLoan(g,plan,yr){var y=TY[yr],t=y.ln[plan]||y.ln.plan2,r=y.lr[plan]||.09;if(g<=t)return 0;return Math.floor((g-t)*r/12)*12;}
function cPen(g,type,pct,yr){var y=TY[yr];if(type==='auto')return Math.max(Math.min(g,y.au)-y.al,0)*(pct/100);return g*(pct/100);}

function compute(o){
  var yr=o.yr,y=TY[yr];
  var code=pCode(o.taxCode,yr,o.reg),pa=code.pa;
  if(code.flat==null?pa<1e11:false){if(o.blind)pa+=y.blind;if(o.marriage)pa+=y.marriage;}
  var g=o.g;
  var penAmt=o.penOn?cPen(g,o.penType,o.penPct,yr):0;
  var ccAmt=o.ccOn?o.ccVal*12:0;
  var isSac=o.penOn?o.penType==='sacrifice':false;
  var isNetPay=o.penOn?o.penType==='gross':false;
  var isRAS=o.penOn?(o.penType==='auto'||o.penType==='personal'):false;
  var sacT=(isSac?penAmt:0)+ccAmt;               /* reduces tax, NI and student loan */
  var niable=g-sacT;                             /* earnings for NI and student loan */
  var preTax=o.dPre*12;                          /* payroll giving: reduces tax only */
  var netPayPen=isNetPay?penAmt:0;               /* net pay arrangement: reduces tax only */
  var rasPaid=isRAS?penAmt*0.8:0;                /* relief at source: you pay 80%, provider claims 20% basic relief */
  var taxBase=niable-preTax-netPayPen;
  var tr=cTax(taxBase,pa,o.reg,yr,code.flat);
  var ni=cNI(niable,yr,o.noNI);
  var loan=o.loanOn?cLoan(niable,o.loanPlan,yr):0;
  var postTax=o.dPost*12;
  var penOut=sacT+netPayPen+rasPaid;
  var net=g-tr.tax-ni-penOut-preTax-loan-postTax;
  var empNI=Math.max(niable-5000,0)*0.15;
  /* Marginal rate measured directly (+£100), so it reflects the £100k taper and every threshold */
  var tr2=cTax(taxBase+100,pa,o.reg,yr,code.flat),ni2=cNI(niable+100,yr,o.noNI);
  var marginal=Math.round(((tr2.tax-tr.tax)+(ni2-ni)))+'%';
  return{g:g,tax:tr.tax,ni:ni,loan:loan,pen:penOut,penAmt:penAmt,ccAmt:ccAmt,preTax:preTax,postTax:postTax,net:net,empNI:empNI,adjPA:tr.adjPA,tv:tr.tx,bands:tr.bands,marginal:marginal,eff:g>0?(tr.tax+ni)/g*100:0};
}
