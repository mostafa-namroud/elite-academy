/* ==========================================================================
   إظهار العناصر عند التمرير — مرة واحدة لكل عنصر، ويُعطّل عند تفضيل تقليل الحركة
   ========================================================================== */

(function () {
  "use strict";

  var els = document.querySelectorAll("[data-reveal]");
  if (!els.length) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* بلا IntersectionObserver أو عند تقليل الحركة: أظهر كل شيء فوراً */
  if (reduced || !("IntersectionObserver" in window)) {
    els.forEach(function (el) { el.classList.add("is-visible"); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      io.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });

  els.forEach(function (el, i) {
    /* تأخير متدرّج داخل كل مجموعة */
    var step = parseInt(el.getAttribute("data-reveal-step") || "0", 10);
    if (step) el.style.setProperty("--reveal-delay", (step * 90) + "ms");
    io.observe(el);
  });
})();
