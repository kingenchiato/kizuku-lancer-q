(() => {
  const header = document.getElementById("header");
  const onScroll = () => {
    if (header) header.classList.toggle("is-on", window.scrollY > 8);
  };

  const marks = document.querySelectorAll(".fade");
  const reveal = (el) => el.classList.add("is-on");

  marks.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) reveal(el);
  });

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -4% 0px" }
    );
    marks.forEach((el) => {
      if (!el.classList.contains("is-on")) io.observe(el);
    });
  } else {
    marks.forEach(reveal);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const menuBtn = document.querySelector(".menu-btn");
  const spnav = document.getElementById("spnav");
  if (header && menuBtn && spnav) {
    const setMenu = (open) => {
      header.classList.toggle("is-menu", open);
      document.documentElement.classList.toggle("is-menu-open", open);
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      menuBtn.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
    };
    menuBtn.addEventListener("click", () => setMenu(!header.classList.contains("is-menu")));
    spnav.addEventListener("click", (e) => {
      if (e.target === spnav || e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && header.classList.contains("is-menu")) {
        setMenu(false);
        menuBtn.focus();
      }
    });
    window.matchMedia("(min-width: 1101px)").addEventListener("change", (e) => {
      if (e.matches) setMenu(false);
    });
  }

  const slides = document.querySelectorAll(".hero__slides img");
  const dots = document.querySelectorAll(".hero__dot");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (slides.length > 1) {
    let index = 0;
    const show = (n) => {
      index = n;
      slides.forEach((img, i) => img.classList.toggle("is-on", i === n));
      dots.forEach((dot, i) => {
        dot.classList.toggle("is-on", i === n);
        dot.setAttribute("aria-selected", i === n ? "true" : "false");
      });
    };
    dots.forEach((dot, i) => dot.addEventListener("click", () => show(i)));
    if (!reduce) {
      window.setInterval(() => show((index + 1) % slides.length), 5200);
    }
  }

  const heroVideo = document.querySelector(".hero__video");
  const pauseBtn = document.querySelector(".hero__pause");
  if (heroVideo && pauseBtn) {
    if (reduce) heroVideo.pause();
    const syncPause = () => {
      const paused = heroVideo.paused;
      pauseBtn.classList.toggle("is-paused", paused);
      pauseBtn.setAttribute("aria-pressed", paused ? "true" : "false");
      pauseBtn.setAttribute("aria-label", paused ? "動画を再生" : "動画を一時停止");
    };
    pauseBtn.addEventListener("click", () => {
      if (heroVideo.paused) {
        const play = heroVideo.play();
        if (play) play.catch(() => {});
      } else {
        heroVideo.pause();
      }
      syncPause();
    });
    heroVideo.addEventListener("play", syncPause);
    heroVideo.addEventListener("pause", syncPause);
  }

  const heroPane = document.querySelector(".hero__pane");
  const hero = document.querySelector(".hero");
  const fitHero = () => {
    if (!hero || !heroPane) return;
    heroPane.style.zoom = "1";
    const needed = heroPane.offsetHeight;
    const avail = hero.clientHeight;
    if (!needed || !avail) return;
    const reserve = Math.min(76, Math.round(avail * 0.07));
    heroPane.style.zoom = String(Math.min(1, (avail - reserve) / needed));
  };
  fitHero();
  window.addEventListener("resize", fitHero);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitHero);

  document.querySelectorAll(".vslot__play").forEach((btn) => {
    btn.addEventListener("click", () => {
      const video = document.createElement("video");
      video.controls = true;
      video.playsInline = true;
      video.preload = "metadata";
      video.poster = btn.dataset.poster || "";
      video.src = btn.dataset.src;
      btn.replaceWith(video);
      const play = video.play();
      if (play && typeof play.catch === "function") play.catch(() => {});
    });
  });

  const playInline = (video) => {
    video.muted = true;
    video.playsInline = true;
    if (!video.paused) return;
    const play = video.play();
    if (play && typeof play.catch === "function") play.catch(() => {});
  };

  document.querySelectorAll(".overview-film__video").forEach((video) => {
    const show = () => video.classList.add("is-on");
    video.addEventListener("playing", show);
    video.addEventListener("timeupdate", () => {
      if (video.currentTime > 0.05) show();
    });
  });

  const inlineVideos = document.querySelectorAll(".vslot__video, .overview-film__video");
  inlineVideos.forEach((video) => {
    const maxTime = Number(video.dataset.maxTime);
    if (maxTime > 0) {
      video.addEventListener("timeupdate", () => {
        if (video.currentTime >= maxTime) video.currentTime = 0;
      });
    }
    playInline(video);
    video.addEventListener("canplay", () => playInline(video));
    video.addEventListener("loadeddata", () => playInline(video));
  });

  if ("IntersectionObserver" in window) {
    const videoIo = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) playInline(entry.target);
      });
    }, { threshold: 0.2 });
    inlineVideos.forEach((video) => videoIo.observe(video));
  }

  const form = document.getElementById("contact-form");
  if (form) {
    const done = document.getElementById("form-done");
    const err = document.getElementById("form-error");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const button = form.querySelector("[type=submit]");
      const data = {
        _subject: "【KIZUKU】お問い合わせ",
        _template: "table",
        _captcha: "false",
        _replyto: form.email.value.trim(),
        "貴社名・団体名": form.company.value.trim(),
        "お名前": form.name.value.trim(),
        "ふりがな": form.kana.value.trim(),
        "お問い合わせ項目": new FormData(form).get("お問い合わせ項目") || "",
        "電話番号": form.tel.value.trim(),
        "メールアドレス": form.email.value.trim(),
        "その他": form.other.value.trim()
      };
      if (form._honey && form._honey.value) return;
      button.disabled = true;
      err.hidden = true;
      try {
        const res = await fetch("https://formsubmit.co/ajax/kizuku@shouyou.co.jp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify(data)
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || json.success === false || json.success === "false") {
          throw new Error(json.message || "failed");
        }
        form.hidden = true;
        const lead = document.querySelector(".form-card__lead");
        const back = document.querySelector(".form-back");
        if (lead) lead.hidden = true;
        if (back) back.hidden = true;
        done.hidden = false;
        done.scrollIntoView({ behavior: "smooth", block: "center" });
      } catch (error) {
        err.hidden = false;
        button.disabled = false;
      }
    });
  }
})();
