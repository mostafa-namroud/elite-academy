/* ==========================================================================
   استمارة التسجيل
   لا يتم حفظ أي معلومات ولا إرسالها إلى أي خادم.
   الرسالة تُبنى داخل متصفح الزائر ثم تُسلَّم إلى تطبيق واتساب لديه.
   ========================================================================== */

(function () {
  "use strict";

  var form = document.getElementById("registration-form");
  if (!form) return;

  var done = document.getElementById("form-done");
  var preview = document.getElementById("form-preview");
  var sendLink = document.getElementById("form-send");
  var copyBtn = document.getElementById("form-copy");
  var copyState = document.getElementById("copy-state");
  var trimNote = document.getElementById("form-trim");

  /* ترتيب الحقول في الرسالة — نفس ترتيب الاستمارة */
  var FIELDS = [
    { name: "student",  label: "اسم الطالب" },
    { name: "guardian", label: "اسم ولي الأمر" },
    { name: "school",   label: "المدرسة الحالية" },
    { name: "grade",    label: "الصف / المرحلة" },
    { name: "phone",    label: "رقم الهاتف" },
    { name: "address",  label: "العنوان الكامل" },
    { name: "health",   label: "حالات صحية أو حساسية", optional: true },
    { name: "needs",    label: "صعوبات تعلم أو احتياجات خاصة", optional: true }
  ];

  /* ------------------------------------------------------------------
     تعبئة قائمة الصفوف من ملف المحتوى
     ------------------------------------------------------------------ */
  var gradeSelect = form.elements.grade;
  if (gradeSelect && window.SITE && window.SITE.grades) {
    window.SITE.grades.forEach(function (grade) {
      var opt = document.createElement("option");
      opt.value = grade;
      opt.textContent = grade;
      gradeSelect.appendChild(opt);
    });
  }

  /* ------------------------------------------------------------------
     عدّاد الأحرف للحقلين الاختياريين
     ------------------------------------------------------------------ */
  form.querySelectorAll("textarea[maxlength]").forEach(function (area) {
    var counter = form.querySelector('[data-count-for="' + area.id + '"]');
    if (!counter) return;
    var max = area.getAttribute("maxlength");
    var update = function () {
      counter.textContent = area.value.length + " / " + max;
    };
    area.addEventListener("input", update);
    update();
  });

  /* ------------------------------------------------------------------
     التحقق — رسائل عربية بدل رسائل المتصفح الإنكليزية
     ------------------------------------------------------------------ */
  function fieldWrap(el) {
    return el.closest(".field");
  }

  function showError(el) {
    var wrap = fieldWrap(el);
    if (wrap) wrap.classList.add("is-invalid");
  }

  function clearError(el) {
    var wrap = fieldWrap(el);
    if (wrap) wrap.classList.remove("is-invalid");
  }

  function validate(el) {
    if (!el.hasAttribute("required")) return true;
    var ok = el.value.trim().length > 0;
    /* رقم الهاتف: 7 أرقام على الأقل بعد تجاهل المسافات والرموز */
    if (ok && el.type === "tel") {
      ok = el.value.replace(/[^0-9]/g, "").length >= 7;
    }
    if (ok) { clearError(el); } else { showError(el); }
    return ok;
  }

  form.querySelectorAll("[required]").forEach(function (el) {
    el.addEventListener("blur", function () { validate(el); });
    el.addEventListener("input", function () {
      if (fieldWrap(el) && fieldWrap(el).classList.contains("is-invalid")) validate(el);
    });
  });

  /* ------------------------------------------------------------------
     بناء نص الرسالة

     cap: حد أقصى اختياري لطول الإجابات الاختيارية، يُستخدم فقط إذا تجاوز
     رابط واتساب الطول الآمن — انظر buildLink بالأسفل.
     ------------------------------------------------------------------ */
  function buildMessage(cap) {
    var lines = ["السلام عليكم، أرغب بتسجيل طالب في مركز النخبة.", ""];
    var n = 0;

    FIELDS.forEach(function (field) {
      var el = form.elements[field.name];
      var value = el ? el.value.trim() : "";
      /* الحقول الاختيارية الفارغة لا تُرسل أصلاً */
      if (!value && field.optional) return;
      if (cap && field.optional && value.length > cap) {
        value = value.slice(0, cap) + "…";
      }
      n += 1;
      lines.push(n + ". " + field.label + ": " + value);
    });

    lines.push("", "أُرسلت عبر موقع مركز النخبة");
    return lines.join("\n");
  }

  /* ------------------------------------------------------------------
     رابط واتساب بطول آمن

     الحرف العربي الواحد يصبح 6 أحرف بعد ترميز الرابط، فإجابتان طويلتان
     قد تنتجان رابطاً يتجاوز ما تتحمّله بعض الهواتف فيُقتطع النص بصمت.
     هنا نقصّر الإجابات الاختيارية للرابط فقط — النص الكامل يبقى معروضاً
     وقابلاً للنسخ، مع تنبيه للزائر.
     ------------------------------------------------------------------ */
  var MAX_URL = 3000;

  function buildLink(fullMessage) {
    var url = window.WA.link(fullMessage);
    if (url.length <= MAX_URL) return { url: url, trimmed: false };

    var cap = 300;
    var message = fullMessage;
    while (url.length > MAX_URL && cap > 40) {
      cap -= 20;
      message = buildMessage(cap);
      url = window.WA.link(message);
    }
    return { url: url, trimmed: true };
  }

  /* ------------------------------------------------------------------
     الإرسال
     ------------------------------------------------------------------ */
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var firstInvalid = null;
    form.querySelectorAll("[required]").forEach(function (el) {
      if (!validate(el) && !firstInvalid) firstInvalid = el;
    });

    if (firstInvalid) {
      firstInvalid.focus();
      firstInvalid.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }

    var message = buildMessage();
    var link = buildLink(message);

    /* المعاينة تعرض دائماً النص الكامل غير المقتطع، وهو ما يُنسخ */
    preview.textContent = message;
    sendLink.href = link.url;
    if (trimNote) trimNote.hidden = !link.trimmed;
    if (copyState) copyState.textContent = "";

    form.hidden = true;
    done.classList.add("is-open");
    done.scrollIntoView({ block: "center", behavior: "smooth" });

    /* يفتح واتساب مباشرة؛ إن منعه المتصفح تبقى الأزرار متاحة بالأسفل */
    window.open(link.url, "_blank", "noopener");
  });

  /* ------------------------------------------------------------------
     نسخ الرسالة — بديل لمن لا يملك واتساب على الكمبيوتر
     ------------------------------------------------------------------ */
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var text = preview.textContent;

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

      if (copyState) {
        copyState.textContent = "تم نسخ الرسالة";
        setTimeout(function () { copyState.textContent = ""; }, 3000);
      }
    });
  }
})();
