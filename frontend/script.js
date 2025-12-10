document.addEventListener("DOMContentLoaded", function () {
  // Mobile menu toggle
  const mobileMenu = document.querySelector(".mobile-menu");
  const nav = document.querySelector("nav");

  if (mobileMenu) {
    mobileMenu.addEventListener("click", function () {
      nav.classList.toggle("active");
    });
  }

  // Payment method selection
  document.querySelectorAll(".payment-method").forEach((method) => {
    method.addEventListener("click", function () {
      document.querySelectorAll(".payment-method").forEach((m) => {
        m.classList.remove("active");
        m.querySelector(".method-check i").className = "fas fa-circle";
      });
      this.classList.add("active");
      this.querySelector(".method-check i").className = "fas fa-check-circle";
    });
  });

  // Form submission
  const b2bForm = document.getElementById("b2bSubscriptionForm");
  if (b2bForm) {
    b2bForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Validate phone number
      const phoneInput = this.querySelector('input[type="tel"]');
      if (phoneInput && phoneInput.value.length !== 10) {
        alert("Please enter a valid 10-digit phone number");
        phoneInput.focus();
        return;
      }

      // Validate terms agreement
      const termsCheckbox = this.querySelector("#terms");
      if (!termsCheckbox.checked) {
        alert("Please agree to the terms and conditions");
        return;
      }

      // Show success modal
      document.getElementById("b2bModal").style.display = "flex";
      document.body.style.overflow = "hidden";

      // Reset form
      this.reset();

      // Reset payment method
      document.querySelectorAll(".payment-method").forEach((m) => {
        m.classList.remove("active");
        m.querySelector(".method-check i").className = "fas fa-circle";
      });
      document.querySelector(".payment-method").classList.add("active");
      document.querySelector(".payment-method .method-check i").className =
        "fas fa-check-circle";
    });
  }

  // Phone number formatting
  const phoneInput = document.querySelector('input[type="tel"]');
  if (phoneInput) {
    phoneInput.addEventListener("input", function (e) {
      this.value = this.value.replace(/\D/g, "").slice(0, 10);
    });
  }

  // FAQ functionality
  document.querySelectorAll(".faq-question").forEach((question) => {
    question.addEventListener("click", function () {
      const item = this.parentElement;
      item.classList.toggle("active");
    });
  });

  // Modal functionality
  const modal = document.getElementById("b2bModal");
  const modalClose = document.getElementById("modalClose");
  const modalOkBtn = document.getElementById("modalOkBtn");
  const modalHelpBtn = document.getElementById("modalHelpBtn");

  function closeModal() {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  }

  if (modalClose) {
    modalClose.addEventListener("click", closeModal);
  }

  if (modalOkBtn) {
    modalOkBtn.addEventListener("click", function () {
      closeModal();
      alert("Redirecting to broker dashboard...");
    });
  }

  if (modalHelpBtn) {
    modalHelpBtn.addEventListener("click", function () {
      closeModal();
      window.location.href = "index.html#contact";
    });
  }

  // Close modal on outside click
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === this || e.target.classList.contains("modal-overlay")) {
        closeModal();
      }
    });
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href === "#") return;

      // Check if it's a hash link on same page
      if (href.startsWith("#") && !href.includes("index.html")) {
        e.preventDefault();
        const targetElement = document.querySelector(href);
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 100,
            behavior: "smooth",
          });
        }
      }
    });
  });
});
