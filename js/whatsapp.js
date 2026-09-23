/* ==========================================================================
   بناء روابط واتساب: لا يتم حفظ أي بيانات، الرسالة تُبنى في متصفح الزائر فقط
   ========================================================================== */

(function () {
  "use strict";

  var S = window.SITE;

  /** يبني رابط wa.me مع نص مُرمّز */
  function waLink(message) {
    var base = "https://wa.me/" + S.whatsappNumber;
    return message ? base + "?text=" + encodeURIComponent(message): base;
  }

  window.WA = {
    link: waLink,

    /** رابط الاستفسار السريع */
    quick: function () {
      return waLink(S.quickMessage);
    },

    /** رابط استفسار عن صف محدد */
    grade: function (grade) {
      return waLink("مرحباً، أرغب بالاستفسار عن دروس " + grade + " في مركز النخبة.");
    }
  };

  /* كل رابط يحمل data-wa يحصل على رسالته تلقائياً:
     data-wa            → رسالة الاستفسار السريع
     data-wa="brevet"   → رسالة الدورة المجانية للبريفيه
     data-wa="offer"    → رسالة عرض الخصم
     data-wa-grade="..."→ رسالة خاصة بصف محدد                                   */
  document.addEventListener("DOMContentLoaded", function () {
    var named = {
      brevet: S.brevetMessage,
      offer: S.offerMessage
    };

    document.querySelectorAll("[data-wa]").forEach(function (el) {
      var grade = el.getAttribute("data-wa-grade");
      var kind = el.getAttribute("data-wa");

      if (grade) {
        el.href = window.WA.grade(grade);
      } else if (kind && named[kind]) {
        el.href = waLink(named[kind]);
      } else {
        el.href = window.WA.quick();
      }

      el.target = "_blank";
      el.rel = "noopener";
    });
  });
})();
