
const API_URL = "https://dummyjson.com/products?limit=100";

const productContainer = document.getElementById("productContainer");
const loading = document.getElementById("loading");
const message = document.getElementById("message");
const productCount = document.getElementById("productCount");

const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const sortFilter = document.getElementById("sortFilter");

const cartCount = document.getElementById("cartCount");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");

let products = [];
let cart = [];

// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Format price
function formatPrice(price) {
    return `$${Number(price).toFixed(2)}`;
}

// Escape text before inserting API values into HTML
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}

// Load products from DummyJSON
async function loadProducts() {
    loading.classList.remove("d-none");
    message.classList.add("d-none");

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Unable to load products.");
        }

        const data = await response.json();

        products = data.products || [];

        if (products.length === 0) {
            throw new Error("No products were returned.");
        }

        loadCategories();
        displayProducts(products);

    } catch (error) {
        console.error("Product loading error:", error);

        productContainer.innerHTML = "";
        productCount.textContent = "0 products";

        message.classList.remove("d-none");
        message.querySelector("h4").textContent =
            "Unable to load products";
        message.querySelector("p").textContent =
            "Please check your internet connection and try again.";
        document.getElementById("resetButton").textContent =
            "Try Again";

    } finally {
        loading.classList.add("d-none");
    }
}

// Create category options
function loadCategories() {
    const categories = [
        ...new Set(products.map(product => product.category))
    ].sort();

    categoryFilter.innerHTML =
        '<option value="all">All Categories</option>';

    categories.forEach(category => {
        const option = document.createElement("option");

        option.value = category;
        option.textContent = category
            .replace(/-/g, " ")
            .replace(/\b\w/g, letter => letter.toUpperCase());

        categoryFilter.appendChild(option);
    });
}

// Display product cards
function displayProducts(items) {
    productContainer.innerHTML = "";

    productCount.textContent =
        `${items.length} product${items.length === 1 ? "" : "s"}`;

    if (items.length === 0) {
        message.classList.remove("d-none");
        message.querySelector("h4").textContent =
            "No products found";
        message.querySelector("p").textContent =
            "Try another search or choose a different category.";
        document.getElementById("resetButton").textContent =
            "Show All Products";
        return;
    }

    message.classList.add("d-none");

    const html = items.map(product => {
        const title = escapeHTML(product.title);
        const category = escapeHTML(product.category);
        const brand = escapeHTML(product.brand || "Not specified");
        const description = escapeHTML(product.description);
        const sku = escapeHTML(product.sku || "N/A");
        const availability = escapeHTML(
            product.availabilityStatus || "Check availability"
        );

        const discount = Number(product.discountPercentage) || 0;
        const price = Number(product.price) || 0;
        const rating = Number(product.rating) || 0;
        const stock = Number(product.stock) || 0;

        // Estimate original price from the discount
        const originalPrice = discount < 100
            ? price / (1 - discount / 100)
            : price;

        const image = escapeHTML(product.thumbnail);
        const inStock = stock > 0;

        return `
            <div class="col-sm-6 col-lg-4 col-xl-3">
                <article class="product-card">

                    <div class="product-image-wrapper">
                        <span class="discount-badge">
                            ${discount.toFixed(0)}% OFF
                        </span>

                        <img
                            src="${image}"
                            class="product-image"
                            alt="${title}"
                            loading="lazy"
                        >
                    </div>

                    <div class="card-body">

                        <div>
                            <span class="category-badge">
                                ${category}
                            </span>
                        </div>

                        <h3 class="product-title">${title}</h3>

                        <p class="product-description">
                            ${description}
                        </p>

                        <div class="product-rating mb-3">
                            <i class="bi bi-star-fill"></i>
                            <strong>${rating.toFixed(1)}</strong>
                            <span class="rating-number">
                                / 5
                            </span>
                        </div>

                        <div class="mb-3">
                            <span class="product-price">
                                ${formatPrice(price)}
                            </span>

                            <span class="old-price">
                                ${formatPrice(originalPrice)}
                            </span>
                        </div>

                        <div class="product-details mb-3">
                            <div>
                                <strong>Brand:</strong> ${brand}
                            </div>

                            <div>
                                <strong>SKU:</strong> ${sku}
                            </div>

                            <div>
                                <strong>Stock:</strong> ${stock}
                            </div>

                            <div>
                                <strong>Status:</strong> ${availability}
                            </div>
                        </div>

                        <p class="stock-label ${inStock ? "" : "out-of-stock"}">
                            <i class="bi ${inStock
                                ? "bi-check-circle-fill"
                                : "bi-x-circle-fill"}"></i>
                            ${inStock ? "In Stock" : "Out of Stock"}
                        </p>

                    </div>

                    <div class="card-footer">
                        <button
                            class="btn btn-primary add-cart-btn"
                            data-product-id="${product.id}"
                            ${inStock ? "" : "disabled"}
                        >
                            <i class="bi bi-cart-plus me-2"></i>
                            ${inStock ? "Add to Cart" : "Out of Stock"}
                        </button>
                    </div>

                </article>
            </div>
        `;
    }).join("");

    productContainer.innerHTML = html;
}

// Search, category filter and sorting
function filterProducts() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedCategory = categoryFilter.value;
    const sortValue = sortFilter.value;

    let filteredProducts = products.filter(product => {
        const matchesSearch =
            product.title.toLowerCase().includes(searchTerm) ||
            (product.brand || "").toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm);

        const matchesCategory =
            selectedCategory === "all" ||
            product.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    if (sortValue === "low") {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortValue === "high") {
        filteredProducts.sort((a, b) => b.price - a.price);
    } else if (sortValue === "rating") {
        filteredProducts.sort((a, b) => b.rating - a.rating);
    } else if (sortValue === "discount") {
        filteredProducts.sort(
            (a, b) => b.discountPercentage - a.discountPercentage
        );
    }

    displayProducts(filteredProducts);
}

// Add product to cart
productContainer.addEventListener("click", event => {
    const button = event.target.closest(".add-cart-btn");

    if (!button) return;

    const productId = Number(button.dataset.productId);
    const product = products.find(item => item.id === productId);

    if (!product || product.stock <= 0) return;

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        if (existingItem.quantity >= product.stock) {
            alert("You have reached the available stock quantity.");
            return;
        }

        existingItem.quantity++;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            quantity: 1,
            stock: product.stock
        });
    }

    updateCart();

    button.innerHTML = '<i class="bi bi-check2 me-2"></i> Added!';
    setTimeout(() => {
        if (button.isConnected) {
            button.innerHTML =
                '<i class="bi bi-cart-plus me-2"></i> Add to Cart';
        }
    }, 900);
});

// Update cart display
function updateCart() {
    const totalQuantity = cart.reduce(
        (total, item) => total + item.quantity, 0
    );

    const totalPrice = cart.reduce(
        (total, item) => total + item.price * item.quantity, 0
    );

    cartCount.textContent = totalQuantity;
    cartTotal.textContent = formatPrice(totalPrice);

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="text-center py-4">
                <i class="bi bi-cart-x display-4 text-secondary"></i>
                <p class="mt-3 mb-0">Your cart is empty.</p>
            </div>
        `;
        return;
    }

    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div>
                <div class="cart-item-title">
                    ${escapeHTML(item.title)}
                </div>
                <div class="cart-quantity">
                    Quantity: ${item.quantity}
                </div>
            </div>

            <div class="cart-item-price">
                ${formatPrice(item.price * item.quantity)}
            </div>

            <button
                class="btn btn-sm btn-outline-danger remove-cart-item"
                data-product-id="${item.id}"
                aria-label="Remove ${escapeHTML(item.title)}"
                title="Remove one item"
            >
                <i class="bi bi-trash"></i>
            </button>
        </div>
    `).join("");
}

// Open cart modal
document.getElementById("cartButton").addEventListener("click", () => {
    updateCart();

    bootstrap.Modal.getOrCreateInstance(
        document.getElementById("cartModal")
    ).show();
});

// Remove one unit from the cart
cartItems.addEventListener("click", event => {
    const button = event.target.closest(".remove-cart-item");

    if (!button) return;

    const productId = Number(button.dataset.productId);
    const item = cart.find(product => product.id === productId);

    if (item) {
        item.quantity--;

        if (item.quantity <= 0) {
            cart = cart.filter(product => product.id !== productId);
        }
    }

    updateCart();
});

// Clear cart
document.getElementById("clearCartButton").addEventListener("click", () => {
    cart = [];
    updateCart();
});

// Reset filters or retry API
document.getElementById("resetButton").addEventListener("click", () => {
    if (products.length === 0) {
        loadProducts();
        return;
    }

    searchInput.value = "";
    categoryFilter.value = "all";
    sortFilter.value = "default";

    filterProducts();
});

// Filter event listeners
searchInput.addEventListener("input", filterProducts);
categoryFilter.addEventListener("change", filterProducts);
sortFilter.addEventListener("change", filterProducts);

// Start application
updateCart();
loadProducts();
