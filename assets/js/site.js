/* Site behaviour: navigation, hero video with scene fallback, contact form. */
(function () {
  "use strict";

  /* ===== Settings to edit ===== */
  var CONTACT_EMAIL = "bhavya.bv.mishra@gmail.com"; 
  // To send messages without opening the visitor's email app, create a free form at
  // formspree.io, then paste its endpoint here, e.g. "https://formspree.io/f/xxxxxxx".
  var FORM_ENDPOINT = "";
  /* ============================ */

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Navigation: solid bar after scrolling, menu toggle on small screens */
  var nav = document.querySelector(".nav");
  function onScroll() { if (nav) nav.classList.toggle("is-solid", window.scrollY > 40); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var toggle = document.querySelector(".nav-toggle"), links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") { links.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); }
    });
  }

  /* Hero video: when it plays, hide the scene underneath; when the file is missing, keep the scene */
  Array.prototype.forEach.call(document.querySelectorAll(".media"), function (media) {
    var video = media.querySelector("video"), canvas = media.querySelector("canvas");
    if (!video) return;
    var source = video.querySelector("source");
    function showScene() { media.classList.remove("is-playing"); if (canvas) canvas.setAttribute("data-paused", "0"); video.style.display = "none"; }
    video.addEventListener("playing", function () {
      media.classList.add("is-playing");
      if (canvas) canvas.setAttribute("data-paused", "1");
    });
    video.addEventListener("error", showScene);
    if (source) source.addEventListener("error", showScene);
    if (reduce) { video.removeAttribute("autoplay"); video.pause(); }
  });

  /* Contact form */
  var form = document.getElementById("contact-form");
  if (form) {
    var status = form.querySelector(".status");
    function say(text, isError) { status.textContent = text; status.classList.toggle("is-error", !!isError); }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new FormData(form);
      if (data.get("company")) return; // honeypot field: real visitors leave it empty
      var name = (data.get("name") || "").toString().trim();
      var email = (data.get("email") || "").toString().trim();
      var message = (data.get("message") || "").toString().trim();
      if (!name || !email || !message) { say("Fill in your name, email and message, then send again.", true); return; }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { say("Check your email address. It should look like name@example.com.", true); return; }

      if (FORM_ENDPOINT) {
        say("Sending…");
        fetch(FORM_ENDPOINT, { method: "POST", body: data, headers: { Accept: "application/json" } })
          .then(function (res) {
            if (res.ok) { form.reset(); say("Message sent. I will reply by email."); }
            else throw new Error("bad status");
          })
          .catch(function () { say("The message did not send. Try again, or email " + CONTACT_EMAIL + " directly.", true); });
      } else {
        var subject = encodeURIComponent("Message from " + name + " via your portfolio");
        var body = encodeURIComponent(message + "\n\nFrom: " + name + " <" + email + ">");
        window.location.href = "mailto:" + CONTACT_EMAIL + "?subject=" + subject + "&body=" + body;
        say("Your email app should open with the message ready to send.");
      }
    });
  }

  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
