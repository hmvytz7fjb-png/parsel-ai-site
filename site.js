// PARSEL AI · sayfa betiği: menü, slayt ve başvuru formu.
(function () {
  // Başvurular FormSubmit üzerinden bu adrese e-postayla iletilir.
  // İlk başvurudan sonra gelen "Activate Form" e-postası bir kez onaylanmalıdır.
  var FORM_ENDPOINT = "https://formsubmit.co/ajax/yusufsezer2019@gmail.com";

  var nav = document.getElementById("nav");
  var menuBtn = document.getElementById("menu-btn");
  var menuLabel = document.getElementById("menu-label");
  function setMenu(open) {
    nav.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuLabel.textContent = open ? "Menüyü kapat" : "Menüyü aç";
  }
  menuBtn.addEventListener("click", function () { setMenu(!nav.classList.contains("open")); });
  document.querySelectorAll("#nav-links a").forEach(function (a) {
    a.addEventListener("click", function () { setMenu(false); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("open")) {
      setMenu(false);
      menuBtn.focus();
    }
  });

  // Sayfadaki butonlar formda ilgili konuyu seçer (ör. Pro paketi → "Pro abonelik").
  document.querySelectorAll("[data-topic]").forEach(function (a) {
    a.addEventListener("click", function () {
      var radio = document.getElementById("f-konu-" + a.dataset.topic);
      if (radio) radio.checked = true;
    });
  });

  var form = document.getElementById("apply-form");
  var status = document.getElementById("form-status");
  var submitBtn = document.getElementById("f-submit");
  var submitLabel = submitBtn.innerHTML;
  function setStatus(text, kind) {
    status.textContent = text;
    status.className = "status show " + kind;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (form.elements.website.value) return; // spam tuzağı: gerçek kullanıcı bu alanı görmez
    if (!form.checkValidity()) {
      form.reportValidity();
      setStatus("Ad soyad, geçerli bir e-posta ve rol alanlarını doldurun.", "err");
      return;
    }
    if (!FORM_ENDPOINT) {
      setStatus("Form henüz bir sunucuya bağlı değil, bu yüzden başvurunuz iletilmedi.", "warn");
      return;
    }
    submitBtn.disabled = true;
    submitBtn.textContent = "Gönderiliyor…";
    fetch(FORM_ENDPOINT, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        // FormSubmit, form henüz onaylanmamışken de 200 döner; asıl sonuç "success" alanında.
        if (String(data.success) !== "true") throw new Error(data.message);
        form.reset();
        setStatus("Başvurunuz alındı. En kısa sürede size dönüş yapacağız.", "ok");
      })
      .catch(function () {
        setStatus("Başvuru gönderilemedi. Bağlantınızı kontrol edip tekrar deneyin.", "err");
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.innerHTML = submitLabel;
      });
  });

  // Ankara slaytı
  var slider = document.getElementById("slider");
  if (slider) {
    var slidesEl = document.getElementById("slides");
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".slide"));
    var thumbs = Array.prototype.slice.call(slider.querySelectorAll(".thumb"));
    var cur = document.getElementById("sl-cur");
    var bar = document.getElementById("sl-bar");
    var playBtn = document.getElementById("sl-play");
    var DURATION = 6000;
    var idx = 0, timer = null, started = 0, remaining = DURATION, hoverPaused = false;
    // Hareket azaltma tercihi olanlarda otomatik geçiş kapalı başlar; düğmeyle açılabilir.
    var userPaused = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var playing = function () { return !userPaused && !hoverPaused; };
    var tick = function () { timer = null; show(idx + 1); };

    function sync() {
      var on = playing();
      slider.classList.toggle("is-paused", !on);
      playBtn.classList.toggle("is-paused", userPaused);
      playBtn.setAttribute("aria-label", userPaused ? "Otomatik geçişi başlat" : "Otomatik geçişi durdur");
      if (on && !timer) {
        started = Date.now();
        timer = setTimeout(tick, Math.max(remaining, 0));
      } else if (!on && timer) {
        clearTimeout(timer);
        timer = null;
        remaining -= Date.now() - started;
      }
    }

    function show(n) {
      idx = (n + slides.length) % slides.length;
      slides.forEach(function (s, i) {
        s.classList.toggle("is-active", i === idx);
        s.setAttribute("aria-hidden", String(i !== idx));
      });
      thumbs.forEach(function (t, i) { t.setAttribute("aria-current", String(i === idx)); });
      cur.textContent = String(idx + 1).padStart(2, "0");
      clearTimeout(timer);
      timer = null;
      remaining = DURATION;
      bar.classList.remove("run");
      void bar.offsetWidth; // ilerleme çubuğunu baştan başlat
      bar.classList.add("run");
      sync();
    }

    document.getElementById("sl-prev").addEventListener("click", function () { show(idx - 1); });
    document.getElementById("sl-next").addEventListener("click", function () { show(idx + 1); });
    playBtn.addEventListener("click", function () { userPaused = !userPaused; sync(); });
    thumbs.forEach(function (t, i) { t.addEventListener("click", function () { show(i); }); });

    slider.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") { hoverPaused = true; sync(); } });
    slider.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") { hoverPaused = false; sync(); } });
    // Klavyeyle slayta girilince otomatik geçiş durur ve yalnızca düğmeyle yeniden başlar.
    slider.addEventListener("focusin", function (e) {
      if (e.target.matches(":focus-visible") && e.target !== playBtn) { userPaused = true; sync(); }
    });
    slider.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); show(idx + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); show(idx - 1); }
    });

    var x0 = null;
    slidesEl.addEventListener("pointerdown", function (e) { x0 = e.clientX; });
    slidesEl.addEventListener("pointercancel", function () { x0 = null; });
    slidesEl.addEventListener("pointerup", function (e) {
      if (x0 === null) return;
      var dx = e.clientX - x0;
      x0 = null;
      if (Math.abs(dx) > 40) show(idx + (dx < 0 ? 1 : -1));
    });

    show(0);
  }

  // Menüde ekranın ortasındaki bölümü işaretler; menüde karşılığı olmayan bölümlerde işaret kalkar.
  if ("IntersectionObserver" in window) {
    var navLinks = Array.prototype.slice.call(document.querySelectorAll('#nav-links a[href^="#"]'));
    var linkFor = {};
    navLinks.forEach(function (a) { linkFor[a.getAttribute("href").slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) { a.removeAttribute("aria-current"); });
        var link = linkFor[entry.target.id];
        if (link) link.setAttribute("aria-current", "true");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll("main section[id]").forEach(function (s) { spy.observe(s); });
  }

  document.getElementById("year").textContent = new Date().getFullYear();
})();
