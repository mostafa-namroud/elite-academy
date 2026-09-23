/* ==========================================================================
   الربط العام: ظل الهيدر، تعبئة القيم المشتركة، اختيار الصف، أزرار النسخ
   ========================================================================== */

(function () {
  "use strict";

  var S = window.SITE;

  /* ------------------------------------------------------------------
     ظل الهيدر بعد التمرير
     ------------------------------------------------------------------ */
  var header = document.querySelector(".header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  document.addEventListener("DOMContentLoaded", function () {

    /* ----------------------------------------------------------------
       تعبئة النصوص المشتركة من js/content.js
       ---------------------------------------------------------------- */
    document.querySelectorAll("[data-site]").forEach(function (el) {
      var value = el.getAttribute("data-site").split(".").reduce(function (o, k) {
        return o && o[k];
      }, S);
      if (value) el.textContent = value;
    });

    document.querySelectorAll("[data-tel]").forEach(function (el) {
      el.href = "tel:" + S.phoneDial;
    });

    /* ----------------------------------------------------------------
       روابط التواصل الاجتماعي: تُملأ من content.js عند توفرها
       ---------------------------------------------------------------- */
    document.querySelectorAll("[data-social]").forEach(function (el) {
      var url = S.social[el.getAttribute("data-social")];
      if (url) {
        el.href = url;
        el.target = "_blank";
        el.rel = "noopener";
        el.removeAttribute("aria-disabled");
      }
    });

    /* ----------------------------------------------------------------
       اختيار الصف من قسم «الصفوف والمراحل» يملأ الاستمارة مباشرة
       ---------------------------------------------------------------- */
    var gradeSelect = document.getElementById("grade");

    document.querySelectorAll("[data-grade]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var grade = btn.getAttribute("data-grade");
        var target = document.getElementById("registration");

        if (gradeSelect) {
          gradeSelect.value = grade;
          gradeSelect.dispatchEvent(new Event("change", { bubbles: true }));
        }
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    /* ----------------------------------------------------------------
       أزرار النسخ العامة (العنوان، رقم الهاتف)
       ---------------------------------------------------------------- */
    document.querySelectorAll("[data-copy]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var source = document.querySelector(btn.getAttribute("data-copy"));
        if (!source) return;
        var text = source.textContent.trim();

        var fallback = function () {
          var area = document.createElement("textarea");
          area.value = text;
          area.setAttribute("readonly", "");
          area.style.position = "fixed";
          area.style.opacity = "0";
          document.body.appendChild(area);
          area.select();
          try { document.execCommand("copy"); } catch (err) { /* لا شيء */ }
          document.body.removeChild(area);
        };

        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(text).catch(fallback);
        } else {
          fallback();
        }

        var original = btn.getAttribute("data-copy-label") || btn.textContent.trim();
        btn.setAttribute("data-copy-label", original);
        btn.textContent = "تم النسخ";
        setTimeout(function () { btn.textContent = original; }, 2000);
      });
    });
  });
})();
