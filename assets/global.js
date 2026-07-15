/* Summit & Stitch — global.js
   Cart drawer (AJAX), product form add-to-cart, swatch variant picker.
   No dependencies. */

(function () {
  'use strict';

  /* ---------------------------------------------------------------- money */

  function formatMoney(cents) {
    var amount = (cents / 100).toFixed(2);
    if (amount.slice(-3) === '.00') amount = amount.slice(0, -3);
    return '$' + amount;
  }

  /* ----------------------------------------------------------- cart state */

  var drawer = document.getElementById('CartDrawer');
  var overlay = document.getElementById('CartDrawerOverlay');
  var itemsEl = drawer ? drawer.querySelector('[data-cart-items]') : null;
  var footerEl = drawer ? drawer.querySelector('[data-cart-footer]') : null;
  var subtotalEl = drawer ? drawer.querySelector('[data-cart-subtotal]') : null;

  function updateCartCount(count) {
    document.querySelectorAll('[data-cart-count]').forEach(function (el) {
      el.textContent = count;
      el.setAttribute('data-count', count);
    });
  }

  function openDrawer() {
    document.body.classList.add('cart-drawer-open');
    if (drawer) {
      drawer.setAttribute('aria-hidden', 'false');
      var close = drawer.querySelector('.cart-drawer__close');
      if (close) close.focus();
    }
  }

  function closeDrawer() {
    document.body.classList.remove('cart-drawer-open');
    if (drawer) drawer.setAttribute('aria-hidden', 'true');
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  function renderCart(cart) {
    updateCartCount(cart.item_count);
    if (!itemsEl) return;

    if (cart.item_count === 0) {
      itemsEl.innerHTML = '<p class="cart-drawer__empty">Your cart is empty.</p>';
      if (footerEl) footerEl.hidden = true;
      return;
    }

    if (footerEl) footerEl.hidden = false;
    if (subtotalEl) subtotalEl.textContent = formatMoney(cart.items_subtotal_price);

    itemsEl.innerHTML = cart.items
      .map(function (item, index) {
        var image = item.image
          ? '<img src="' + item.image.replace(/(\.[^.]+)$/, '_240x$1') + '" alt="" loading="lazy" width="90" height="112">'
          : '<span class="cart-line__placeholder"></span>';
        var variant =
          item.variant_title && item.variant_title !== 'Default Title'
            ? '<p class="cart-line__variant">' + escapeHtml(item.variant_title) + '</p>'
            : '';
        return (
          '<div class="cart-line" data-line="' + (index + 1) + '">' +
          '<a href="' + item.url + '">' + image + '</a>' +
          '<div>' +
          '<p class="cart-line__title">' + escapeHtml(item.product_title) + '</p>' +
          variant +
          '<div class="cart-line__row">' +
          '<div class="quantity">' +
          '<button type="button" data-qty-change="-1" aria-label="Decrease quantity">&minus;</button>' +
          '<input type="number" value="' + item.quantity + '" min="0" aria-label="Quantity" data-qty-input>' +
          '<button type="button" data-qty-change="1" aria-label="Increase quantity">+</button>' +
          '</div>' +
          '<span>' + formatMoney(item.final_line_price) + '</span>' +
          '</div>' +
          '<button type="button" class="cart-line__remove" data-remove-line>Remove</button>' +
          '</div>' +
          '</div>'
        );
      })
      .join('');
  }

  function fetchCart() {
    return fetch('/cart.js')
      .then(function (r) { return r.json(); })
      .then(function (cart) {
        renderCart(cart);
        return cart;
      });
  }

  function changeLine(line, quantity) {
    return fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ line: line, quantity: quantity })
    })
      .then(function (r) { return r.json(); })
      .then(renderCart);
  }

  /* ------------------------------------------------------- drawer events */

  document.addEventListener('click', function (event) {
    var target = event.target;

    if (target.closest('[data-cart-open]')) {
      event.preventDefault();
      fetchCart().then(openDrawer);
      return;
    }

    if (target.closest('[data-cart-close]') || target === overlay) {
      closeDrawer();
      return;
    }

    var qtyBtn = target.closest('[data-qty-change]');
    if (qtyBtn && drawer && drawer.contains(qtyBtn)) {
      var lineEl = qtyBtn.closest('[data-line]');
      var input = lineEl.querySelector('[data-qty-input]');
      var next = Math.max(0, parseInt(input.value, 10) + parseInt(qtyBtn.dataset.qtyChange, 10));
      changeLine(parseInt(lineEl.dataset.line, 10), next);
      return;
    }

    if (target.closest('[data-remove-line]')) {
      var removeEl = target.closest('[data-line]');
      changeLine(parseInt(removeEl.dataset.line, 10), 0);
    }
  });

  document.addEventListener('change', function (event) {
    var input = event.target.closest('[data-qty-input]');
    if (input && drawer && drawer.contains(input)) {
      var lineEl = input.closest('[data-line]');
      changeLine(parseInt(lineEl.dataset.line, 10), Math.max(0, parseInt(input.value, 10) || 0));
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeDrawer();
  });

  /* -------------------------------------------------- product form (AJAX) */

  document.addEventListener('submit', function (event) {
    var form = event.target.closest('form[data-product-form]');
    if (!form) return;

    event.preventDefault();
    var button = form.querySelector('[type="submit"]');
    var originalText = button ? button.textContent : '';
    if (button) {
      button.setAttribute('aria-disabled', 'true');
      button.textContent = 'Adding…';
    }

    fetch('/cart/add.js', {
      method: 'POST',
      body: new FormData(form),
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
      .then(function (r) {
        if (!r.ok) return r.json().then(function (e) { throw e; });
        return r.json();
      })
      .then(function () {
        return fetchCart().then(openDrawer);
      })
      .catch(function (error) {
        var status = form.querySelector('[data-form-status]');
        if (status) {
          status.textContent = (error && error.description) || 'Could not add to cart. Please try again.';
          status.classList.add('form-status--error');
        }
      })
      .finally(function () {
        if (button) {
          button.removeAttribute('aria-disabled');
          button.textContent = originalText;
        }
      });
  });

  /* ----------------------------------------------------- variant picker */

  document.querySelectorAll('[data-product-info]').forEach(function (info) {
    var jsonEl = info.querySelector('[data-variants-json]');
    if (!jsonEl) return;

    var variants = JSON.parse(jsonEl.textContent);
    var lowStockThreshold = parseInt(info.dataset.lowStockThreshold, 10) || 4;
    var form = info.querySelector('form[data-product-form]');
    var idInput = form ? form.querySelector('input[name="id"]') : null;
    var priceEl = info.querySelector('[data-price]');
    var stockEl = info.querySelector('[data-stock-note]');
    var buyButton = form ? form.querySelector('[type="submit"]') : null;
    var mainImage = info.querySelector('[data-main-image]');

    function selectedOptions() {
      var values = [];
      info.querySelectorAll('fieldset[data-option-index]').forEach(function (fieldset) {
        var checked = fieldset.querySelector('input:checked');
        values[parseInt(fieldset.dataset.optionIndex, 10)] = checked ? checked.value : null;
      });
      return values;
    }

    function findVariant(values) {
      return variants.find(function (variant) {
        return variant.options.every(function (option, i) { return option === values[i]; });
      });
    }

    function updateStockNote(variant) {
      if (!stockEl) return;
      stockEl.textContent = '';
      if (
        variant &&
        variant.available &&
        variant.inventory_managed &&
        variant.inventory_quantity > 0 &&
        variant.inventory_quantity <= lowStockThreshold
      ) {
        stockEl.textContent =
          variant.inventory_quantity === 1 ? 'Only 1 left' : 'Only ' + variant.inventory_quantity + ' left';
      }
    }

    function updateSelectedLabel(fieldsetInput) {
      var fieldset = fieldsetInput.closest('fieldset');
      var label = fieldset.querySelector('[data-selected-value]');
      if (label) label.textContent = fieldsetInput.value;
    }

    function onVariantChange() {
      var variant = findVariant(selectedOptions());

      if (!variant) {
        if (buyButton) {
          buyButton.disabled = true;
          buyButton.textContent = 'Unavailable';
        }
        return;
      }

      if (idInput) idInput.value = variant.id;
      if (priceEl) priceEl.textContent = formatMoney(variant.price);

      if (buyButton) {
        buyButton.disabled = !variant.available;
        buyButton.textContent = variant.available ? buyButton.dataset.addLabel || 'Add to cart' : 'Sold out';
      }

      updateStockNote(variant);

      if (mainImage && variant.featured_media_url) {
        mainImage.src = variant.featured_media_url;
        if (variant.featured_media_alt) mainImage.alt = variant.featured_media_alt;
      }

      if (variant.id && window.history.replaceState) {
        var url = new URL(window.location.href);
        url.searchParams.set('variant', variant.id);
        window.history.replaceState({}, '', url.toString());
      }
    }

    info.addEventListener('change', function (event) {
      var input = event.target.closest('fieldset[data-option-index] input');
      if (!input) return;
      updateSelectedLabel(input);
      onVariantChange();
    });

    onVariantChange();
  });

  /* --------------------------------------------------- product thumbnails */

  document.addEventListener('click', function (event) {
    var thumb = event.target.closest('[data-thumb]');
    if (!thumb) return;
    var gallery = thumb.closest('[data-product-media]');
    var mainImage = gallery ? gallery.querySelector('[data-main-image]') : null;
    if (!mainImage) return;
    mainImage.src = thumb.dataset.thumb;
    mainImage.alt = thumb.dataset.thumbAlt || '';
    gallery.querySelectorAll('[data-thumb]').forEach(function (b) { b.removeAttribute('aria-current'); });
    thumb.setAttribute('aria-current', 'true');
  });

  /* --------------------------------------------- quantity on product page */

  document.addEventListener('click', function (event) {
    var btn = event.target.closest('.product__info [data-qty-change]');
    if (!btn) return;
    var wrap = btn.closest('.quantity');
    var input = wrap.querySelector('input');
    input.value = Math.max(1, (parseInt(input.value, 10) || 1) + parseInt(btn.dataset.qtyChange, 10));
  });

  /* -------------------------------------------------------------- kickoff */

  fetch('/cart.js')
    .then(function (r) { return r.json(); })
    .then(function (cart) { updateCartCount(cart.item_count); });
})();
