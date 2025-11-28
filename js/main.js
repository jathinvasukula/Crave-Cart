
document.addEventListener("DOMContentLoaded", () => {
  /* ===================== NAVBAR / HAMBURGER ===================== */
  const navList = document.querySelector(".nav-list");
  const hamburger = document.querySelector(".hamburger");
  const navClose = document.querySelector(".nav-list .close");

  if (hamburger && navList) {
    hamburger.addEventListener("click", () => {
      navList.classList.add("show");
    });
  }

  if (navClose && navList) {
    navClose.addEventListener("click", () => {
      navList.classList.remove("show");
    });
  }

  // Close nav when clicking a link on mobile
  navList?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navList.classList.remove("show");
    });
  });

  /* ===================== SIGN-IN MODAL ===================== */
  const signInBtn = document.querySelector(".btn.signin");
  const wrapper = document.querySelector(".wrapper");
  const closeForm = document.querySelector(".close-form");

  if (signInBtn && wrapper) {
    signInBtn.addEventListener("click", () => {
      wrapper.classList.add("active");
    });
  }

  if (closeForm && wrapper) {
    closeForm.addEventListener("click", () => {
      wrapper.classList.remove("active");
    });
  }

  // Close sign-in on outside click
  wrapper?.addEventListener("click", (e) => {
    if (e.target === wrapper) {
      wrapper.classList.remove("active");
    }
  });

  /* ===================== SWIPER INIT ===================== */
  let swiper = new Swiper(".mySwiper", {
    slidesPerView: 4,
    spaceBetween: 30,
    grabCursor: true,
    pagination: {
      el: ".custom-pagination",
      clickable: true,
    },
    breakpoints: {
      0: {
        slidesPerView: 1,
      },
      576: {
        slidesPerView: 2,
      },
      992: {
        slidesPerView: 3,
      },
      1200: {
        slidesPerView: 4,
      },
    },
  });

  /* ===================== PRODUCTS + FILTERS + CART ===================== */
  const productsWrapper = document.getElementById("products-wrapper");
  const filterButtons = document.querySelectorAll(".recipes .filters span");

  let allProducts = [];
  let currentProducts = [];

  // CART STATE
  const cartIcon = document.querySelector(".cart-icon");
  const cartCountBadge = cartIcon?.querySelector("span");
  const cartModal = document.getElementById("cart-modal");
  const closeCartBtn = document.querySelector(".close-cart");
  const cartItemsContainer = document.getElementById("cart-items");
  let cart = [];

  function updateCartCount() {
    if (!cartCountBadge) return;
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCountBadge.textContent = totalQty.toString();
  }

  function renderCartItems() {
    if (!cartItemsContainer) return;

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
      return;
    }

    let total = 0;
    let html = `
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Price ($)</th>
            <th>Subtotal ($)</th>
          </tr>
        </thead>
        <tbody>
    `;

    cart.forEach((item) => {
      const price = parseFloat(item.price || "0");
      const sub = price * item.qty;
      total += sub;
      html += `
        <tr>
          <td>${item.title}</td>
          <td>${item.qty}</td>
          <td>${price.toFixed(2)}</td>
          <td>${sub.toFixed(2)}</td>
        </tr>
      `;
    });

    html += `
        </tbody>
      </table>
      <p style="margin-top:10px; font-weight:600;">Total: $${total.toFixed(
        2
      )}</p>
    `;

    cartItemsContainer.innerHTML = html;
  }

  function openCart() {
    if (cartModal) {
      cartModal.style.display = "flex";
      renderCartItems();
    }
  }

  function closeCart() {
    if (cartModal) {
      cartModal.style.display = "none";
    }
  }

  cartIcon?.addEventListener("click", openCart);
  closeCartBtn?.addEventListener("click", closeCart);
  cartModal?.addEventListener("click", (e) => {
    if (e.target === cartModal) {
      closeCart();
    }
  });

  function addToCart(productId) {
    const product = allProducts.find((p) => p.id === productId);
    if (!product) return;

    const existing = cart.find((item) => item.id === productId);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        ...product,
        qty: 1,
      });
    }
    updateCartCount();
  }

  function renderProducts(list) {
    if (!productsWrapper) return;
    productsWrapper.innerHTML = "";

    // Clear and rebuild Swiper slides
    swiper.removeAllSlides();

    const slides = list.map((product) => {
      const slide = document.createElement("div");
      slide.className = "swiper-slide";

      slide.innerHTML = `
        <div class="card d-flex">
          <div class="image">
            <img src="${product.url}" alt="${product.title}" />
          </div>
          <div class="rating">
            <span><i class="bx bxs-star"></i></span>
            <span><i class="bx bxs-star"></i></span>
            <span><i class="bx bxs-star"></i></span>
            <span><i class="bx bxs-star"></i></span>
            <span><i class="bx bxs-star"></i></span>
          </div>
          <h4>${product.title}</h4>
          <div class="price">
            <span>Price</span><span class="color">$${product.price}</span>
          </div>
          <button class="button" data-id="${product.id}">Add To Cart+</button>
        </div>
      `;
      return slide;
    });

    slides.forEach((slide) => swiper.appendSlide(slide));
    swiper.update();
    currentProducts = list;
  }

  // Event delegation for "Add To Cart" buttons
  productsWrapper?.addEventListener("click", (e) => {
    const target = e.target;
    if (target && target.classList.contains("button")) {
      const id = Number(target.getAttribute("data-id"));
      if (!isNaN(id)) {
        addToCart(id);
      }
    }
  });

  // Load products from products.json
  fetch("products.json")
    .then((res) => res.json())
    .then((data) => {
      allProducts = data.products || [];
      renderProducts(allProducts);
    })
    .catch((err) => {
      console.error("Error loading products:", err);
    });

  // Filters
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.getAttribute("data-filter");
      if (!filter || filter === "All Product") {
        renderProducts(allProducts);
      } else {
        const filtered = allProducts.filter(
          (p) => p.category === filter
        );
        renderProducts(filtered);
      }
    });
  });

  /* ===================== TESTIMONIALS ===================== */
  const testimonialsWrapper = document.querySelector(".test-wrapper");
  const testimonialCards = document.querySelectorAll(
    ".testimonials .col:first-child .card"
  );

  function renderTestimonials(testimonials) {
    if (!testimonialsWrapper) return;
    testimonialsWrapper.innerHTML = "";

    testimonials.forEach((t) => {
      const div = document.createElement("div");
      div.className =
        "testimonial" + (t.class === "active" ? " active" : "");
      div.setAttribute("data-id", t.firstName);

      div.innerHTML = `
        <div class="d-flex">
          <div>
            <h4>${t.name}</h4>
            <span>${t.position}</span>
          </div>
          <div class="rating">
            <span><i class="bx bxs-star"></i></span>
            <span><i class="bx bxs-star"></i></span>
            <span><i class="bx bxs-star"></i></span>
            <span><i class="bx bxs-star"></i></span>
            <span><i class="bx bxs-star"></i></span>
          </div>
        </div>
        <p>${t.info}</p>
      `;
      testimonialsWrapper.appendChild(div);
    });
  }

  fetch("testimonials.json")
    .then((res) => res.json())
    .then((data) => {
      const testimonials = data.testimonials || [];
      renderTestimonials(testimonials);

      // Click handlers for left-side cards
      testimonialCards.forEach((card) => {
        card.addEventListener("click", () => {
          const key = card.getAttribute("data-filter");

          // Toggle active class on cards
          testimonialCards.forEach((c) => c.classList.remove("active"));
          card.classList.add("active");

          // Toggle active class on testimonial content
          const allTestimonials =
            document.querySelectorAll(".testimonial");
          allTestimonials.forEach((t) => {
            if (t.getAttribute("data-id") === key) {
              t.classList.add("active");
            } else {
              t.classList.remove("active");
            }
          });
        });
      });
    })
    .catch((err) => {
      console.error("Error loading testimonials:", err);
    });
});
