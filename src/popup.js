/* Popup logic. All maths comes from engine.js (the same engine as takehomepaypro.co.uk). No data leaves the browser. */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var SITE = "https://takehomepaypro.co.uk/";
  var FIELDS = ["salary", "period", "hours", "region", "year", "loan", "code", "penpct", "pentype"];

  function money(n, dp) {
    return "£" + Math.abs(n).toLocaleString("en-GB", { minimumFractionDigits: dp, maximumFractionDigits: dp });
  }

  function restore() {
    try {
      var saved = JSON.parse(localStorage.getItem("thp-popup") || "{}");
      FIELDS.forEach(function (k) { if (saved[k] !== undefined) $(k).value = saved[k]; });
    } catch (e) { /* storage unavailable: keep defaults */ }
  }

  function remember() {
    try {
      var o = {};
      FIELDS.forEach(function (k) { o[k] = $(k).value; });
      localStorage.setItem("thp-popup", JSON.stringify(o));
    } catch (e) { /* ignore */ }
  }

  function grossYear() {
    var raw = parseFloat($("salary").value) || 0;
    var p = $("period").value;
    if (p === "monthly") return raw * 12;
    if (p === "weekly") return raw * 52;
    if (p === "hourly") return raw * (parseFloat($("hours").value) || 37.5) * 52;
    return raw;
  }

  function calc() {
    $("hours-wrap").hidden = $("period").value !== "hourly";
    var g = Math.max(0, grossYear());
    var pct = Math.max(0, parseFloat($("penpct").value) || 0);
    var loan = $("loan").value;
    var r = compute({
      yr: $("year").value, reg: $("region").value, taxCode: $("code").value || "1257L", g: g,
      penOn: pct > 0, penType: $("pentype").value, penPct: pct,
      loanOn: loan !== "", loanPlan: loan || "plan2",
      noNI: false, blind: false, marriage: false, ccOn: false, ccVal: 0, dPre: 0, dPost: 0
    });

    $("r-month").textContent = money(r.net / 12, 2);
    $("r-year").textContent = money(r.net, 2);
    $("r-week").textContent = money(r.net / 52, 2);
    $("b-gross").textContent = money(g, 2);
    $("b-tax").textContent = "−" + money(r.tax, 2);
    $("b-ni").textContent = "−" + money(r.ni, 2);
    $("row-loan").hidden = !(r.loan > 0);
    $("b-loan").textContent = "−" + money(r.loan, 2);
    $("row-pen").hidden = !(r.pen > 0);
    $("b-pen").textContent = "−" + money(r.pen, 2);
    $("b-net").textContent = money(r.net, 2);

    var m = parseInt(r.marginal, 10);
    var lr = 0;
    if (r.loan > 0) lr = loan === "postgrad" ? 6 : 9;
    $("marginal").textContent = g > 0
      ? "On your next £1 of pay, " + (m + lr) + "p goes in " + (lr ? "Income Tax, NI and student loan" : "Income Tax and NI") + ", so you keep " + (100 - m - lr) + "p."
      : "";

    var q = "?salary=" + encodeURIComponent(Math.round(parseFloat($("salary").value) || 0)) +
      "&period=" + encodeURIComponent($("period").value) +
      "&region=" + encodeURIComponent($("region").value) +
      ($("period").value === "hourly" ? "&hours=" + encodeURIComponent($("hours").value) : "") +
      (loan ? "&loan=" + encodeURIComponent(loan) : "") +
      "&utm_source=extension&utm_medium=popup";
    if ($("period").value === "hourly") q = q.replace(/salary=\d+/, "salary=" + encodeURIComponent($("salary").value));
    $("full").href = SITE + q + "#calculate-your-take-home-pay-after-tax";
    remember();
  }

  restore();
  FIELDS.forEach(function (k) {
    $(k).addEventListener("input", calc);
    $(k).addEventListener("change", calc);
  });
  $("f").addEventListener("submit", function (e) { e.preventDefault(); });
  calc();
})();
