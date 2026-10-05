/* ==========================================================
   Sarah Khalil — CV Webpage Interactivity (Assignment 2)

   Features:
     Option 1 — Contact form with validation
     Option 2 — Show / hide sections
     Option 3 — Dark mode / light mode toggle
     Option 5 — Welcome message on page load
   ========================================================== */

/* ----------------------------------------------------------
   Option 3 (part 1): apply the saved theme right away.
   This runs before the <body> is drawn, so the page never
   flashes pink-light before switching to dark.
   ---------------------------------------------------------- */
const THEME_KEY = "sarah-cv-theme";

function getSavedTheme() {
  // localStorage can be blocked (e.g. private windows), so guard it
  try {
    return localStorage.getItem(THEME_KEY);
  } catch (error) {
    return null;
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (error) {
    // Not saved — the toggle still works for this visit
  }
}

document.documentElement.setAttribute("data-theme", getSavedTheme() === "dark" ? "dark" : "light");

/* ----------------------------------------------------------
   Everything below needs the page's elements to exist,
   so it waits until the HTML has finished loading.
   ---------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", function () {
  setupThemeToggle();
  setupSectionToggles();
  setupContactForm();
  showWelcomeMessage();
});

/* ==========================================================
   Option 3 (part 2): Dark / Light mode toggle button
   ========================================================== */
function setupThemeToggle() {
  const button = document.getElementById("theme-toggle");
  const icon = button.querySelector(".theme-icon");
  const label = button.querySelector(".theme-label");

  // Update the button so it always describes the mode you will switch TO
  function updateButton(theme) {
    const isDark = theme === "dark";
    icon.textContent = isDark ? "☀️" : "🌙";
    label.textContent = isDark ? "Light mode" : "Dark mode";
    button.setAttribute("aria-pressed", String(isDark));
  }

  updateButton(document.documentElement.getAttribute("data-theme"));

  button.addEventListener("click", function () {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", next);
    saveTheme(next);
    updateButton(next);
  });
}

/* ==========================================================
   Option 2: Show / Hide sections
   Each .toggle-btn controls the element named in its
   aria-controls attribute (Experience, Skills, Certifications,
   Activities).
   ========================================================== */
function setupSectionToggles() {
  const buttons = document.querySelectorAll(".toggle-btn");

  buttons.forEach(function (button) {
    const body = document.getElementById(button.getAttribute("aria-controls"));
    const sectionName = button.dataset.label;

    button.addEventListener("click", function () {
      const isOpen = button.getAttribute("aria-expanded") === "true";

      // Flip the state: hide the content if it was open, show it if it was closed
      body.hidden = isOpen;
      button.setAttribute("aria-expanded", String(!isOpen));
      button.textContent = (isOpen ? "Show " : "Hide ") + sectionName;
      button.closest(".collapsible").classList.toggle("is-collapsed", isOpen);
    });
  });
}

/* ==========================================================
   Option 1: Contact form with validation
   Checks required fields and email format, then shows
   error or success messages without reloading the page.
   ========================================================== */

// Simple email pattern: something@something.something (no spaces)
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function setupContactForm() {
  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");

  const fields = {
    name: document.getElementById("name"),
    email: document.getElementById("email"),
    message: document.getElementById("message")
  };

  // Returns an error message for a field, or "" if the value is fine
  function validateField(fieldName) {
    const value = fields[fieldName].value.trim();

    if (fieldName === "name") {
      if (value === "") return "Please enter your name.";
      if (value.length < 2) return "Your name should be at least 2 characters.";
    }

    if (fieldName === "email") {
      if (value === "") return "Please enter your email address.";
      if (!EMAIL_PATTERN.test(value)) return "Please enter a valid email, e.g. name@example.com.";
    }

    if (fieldName === "message") {
      if (value === "") return "Please write a message.";
      if (value.length < 10) return "Your message should be at least 10 characters.";
    }

    return "";
  }

  // Shows (or clears) the error message under one field
  function showFieldError(fieldName, message) {
    const input = fields[fieldName];
    const errorBox = document.getElementById(fieldName + "-error");

    errorBox.textContent = message ? "⚠ " + message : "";
    input.classList.toggle("invalid", message !== "");
    input.setAttribute("aria-invalid", String(message !== ""));
  }

  // Shows the overall result under the Send button
  function showStatus(message, type) {
    status.textContent = message;
    status.className = "form-status " + type;
  }

  // Re-check a field as soon as the visitor leaves it, and clear its
  // error while they type a fix
  Object.keys(fields).forEach(function (fieldName) {
    fields[fieldName].addEventListener("blur", function () {
      if (fields[fieldName].value.trim() !== "") {
        showFieldError(fieldName, validateField(fieldName));
      }
    });

    fields[fieldName].addEventListener("input", function () {
      if (fields[fieldName].classList.contains("invalid")) {
        showFieldError(fieldName, validateField(fieldName));
      }
    });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault(); // stay on the page instead of reloading

    let firstInvalid = null;

    Object.keys(fields).forEach(function (fieldName) {
      const error = validateField(fieldName);
      showFieldError(fieldName, error);
      if (error && !firstInvalid) firstInvalid = fields[fieldName];
    });

    if (firstInvalid) {
      showStatus("Oops! Please fix the highlighted fields and try again.", "error");
      firstInvalid.focus();
      return;
    }

    // All good: thank the visitor by name and clear the form
    const firstName = fields.name.value.trim().split(" ")[0];
    showStatus("Thank you, " + firstName + "! Your message has been sent. 💖", "success");
    form.reset();
  });
}

/* ==========================================================
   Option 5: Welcome message when the page loads
   Builds a small pink banner, greets the visitor based on
   the time of day, and hides it after a few seconds.
   ========================================================== */
function showWelcomeMessage() {
  const hour = new Date().getHours();
  let greeting = "Good evening";
  if (hour < 12) greeting = "Good morning";
  else if (hour < 18) greeting = "Good afternoon";

  // Create the banner element with JavaScript
  const banner = document.createElement("div");
  banner.className = "welcome-banner";
  banner.setAttribute("role", "status");

  const text = document.createElement("p");
  text.innerHTML = "<strong>" + greeting + "! 🌸</strong> Welcome to my portfolio page!";

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "welcome-close";
  closeButton.setAttribute("aria-label", "Close welcome message");
  closeButton.textContent = "✕";

  banner.appendChild(text);
  banner.appendChild(closeButton);
  document.body.appendChild(banner);

  // Slide it in on the next frame so the CSS transition plays
  requestAnimationFrame(function () {
    banner.classList.add("visible");
  });

  function hideBanner() {
    banner.classList.remove("visible");
    setTimeout(function () {
      banner.remove();
    }, 400); // matches the CSS transition time
  }

  closeButton.addEventListener("click", hideBanner);
  setTimeout(hideBanner, 6000); // auto-hide after 6 seconds
}
