const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const navClose = document.querySelector("[data-nav-close]");
const navBackdrop = document.querySelector("[data-nav-backdrop]");
const intakeForm = document.querySelector("[data-intake-form]");
const intakeError = document.querySelector("[data-intake-error]");
const intakeStatus = document.querySelector("[data-intake-status]");
const intakeSubmit = document.querySelector("[data-intake-submit]");
const contactEmail = document.querySelector("[data-contact-email]");
const contactPhone = document.querySelector("[data-contact-phone]");

function syncHeader() {
  header.classList.toggle("scrolled", window.scrollY > 16);
}

function closeNav() {
  document.body.classList.remove("nav-open");
  header.classList.remove("nav-active");
  nav.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Open navigation");
}

function targetFromHash(hash) {
  if (!hash || hash === "#") return null;
  if (hash === "#top") return document.getElementById("top");

  try {
    return document.getElementById(decodeURIComponent(hash.slice(1)));
  } catch {
    return document.getElementById(hash.slice(1));
  }
}

function scrollToTarget(target, hash, behavior = "smooth") {
  const headerOffset = Math.round(header.getBoundingClientRect().height);
  const targetTop = target === document.getElementById("top")
    ? 0
    : Math.max(0, Math.round(window.scrollY + target.getBoundingClientRect().top - headerOffset));

  window.scrollTo({ top: targetTop, behavior });

  if (hash && window.location.hash !== hash) {
    history.pushState(null, "", hash);
  }
}

function scrollAfterNavClose(callback) {
  requestAnimationFrame(() => {
    requestAnimationFrame(callback);
  });
}

syncHeader();
window.addEventListener("scroll", syncHeader, { passive: true });

navToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  document.body.classList.toggle("nav-open", isOpen);
  header.classList.toggle("nav-active", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
});

document.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) return;

  const anchor = event.target.closest('a[href^="#"]');
  if (!anchor) return;

  const target = targetFromHash(anchor.hash);
  if (!target) return;

  event.preventDefault();
  closeNav();

  scrollAfterNavClose(() => {
    scrollToTarget(target, anchor.hash);
  });
});

window.addEventListener("load", () => {
  if (window.location.hash) {
    const target = targetFromHash(window.location.hash);
    if (target) {
      requestAnimationFrame(() => {
        scrollToTarget(target, window.location.hash, "auto");
      });
    }
  }
});

navBackdrop.addEventListener("click", closeNav);
navClose.addEventListener("click", closeNav);

function closeCustomSelects(except = null) {
  document.querySelectorAll("[data-custom-select].open").forEach((select) => {
    if (select === except) return;
    select.classList.remove("open");
    select.querySelector(".custom-select-button")?.setAttribute("aria-expanded", "false");
  });
}

function resetCustomSelects() {
  document.querySelectorAll("[data-custom-select]").forEach((select) => {
    const field = select.closest(".custom-select-field");
    const valueInput = field?.querySelector("[data-custom-select-value]");
    const label = select.querySelector("[data-custom-select-label]");
    const options = [...select.querySelectorAll(".custom-select-option")];
    const selected = options[0];

    if (!selected) return;

    const value = selected.dataset.value ?? selected.textContent.trim();
    valueInput.value = value;
    label.textContent = selected.textContent.trim();
    options.forEach((item) => item.setAttribute("aria-selected", String(item === selected)));
  });
}

document.querySelectorAll("[data-custom-select]").forEach((select) => {
  const field = select.closest(".custom-select-field");
  const valueInput = field?.querySelector("[data-custom-select-value]");
  const label = select.querySelector("[data-custom-select-label]");
  const button = select.querySelector(".custom-select-button");
  const options = [...select.querySelectorAll(".custom-select-option")];

  button.addEventListener("click", () => {
    const isOpen = select.classList.toggle("open");
    button.setAttribute("aria-expanded", String(isOpen));
    closeCustomSelects(select);
  });

  options.forEach((option) => {
    option.addEventListener("click", () => {
      const value = option.dataset.value ?? option.textContent.trim();
      valueInput.value = value;
      label.textContent = option.textContent.trim();
      options.forEach((item) => item.setAttribute("aria-selected", String(item === option)));
      closeCustomSelects();
      button.focus();
    });
  });

  select.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeCustomSelects();
      button.focus();
    }
  });
});

document.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) return;
  if (!event.target.closest("[data-custom-select]")) {
    closeCustomSelects();
  }
});

function setIntakeError(message, fields = []) {
  intakeError.textContent = message;
  intakeError.hidden = !message;
  if (message) setIntakeStatus("");

  [contactEmail, contactPhone].forEach((field) => {
    field.classList.toggle("is-invalid", fields.includes(field));
  });
}

function setIntakeStatus(message, type = "success") {
  intakeStatus.textContent = message;
  intakeStatus.hidden = !message;
  intakeStatus.dataset.status = type;
  if (message) setIntakeError("");
}

function validateIntakeForm() {
  const email = contactEmail.value.trim();
  const phone = contactPhone.value.trim();

  if (!email && !phone) {
    setIntakeError("Add an email or phone number so the team can respond", [contactEmail, contactPhone]);
    return false;
  }

  if (email && !contactEmail.validity.valid) {
    setIntakeError("Enter a valid email address, or leave email blank and add a phone number", [contactEmail]);
    return false;
  }

  setIntakeError("");
  return true;
}

function intakePayload() {
  return Object.fromEntries(new FormData(intakeForm).entries());
}

function fallbackMailto(payload) {
  const fallbackAction = intakeForm.dataset.fallbackAction || "mailto:";
  const subject = `Project request${payload.name ? ` from ${payload.name}` : ""}`;
  const body = [
    "Project request",
    "",
    fieldLine("Name", payload.name),
    fieldLine("Email", payload.email),
    fieldLine("Phone", payload.phone),
    fieldLine("Preferred contact", payload.preferred_contact),
    fieldLine("Project type", payload.project_type),
    fieldLine("Project location", payload.project_location),
    fieldLine("Ideal timeline", payload.ideal_timeline),
    fieldLine("Budget range", payload.budget_comfort),
    "",
    "Project notes",
    payload.project_notes || "Not provided"
  ]
    .filter((line) => line !== null)
    .join("\n");
  const separator = fallbackAction.includes("?") ? "&" : "?";

  setIntakeStatus("Opening your email app to finish the request", "notice");
  window.location.href = `${fallbackAction}${separator}subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function fieldLine(label, value) {
  return value ? `${label}: ${value}` : null;
}

function setSubmitting(isSubmitting) {
  intakeSubmit.disabled = isSubmitting;
  intakeForm.setAttribute("aria-busy", String(isSubmitting));
  intakeSubmit.textContent = isSubmitting ? "Sending request" : "Send project request";
}

intakeForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!validateIntakeForm()) {
    (contactEmail.classList.contains("is-invalid") ? contactEmail : contactPhone).focus();
    return;
  }

  const payload = intakePayload();
  setSubmitting(true);
  setIntakeStatus("");

  try {
    const response = await fetch(intakeForm.action, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => null);

    if (response.ok && result?.ok) {
      intakeForm.reset();
      resetCustomSelects();
      setIntakeStatus("Project request sent. The team will respond using your preferred contact path");
      return;
    }

    if (result?.code === "contact_not_configured" || response.status === 404) {
      fallbackMailto(payload);
      return;
    }

    setIntakeError(result?.error || "The request could not be sent right now");
  } catch {
    fallbackMailto(payload);
  } finally {
    setSubmitting(false);
  }
});

[contactEmail, contactPhone].forEach((field) => {
  field.addEventListener("input", () => {
    if (!intakeError.hidden) validateIntakeForm();
  });
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeNav();
    closeCustomSelects();
  }
});
