// =========================================
// COMPLETE JS - INTEGRATED & FIXED (Swiper, Cart, Auth, Chat, Contact)
// =========================================

// Swiper init (original - global var for access)
let swiper; // Declare global to avoid re-init issues

// Global variables (from original + new)
let productList = [];
let cartproduct = [];
let captchaNum1, captchaNum2, captchaAnswer;


const loadCartFromStorage = () => {
    try {
        const savedCart = localStorage.getItem('cartproduct');
        if (savedCart) {
            cartproduct = JSON.parse(savedCart);
        } else {
            cartproduct = [];
        }
    } catch (error) {
        console.error('Lỗi load cart từ storage:', error);
        cartproduct = [];
    }
    updateCartValue(); // Update UI immediately
};

// Save cart to localStorage (new)
const saveCartToStorage = () => {
    try {
        localStorage.setItem('cartproduct', JSON.stringify(cartproduct));
    } catch (error) {
        console.error('Lỗi save cart vào storage:', error);
    }
};

// Update cart value (original - fixed selector check)
const updateCartValue = () => {
    const cartValueEl = document.querySelector('.cart-value');
    if (cartValueEl) {
        cartValueEl.textContent = cartproduct.length;
    }
};

// Update total (original - fixed parseFloat safety, exact like old)
const updateTotal = () => {
    const cartTotalEl = document.querySelector('.cart-total');
    if (!cartTotalEl) return;
    let total = 0;
    document.querySelectorAll('.item').forEach(item => {
        const priceText = item.querySelector('.item-total')?.textContent.replace(/\./g, '').replace(' VND', '') || '0';
        total += parseFloat(priceText) || 0;
    });
    cartTotalEl.textContent = `${total.toLocaleString('vi-VN')} VND`;
};

// Show empty cart message (new - fixed selector)
const showEmptyCartMessage = (cardList) => {
    if (cardList && cardList.children.length === 0 && !cardList.querySelector('p.empty-msg')) {
        const emptyP = document.createElement('p');
        emptyP.className = 'empty-msg';
        emptyP.style.cssText = 'text-align: center; color: gray; padding: 2rem; font-style: italic;';
        emptyP.textContent = 'Giỏ hàng trống. Thêm sản phẩm để mua hàng!';
        cardList.appendChild(emptyP);
    }
};

// Clear empty message (new)
const clearEmptyCartMessage = (cardList) => {
    const emptyP = cardList?.querySelector('p.empty-msg');
    if (emptyP) emptyP.remove();
};

// =========================================
// COMMENTS FUNCTIONS (Updated - Require purchase to comment, Add to Swiper)
// =========================================

// Load bình luận từ localStorage
const loadComments = () => {
    try {
        const comments = JSON.parse(localStorage.getItem('comments')) || [];
        return comments;
    } catch (error) {
        console.error('Lỗi load comments:', error);
        return [];
    }
};

// Save bình luận vào localStorage (giữ tối đa 10 bình luận gần nhất)
const saveComments = (comments) => {
    try {
        if (comments.length > 10) comments = comments.slice(-10); // Giới hạn 10
        localStorage.setItem('comments', JSON.stringify(comments));
    } catch (error) {
        console.error('Lỗi save comments:', error);
    }
};

// Render danh sách bình luận
const renderComments = () => {
    const commentsList = document.getElementById('commentsList');
    if (!commentsList) return;

    const comments = loadComments();
    commentsList.innerHTML = ''; // Clear trước

    if (comments.length === 0) {
        commentsList.innerHTML = '<p class="no-comments">Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ!</p>';
        return;
    }

    comments.forEach(comment => {
        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment-item';
        commentDiv.innerHTML = `
            <div class="comment-header">
                <strong>${comment.name}</strong> - <small>${new Date(comment.timestamp).toLocaleString('vi-VN')}</small>
            </div>
            <p>${comment.comment}</p>
        `;
        commentsList.appendChild(commentDiv);
    });
};

// Kiểm tra xem user có đơn hàng đã thanh toán không
const hasPurchased = () => {
    const userPhone = localStorage.getItem('userPhone');
    if (!userPhone) return false;
    try {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        return orders.some(order => order.userPhone === userPhone && order.status === 'Đã thanh toán');
    } catch (error) {
        console.error('Lỗi kiểm tra đơn hàng:', error);
        return false;
    }
};

// Thêm bình luận vào swiper như một slide mới (giống review)
const addCommentToSwiper = (comment) => {
    if (!swiper) return; // Đảm bảo swiper đã init

    // Lấy hình ảnh từ profile (từ localStorage)
    const userPhone = localStorage.getItem('userPhone');
    let profileImageSrc = 'client/default-avatar.jpg'; // Mặc định
    if (userPhone) {
        try {
            const userData = JSON.parse(localStorage.getItem(userPhone));
            if (userData && userData.image) {
                profileImageSrc = userData.image; // Sử dụng hình ảnh từ profile
            }
        } catch (error) {
            console.error('Lỗi load hình ảnh từ profile:', error);
        }
    }

    // Tạo HTML cho slide mới (giống review, với sao 5 mặc định)
    const newSlideHTML = `
        <div class="swiper-slide">
            <div class="flex gap-2">
                <div class="profile">
                    <img src="${profileImageSrc}" alt="Khách hàng"> <!-- Sử dụng hình ảnh từ profile -->
                </div>
                <div>
                    <h4>${comment.name}</h4>
                    <div class="mt-half">
                        <i class="fa-solid fa-star" style="color: gold;"></i>
                        <i class="fa-solid fa-star" style="color: gold;"></i>
                        <i class="fa-solid fa-star" style="color: gold;"></i>
                        <i class="fa-solid fa-star" style="color: gold;"></i>
                        <i class="fa-solid fa-star" style="color: gold;"></i>
                    </div>
                </div>
            </div>
            <p class="para">${comment.comment}</p>
        </div>
    `;
    // Thêm slide vào swiper (append sau slide cuối)
    swiper.appendSlide(newSlideHTML);
    console.log('Đã thêm bình luận vào swiper:', comment.name, 'với hình ảnh từ profile');
};


// Init comments (gọi khi DOM ready)
const initComments = () => {
    const commentForm = document.getElementById('commentForm');
    if (!commentForm) return;

    // Load và render bình luận ban đầu
    renderComments();

    // Event submit form
    commentForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (!isLoggedIn) {
            alert('Bạn phải đăng nhập để viết bình luận!');
            openLoginModal();
            return;
        }

        // Kiểm tra điều kiện mua hàng
        if (!hasPurchased()) {
            alert('Bạn phải mua ít nhất 1 món hàng của cửa tiệm mới được đánh giá và viết bình luận!');
            return;
        }

        const name = document.getElementById('commentName').value.trim();
        const email = document.getElementById('commentEmail').value.trim();
        const comment = document.getElementById('commentText').value.trim();

        if (!name || !email || !comment) {
            alert('Vui lòng điền đầy đủ thông tin!');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert('Email không hợp lệ!');
            return;
        }
        if (comment.length < 10) {
            alert('Bình luận phải ít nhất 10 ký tự!');
            return;
        }

        // Tạo bình luận mới
        const newComment = {
            name: name,
            email: email,
            comment: comment,
            timestamp: new Date().toISOString()
        };

        // Load, thêm, save
        const comments = loadComments();
        comments.push(newComment);
        saveComments(comments);

        // Render lại và reset form
        renderComments();
        commentForm.reset();

        // Thêm vào swiper như slide mới
        addCommentToSwiper(newComment);

        alert('Bình luận của bạn đã được gửi thành công và thêm vào phần đánh giá!');
    });
};


// =========================================
// CART FUNCTIONS (Original + Persistence, Login Check, Overlay/Body Classes) - FIXED OPEN/CLOSE TO MATCH OLD
// =========================================

// Open cart (FIXED: Exact like old - simple add class + updateTotal, no extra complexity)
const openCart = () => {
    const cartTab = document.querySelector('.cart-tab');
    const cardList = document.querySelector('.card-list');

    console.log('Attempting to open cart... Cart tab found:', !!cartTab); // Debug

    if (!cartTab) {
        console.error('Cart tab (.cart-tab) not found! Check HTML.');
        return;
    }

    // Exact like old: direct add class
    cartTab.classList.add('cart-tab-active');

    // Update UI like old (empty msg + total)
    if (cardList) {
        clearEmptyCartMessage(cardList);
        if (cardList.children.length === 0) {
            showEmptyCartMessage(cardList);
        }
        updateTotal();
    }

    console.log('Cart opened (class added)');
};

// Close cart (FIXED: Exact like old - simple remove class)
const closeCart = () => {
    const cartTab = document.querySelector('.cart-tab');
    const cardList = document.querySelector('.card-list');
    if (!cartTab) return;

    // Exact like old: direct remove class
    cartTab.classList.remove('cart-tab-active');

    if (cardList) clearEmptyCartMessage(cardList);
    console.log('Cart closed (class removed)');
};

// =========================================
// CHECKOUT FUNCTIONS (New - Tab thanh toán với scroll view, trigger từ .checkout-trigger)
// =========================================

// Open checkout tab (check cart not empty + logged in, render + update total)
const openCheckout = () => {
    const checkoutTab = document.querySelector('.checkout-tab');
    const itemsList = document.querySelector('.checkout-items-list');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    if (!checkoutTab) {
        console.error('Checkout tab (.checkout-tab) not found!');
        return;
    }
    if (cartproduct.length === 0) {
        alert('Giỏ hàng trống! Hãy thêm sản phẩm trước.');
        return;
    }
    if (!isLoggedIn) {
        alert('Bạn phải đăng nhập để thanh toán!');
        openLoginModal();
        return;
    }

    // Render items + total (từ cartproduct, qty=1)
    renderCheckoutItems();
    updateCheckoutTotal();
    updateCheckoutHeader();


    // Slide in (add class như openCart)
    checkoutTab.classList.add('checkout-tab-active');

    const cartTab = document.querySelector('.cart-tab');
    if (cartTab) {
        cartTab.style.pointerEvents = 'none';  // Tắt cart tương tác
    }

    setTimeout(() => { console.log('Checkout tab opened'); }, 50); // Delay log 50ms để confirm slide

};

const closeCheckout = () => {
    const checkoutTab = document.querySelector('.checkout-tab');
    if (!checkoutTab) return;
    checkoutTab.classList.remove('checkout-tab-active');

    // Tích hợp: Bật lại cart-tab tương tác khi checkout đóng
    const cartTab = document.querySelector('.cart-tab');
    if (cartTab) {
        cartTab.style.pointerEvents = 'auto';  // Bật lại cart
    }

    console.log('Checkout tab closed');
};

// Render danh sách mua hàng trong checkout (từ cartproduct, qty=1 initial, với + / - giống cart) - UPDATED
const renderCheckoutItems = () => {
    const itemsList = document.querySelector('.checkout-items-list');
    if (!itemsList || cartproduct.length === 0) return;

    itemsList.innerHTML = cartproduct.map(product => {
        const basePrice = parseFloat(product.price.replace(/\./g, '').replace(' VND', '')) || 0;
        const initialQty = 1;  // Initial qty=1 (UI-only)
        const itemTotal = basePrice * initialQty;  // Total cho item

        return `
            <div class="checkout-item" data-product-id="${product.id}" data-base-price="${basePrice}">
                <div class="item-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="detail">
                    <h4>${product.name}</h4>
                    <p class="item-price">${itemTotal.toLocaleString('vi-VN')} VND (x${initialQty})</p>
                </div>
                <div class="flex">
                    <a href="#" class="quantity-btn minus" data-product-id="${product.id}"><i class="fa-solid fa-minus"></i></a>
                    <h4 class="quantity-value">${initialQty}</h4>
                    <a href="#" class="quantity-btn plus" data-product-id="${product.id}"><i class="fa-solid fa-plus"></i></a>
                </div>
            </div>
        `;
    }).join('');  // Join để tránh text node thừa

    // Attach event listeners cho nút + / - (sau khi render, giống cart)
    const plusButtons = itemsList.querySelectorAll('.plus');
    const minusButtons = itemsList.querySelectorAll('.minus');

    // Plus event (tăng qty, update giá item + total)
    plusButtons.forEach(plusBtn => {
        plusBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const productId = parseInt(e.target.closest('.quantity-btn').dataset.productId);
            const itemEl = itemsList.querySelector(`.checkout-item[data-product-id="${productId}"]`);
            if (!itemEl) return;

            const quantityValue = itemEl.querySelector('.quantity-value');
            const itemPriceEl = itemEl.querySelector('.item-price');
            const basePrice = parseFloat(itemEl.dataset.basePrice) || 0;
            let qty = parseInt(quantityValue.textContent) + 1;

            quantityValue.textContent = qty;
            const newItemTotal = basePrice * qty;
            itemPriceEl.textContent = `${newItemTotal.toLocaleString('vi-VN')} VND (x${qty})`;

            updateCheckoutTotal();  // Update subtotal/shipping/grand total
            console.log('Increased qty for item', productId, 'to', qty);
        });
    });

    // Minus event (giảm qty, nếu =1 thì remove với animation, giống cart)
    minusButtons.forEach(minusBtn => {
        minusBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const productId = parseInt(e.target.closest('.quantity-btn').dataset.productId);
            const itemEl = itemsList.querySelector(`.checkout-item[data-product-id="${productId}"]`);
            if (!itemEl) return;

            const quantityValue = itemEl.querySelector('.quantity-value');
            const itemPriceEl = itemEl.querySelector('.item-price');
            const basePrice = parseFloat(itemEl.dataset.basePrice) || 0;
            let qty = parseInt(quantityValue.textContent);

            if (qty > 1) {
                // Giảm qty (giống cart)
                qty--;
                quantityValue.textContent = qty;
                const newItemTotal = basePrice * qty;
                itemPriceEl.textContent = `${newItemTotal.toLocaleString('vi-VN')} VND (x${qty})`;
                updateCheckoutTotal();
                console.log('Decreased qty for item', productId, 'to', qty);
            } else {
                // Qty=1: Remove với slide-out animation (giống cart)
                itemEl.classList.add('slide-out');

                itemEl.addEventListener('transitionend', () => {
                    // Remove khỏi cartproduct array
                    cartproduct = cartproduct.filter(item => item.id !== productId);
                    saveCartToStorage();  // Sync storage
                    updateCartValue();  // Update badge

                    // Re-render list (cập nhật UI)
                    renderCheckoutItems();

                    // Update total checkout
                    updateCheckoutTotal();

                    // Nếu cart rỗng, đóng tab + alert (giống cart)
                    if (cartproduct.length === 0) {
                        const checkoutTab = document.querySelector('.checkout-tab');
                        if (checkoutTab) {
                            checkoutTab.classList.remove('checkout-tab-active');
                        }
                        alert('Giỏ hàng trống sau khi xóa! Hãy thêm sản phẩm mới.');
                        // Clear cart UI nếu cần
                        const cardList = document.querySelector('.card-list');
                        if (cardList) {
                            cardList.innerHTML = '';
                            showEmptyCartMessage(cardList);
                            updateTotal();
                        }
                    }

                    console.log('Removed item ID:', productId, '- Remaining:', cartproduct.length);
                }, { once: true });  // Chỉ chạy 1 lần
                return;  // Dừng, không updateTotal() nữa
            }
            updateCheckoutTotal();
        });
    });

    console.log('Rendered', cartproduct.length, 'checkout items with quantity controls (+/-)');
};

// Update tổng tiền + phí shipping (dựa qty hiện tại trong UI, format VND) - UPDATED: Tính từ base * qty
const updateCheckoutTotal = () => {
    const totalAmountEl = document.querySelector('.total-amount');
    const shippingFeeEl = document.getElementById('shipping-fee');
    const grandTotalEl = document.querySelector('.grand-total strong');
    if (!totalAmountEl || !shippingFeeEl || !grandTotalEl) return;

    const itemsList = document.querySelector('.checkout-items-list');
    if (!itemsList || itemsList.children.length === 0) {
        // Nếu rỗng, set 0
        totalAmountEl.textContent = '0 VND';
        shippingFeeEl.textContent = '0 VND';
        grandTotalEl.textContent = '0 VND';
        return;
    }

    // Subtotal: Sum (basePrice * current qty) từ tất cả items (giống cart total)
    let subtotal = 0;
    itemsList.querySelectorAll('.checkout-item').forEach(itemEl => {
        const basePrice = parseFloat(itemEl.dataset.basePrice) || 0;
        const qty = parseInt(itemEl.querySelector('.quantity-value')?.textContent) || 1;
        subtotal += basePrice * qty;
    });

    // Phí dựa radio (default express)
    const selectedMethod = document.querySelector('input[name="shipping"]:checked')?.value || 'express';
    let shippingFee = selectedMethod === 'express' ? subtotal * 0.20 : subtotal * 0.10;
    const grandTotal = subtotal + shippingFee;

    totalAmountEl.textContent = `${subtotal.toLocaleString('vi-VN')} VND`;
    shippingFeeEl.textContent = `${shippingFee.toLocaleString('vi-VN')} VND`;
    grandTotalEl.textContent = `${grandTotal.toLocaleString('vi-VN')} VND`;
    console.log('Updated checkout total:', grandTotal, 'VND (subtotal:', subtotal, ', method:', selectedMethod, ')');
};

// Load user address từ localStorage (giữ nguyên - động)
const loadUserAddress = () => {
    const userPhone = localStorage.getItem('userPhone');
    if (!userPhone) {
        console.warn('No userPhone found. Cannot load address.');
        return '';
    }
    const userDataStr = localStorage.getItem(userPhone);
    if (!userDataStr) {
        console.warn('No user data found for phone:', userPhone);
        return '';
    }
    try {
        const userData = JSON.parse(userDataStr);
        return userData.address || '';  // Mặc định '' nếu chưa có
    } catch (error) {
        console.error('Error parsing user data for address:', error);
        return '';
    }
};

// Update checkout header với address (FIX: Cho tab mới - chỉ update display + warning class, xóa editBtn ref)
const updateCheckoutHeader = () => {
    const addressDisplay = document.getElementById('address-display');
    const addressTab = document.getElementById('address-tab');
    if (!addressDisplay || !addressTab) return;
    const address = loadUserAddress();
    if (address) {
        addressDisplay.innerHTML = `<strong>Giao đến:</strong> ${address}`;
        addressDisplay.classList.remove('warning');  // Xóa warning từ CSS
        addressTab.title = 'Click để chỉnh sửa địa chỉ trên trang profile';  // Tooltip clickable
    } else {
        addressDisplay.innerHTML = '<span>Chưa cập nhật địa chỉ. Click để thêm!</span>';
        addressDisplay.classList.add('warning');  // Thêm class red từ CSS
        addressTab.title = 'Bắt buộc thêm địa chỉ để thanh toán - Click để chỉnh sửa trên trang profile';
    }
    // Thêm click handler để redirect (chỉ thêm 1 lần)
    if (!addressDisplay.hasAttribute('data-click-added')) {
        addressDisplay.addEventListener('click', () => window.location.href = 'profile.html');
        addressDisplay.setAttribute('data-click-added', 'true');  // Flag để tránh trùng lặp
        addressDisplay.style.cursor = 'pointer';  // Thêm cursor pointer để chỉ ra clickable
    }
    console.log('Header updated with address:', address || 'empty');
};

// Toggle tab chồng lên (FIX: Xóa event listener bên trong - chỉ toggle logic)
const toggleAddressTab = () => {
    window.location.href = 'profile.html';
};

// Save address inline (giữ nguyên - update localStorage và đóng tab)
const saveAddressInline = () => {
    const userPhone = localStorage.getItem('userPhone');
    const addressInput = document.getElementById('addressInput');
    if (!userPhone || !addressInput) {
        alert('Lỗi: Không thể lưu địa chỉ. Vui lòng đăng nhập lại.');
        return;
    }

    const newAddress = addressInput.value.trim();
    if (newAddress.length < 10) {
        alert('Địa chỉ phải ít nhất 10 ký tự (bao gồm số nhà, đường, quận, thành phố)!');
        return;
    }

    const userDataStr = localStorage.getItem(userPhone);
    if (!userDataStr) {
        alert('Lỗi dữ liệu tài khoản. Vui lòng đăng nhập lại.');
        return;
    }

    try {
        const userData = JSON.parse(userDataStr);
        userData.address = newAddress;  // Update address
        localStorage.setItem(userPhone, JSON.stringify(userData));  // Save lại

        // Update display ngay và đóng tab
        updateCheckoutHeader();
        toggleAddressTab();  // Đóng tab (remove active)

        alert('Cập nhật địa chỉ thành công!');
        console.log('Address saved inline:', newAddress);
    } catch (error) {
        console.error('Error saving address:', error);
        alert('Lỗi lưu địa chỉ. Thử lại!');
    }
};

// Cancel edit (đóng tab mà không save)
const cancelAddressEdit = () => {
    toggleAddressTab();  // Đóng tab
};


// Open modal edit address
const openAddressModal = () => {
    const modal = document.getElementById('addressModal');
    const addressInput = document.getElementById('addressInput');
    if (!modal || !addressInput) return;

    // Load address hiện tại vào input
    addressInput.value = loadUserAddress();

    modal.style.display = 'block';
    addressInput.focus();
};

// Close modal edit address
const closeAddressModal = () => {
    const modal = document.getElementById('addressModal');
    if (modal) modal.style.display = 'none';
};

// Save address (update localStorage và header)
const saveAddress = () => {
    const userPhone = localStorage.getItem('userPhone');
    const addressInput = document.getElementById('addressInput');
    if (!userPhone || !addressInput) {
        alert('Lỗi: Không thể lưu địa chỉ. Vui lòng đăng nhập lại.');
        return;
    }

    const newAddress = addressInput.value.trim();
    if (newAddress.length < 10) {
        alert('Địa chỉ phải ít nhất 10 ký tự (bao gồm số nhà, đường, quận, thành phố)!');
        return;
    }

    const userDataStr = localStorage.getItem(userPhone);
    if (!userDataStr) {
        alert('Lỗi dữ liệu tài khoản. Vui lòng đăng nhập lại.');
        return;
    }

    try {
        const userData = JSON.parse(userDataStr);
        userData.address = newAddress;  // Update address
        localStorage.setItem(userPhone, JSON.stringify(userData));  // Save lại

        // Update header ngay
        updateCheckoutHeader();

        closeAddressModal();
        alert('Cập nhật địa chỉ thành công!');
        console.log('Address saved:', newAddress);
    } catch (error) {
        console.error('Error saving address:', error);
        alert('Lỗi lưu địa chỉ. Thử lại!');
    }
};

const handleCheckout = () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const balance = parseFloat(localStorage.getItem('accountBalance')) || 0;
    const selectedMethod = document.querySelector('input[name="shipping"]:checked')?.value || 'express';

    if (!isLoggedIn) {
        alert('Bạn phải đăng nhập để thanh toán!');
        openLoginModal();
        return;
    }

    const address = loadUserAddress();
    if (!address) {
        alert('Vui lòng cập nhật địa chỉ giao hàng trước khi thanh toán!');
        toggleAddressTab();  // Mở tab inline (thay openAddressModal)
        return;
    }

    // Tính total (từ UI qty, không phải cartproduct *1 - để sync với +/-)
    const itemsList = document.querySelector('.checkout-items-list');
    let subtotal = 0;
    if (itemsList) {
        itemsList.querySelectorAll('.checkout-item').forEach(itemEl => {
            const basePrice = parseFloat(itemEl.dataset.basePrice) || 0;
            const qty = parseInt(itemEl.querySelector('.quantity-value')?.textContent) || 1;
            subtotal += basePrice * qty;
        });
    }
    const shippingFee = selectedMethod === 'express' ? subtotal * 0.20 : subtotal * 0.10;
    const grandTotal = subtotal + shippingFee;

    if (balance < grandTotal) {
        alert(`Số dư tài khoản (${balance.toLocaleString('vi-VN')} VND) không đủ! Cần ${grandTotal.toLocaleString('vi-VN')} VND. Vui lòng nạp tiền.`);
        return;
    }

    // Trừ tiền + clear cart
    const newBalance = balance - grandTotal;
    localStorage.setItem('accountBalance', newBalance);
    const userPhone = localStorage.getItem('userPhone');
    if (userPhone) {
        const userDataStr = localStorage.getItem(userPhone);
        if (userDataStr) {
            try {
                const userData = JSON.parse(userDataStr);
                userData.balance = newBalance;
                localStorage.setItem(userPhone, JSON.stringify(userData));
            } catch (error) {
                console.error('Lỗi cập nhật balance trong userData:', error);
            }
        }
    }
    localStorage.removeItem('cartproduct');
    cartproduct = [];
    updateCartValue();

    // Tạo mã đơn hàng duy nhất (ORD + số thứ tự tăng dần)
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    const orderCode = `ORD${orders.length + 1}`;  // Ví dụ: ORD1, ORD2, ...

    // Lưu orders với orderCode và userPhone (để lọc trong profile)
    orders.push({
        orderCode: orderCode,  // Thêm mã đơn hàng duy nhất
        userPhone: userPhone,  // Thêm userPhone để lọc orders của user trong profile
        id: Date.now(),  // Giữ timestamp làm ID nội bộ nếu cần
        items: JSON.parse(JSON.stringify(cartproduct)),  // Deep copy items (trước clear)
        subtotal: subtotal,
        shipping: selectedMethod,
        shippingFee: shippingFee,
        total: grandTotal,
        address: address,
        timestamp: new Date().toISOString(),
        status: 'Đã thanh toán'
    });
    localStorage.setItem('orders', JSON.stringify(orders));

    if (window.location.pathname.includes('profile.html')) {
        const accountBalanceEl = document.getElementById('accountBalance');
        if (accountBalanceEl) {
            accountBalanceEl.textContent = newBalance.toLocaleString('vi-VN');
        }
    }
    // Alert với mã đơn hàng
    const deliveryTime = selectedMethod === 'express' ? '1-2 ngày' : '3-5 ngày';
    alert(`Thanh toán thành công! Mã đơn hàng: ${orderCode}. Tổng: ${grandTotal.toLocaleString('vi-VN')} VND (${selectedMethod}). Số dư còn: ${newBalance.toLocaleString('vi-VN')} VND. Đơn hàng sẽ giao trong ${deliveryTime}.`);

    window.location.href = 'profile.html';  // Redirect để xem balance và orders
    closeCheckout();
    closeCart();
    const cardList = document.querySelector('.card-list');
    if (cardList) {
        cardList.innerHTML = '';  // Clear UI cart
        showEmptyCartMessage(cardList);
    }
    updateTotal();  // Update cart total = 0
    console.log('Checkout completed, orderCode:', orderCode, 'orders saved:', orders.length);
};


// Event cho radio shipping (update phí real-time khi change)
const initShippingEvents = () => {
    document.querySelectorAll('input[name="shipping"]').forEach(radio => {
        radio.addEventListener('change', () => {
            updateCheckoutTotal(); // Update ngay khi chọn
        });
    });
    console.log('Shipping radio events initialized');
};


// Show product cards (original + new: login check before add, like old)
const showCards = () => {
    const cartList = document.querySelector('.cart-list');
    if (!cartList) {
        console.error('Cart list (.cart-list) not found! Cannot show products.');
        return;
    }
    cartList.innerHTML = ''; // Clear before render
    productList.forEach(product => {
        const cartDiv = document.createElement('div');
        cartDiv.classList.add('list');
        cartDiv.innerHTML = `
            <div class="image-container">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <h4>${product.name}</h4>
            <h4 class="price">${product.price}</h4>
            <a href="#" class="btn open-cart-btn">Thêm vào giỏ hàng</a>
        `;
        cartList.appendChild(cartDiv);

        const openCartBtns = document.querySelectorAll('.open-cart-btn');
        openCartBtns.forEach(btn => {
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Custom btn clicked (Thêm vào giỏ hàng), opening cart like cartIcon...');
                    openCart(); // Mở cart giống cartIcon
                });
            }
        });

        const cartBtn = cartDiv.querySelector('.btn');
        if (cartBtn) {
            cartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
                if (!isLoggedIn) {
                    alert('Bạn phải đăng ký và đăng nhập tài khoản mới được mua hàng!');
                    openLoginModal(); // Call from auth section
                    return;
                }
                addToCart(product); // Like old: add + open direct in addToCart
            });
        }
    });
};

// Add to cart (original + new: persistence, existing check by id, no quantity in array - UI only, EXACT like old)
const addToCart = (product) => {
    const existingProduct = cartproduct.find(item => item.id === product.id);
    if (existingProduct) {
        alert('Sản phẩm đã có trong giỏ hàng');
        return;
    }

    cartproduct.push(product);
    saveCartToStorage();
    updateCartValue();

    const cardList = document.querySelector('.card-list');
    if (!cardList) {
        console.error('Card list (.card-list) not found! Cannot add item.');
        return;
    }

    let quantity = 1;
    let price = parseFloat(product.price.replace(/\./g, '').replace(' VND', '')); // Like old

    const cartItem = document.createElement('div');
    cartItem.classList.add('item');
    cartItem.innerHTML = `
        <div class="item-image">
            <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="detail">
            <h4>${product.name}</h4>
            <h4 class="item-total">${price} VND</h4>
        </div>
        <div class="flex">
            <a href="#" class="quantity-btn minus"><i class="fa-solid fa-minus"></i></a>
            <h4 class="quantity-value">${quantity}</h4>
            <a href="#" class="quantity-btn plus"><i class="fa-solid fa-plus"></i></a>
        </div>
    `;
    cardList.appendChild(cartItem);

    const plusBtn = cartItem.querySelector('.plus');
    const minusBtn = cartItem.querySelector('.minus');
    const itemTotal = cartItem.querySelector('.item-total');
    const quantityValue = cartItem.querySelector('.quantity-value');

    // Minus event EXACT LIKE OLD (slide-out on qty=1)
    minusBtn.addEventListener('click', (e) => {
        e.preventDefault();
        let qty = parseInt(quantityValue.textContent);
        if (qty > 1) {
            qty--;
            quantityValue.textContent = qty;
            itemTotal.textContent = `${(price * qty)} VND`;
        } else {
            // Thêm hiệu ứng trượt (EXACT LIKE OLD)
            cartItem.classList.add('slide-out');

            // Sau khi animation xong thì mới remove (EXACT LIKE OLD)
            cartItem.addEventListener('transitionend', () => {
                cartItem.remove();
                cartproduct = cartproduct.filter(item => item.id !== product.id);
                updateCartValue();
                if (cartproduct.length === 0) {
                    const cartTab = document.querySelector('.cart-tab');
                    if (cartTab) cartTab.classList.remove('cart-tab-active'); // Like old: close if empty
                }
                updateTotal();
            }, { once: true });
            return; // dừng ở đây, không gọi updateTotal() lần nữa (LIKE OLD)
        }
        updateTotal();
    });

    // Plus event (EXACT LIKE OLD)
    plusBtn.addEventListener('click', (e) => {
        e.preventDefault();
        let qty = parseInt(quantityValue.textContent);
        qty++;
        quantityValue.textContent = qty;
        itemTotal.textContent = `${(price * qty)} VND`;
        updateTotal();
    });

    updateTotal(); // ✅ thêm mới cũng cập nhật liền (LIKE OLD)

    // Like old: direct open after add
    const cartTab = document.querySelector('.cart-tab');
    if (cartTab) cartTab.classList.add('cart-tab-active');
    clearEmptyCartMessage(cardList);
};

// Rebuild cart from storage (new - without opening cart, UI quantity=1 default, slide effect like old)
const rebuildCartFromStorage = () => {
    const cardList = document.querySelector('.card-list');
    if (!cardList || cartproduct.length === 0) return;
    cardList.innerHTML = ''; // Clear existing UI
    cartproduct.forEach(product => {
        // Re-add with default quantity=1 (since storage doesn't save qty per item)
        let quantity = 1;
        let price = parseFloat(product.price.replace(/\./g, '').replace(' VND', '')) || 0;

        const cartItem = document.createElement('div');
        cartItem.classList.add('item');
        cartItem.innerHTML = `
            <div class="item-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="detail">
                <h4>${product.name}</h4>
                <h4 class="item-total">${price} VND</h4>
            </div>
            <div class="flex">
                <a href="#" class="quantity-btn minus"><i class="fa-solid fa-minus"></i></a>
                <h4 class="quantity-value">${quantity}</h4>
                <a href="#" class="quantity-btn plus"><i class="fa-solid fa-plus"></i></a>
            </div>
        `;
        cardList.appendChild(cartItem);

        const plusBtn = cartItem.querySelector('.plus');
        const minusBtn = cartItem.querySelector('.minus');
        const itemTotal = cartItem.querySelector('.item-total');
        const quantityValue = cartItem.querySelector('.quantity-value');

        // Minus event EXACT LIKE OLD (slide-out)
        if (minusBtn) {
            minusBtn.addEventListener('click', (e) => {
                e.preventDefault();
                let qty = parseInt(quantityValue.textContent);
                if (qty > 1) {
                    qty--;
                    quantityValue.textContent = qty;
                    itemTotal.textContent = `${(price * qty)} VND`;
                    updateTotal();
                } else {
                    cartItem.classList.add('slide-out');
                    cartItem.addEventListener('transitionend', () => {
                        cartItem.remove();
                        cartproduct = cartproduct.filter(item => item.id !== product.id);
                        saveCartToStorage();
                        updateCartValue();
                        updateTotal();
                        const cardListAfter = document.querySelector('.card-list');
                        if (cardListAfter && cardListAfter.children.length === 0) {
                            showEmptyCartMessage(cardListAfter);
                            closeCart(); // Like old
                        }
                    }, { once: true });
                    return;
                }
                updateTotal();
            });
        }

        // Plus event like old
        if (plusBtn) {
            plusBtn.addEventListener('click', (e) => {
                e.preventDefault();
                let qty = parseInt(quantityValue.textContent);
                qty++;
                quantityValue.textContent = qty;
                itemTotal.textContent = `${(price * qty)} VND`;
                updateTotal();
            });
        }
    });
    updateTotal();
    clearEmptyCartMessage(cardList);
};

// Init app (original fetch + new: error handling, fallback demo data)
const initApp = () => {
    fetch('products.json')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}: Không tải được products.json`);
            return response.json();
        })
        .then(data => {
            productList = data;
            showCards();
            console.log('Products loaded:', productList.length);
        })
        .catch(error => {
            console.error('Lỗi load products.json:', error);
            // Fallback demo data (new - multiple items for test)
            productList = [
                { id: 1, name: 'Giày Sneaker Panda', price: '500000 VND', image: 'https://via.placeholder.com/200?text=Panda' },
                { id: 2, name: 'Giày Thể Thao Pro', price: '800000 VND', image: 'https://via.placeholder.com/200?text=Pro' },
                { id: 3, name: 'Giày Thời Trang', price: '350000 VND', image: 'https://via.placeholder.com/200?text=Fashion' }
            ];
            showCards();
            alert('Không tải được danh sách sản phẩm. Sử dụng dữ liệu demo để test.');
        });
};

// =========================================
// MODAL & AUTH FUNCTIONS (Full from new - Fixed validation, persistence)
// =========================================

// Generate captcha (new - random 1-10)
const generateCaptcha = () => {
    const captchaQuestion = document.getElementById('captchaQuestion');
    if (!captchaQuestion) return;
    captchaNum1 = Math.floor(Math.random() * 10) + 1;
    captchaNum2 = Math.floor(Math.random() * 10) + 1;
    captchaAnswer = captchaNum1 + captchaNum2;
    captchaQuestion.textContent = `${captchaNum1} + ${captchaNum2} = ?`;
    const captchaInput = document.getElementById('captchaAnswer');
    if (captchaInput) captchaInput.value = '';
};

// Show tab in modal (new - fixed title update)
const showTab = (tabName) => {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    tabBtns.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
    const activeContent = document.getElementById(`${tabName}Tab`);
    if (activeBtn) activeBtn.classList.add('active');
    if (activeContent) activeContent.classList.add('active');
    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) modalTitle.textContent = tabName === 'login' ? 'Đăng nhập' : 'Đăng ký';
    if (tabName === 'signup') generateCaptcha();
};

// Update navbar after login (new - fixed event removal/add)
const updateNavbarAfterLogin = (userName = null) => {
    const desktopLoginBtn = document.querySelector('.desktop-action .btn.login-trigger');
    const mobileLoginBtn = document.querySelector('.mobile-menu .btn.login-trigger');

    // Remove old events safely
    const removeEvents = (el) => {
        if (el) {
            el.replaceWith(el.cloneNode(true)); // Clone to remove listeners
        }
    };
    removeEvents(desktopLoginBtn);
    removeEvents(mobileLoginBtn);

    // Re-select after clone
    const newDesktopBtn = document.querySelector('.desktop-action .btn.login-trigger');
    const newMobileBtn = document.querySelector('.mobile-menu .btn.login-trigger');

    if (userName) {
        const displayText = `Xin chào, ${userName}`;
        if (newDesktopBtn) {
            newDesktopBtn.innerHTML = `${displayText} &nbsp; <i class="fa-solid fa-user"></i>`;
            newDesktopBtn.addEventListener('click', handleLogout);
        }
        if (newMobileBtn) {
            newMobileBtn.innerHTML = `${displayText} &nbsp; <i class="fa-solid fa-user"></i>`;
            newMobileBtn.addEventListener('click', handleLogout);
        }
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userName', userName);
    } else {
        if (newDesktopBtn) {
            newDesktopBtn.innerHTML = `Đăng nhập &nbsp; <i class="fa-solid fa-arrow-right-from-bracket"></i>`;
            newDesktopBtn.addEventListener('click', openLoginModal);
        }
        if (newMobileBtn) {
            newMobileBtn.innerHTML = `Đăng nhập &nbsp; <i class="fa-solid fa-arrow-right-from-bracket"></i>`;
            newMobileBtn.addEventListener('click', openLoginModal);
        }
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userName');
    }
    updateCartValue(); // Refresh cart badge after logout
};

// Handle logout (new - fixed confirm & clear all)
const handleLogout = (e) => {
    if (e) e.preventDefault();
    if (confirm('Bạn có chắc muốn đăng xuất? Giỏ hàng và lịch sử chat sẽ bị xóa.')) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userName');
        localStorage.removeItem('userPhone');
        localStorage.removeItem('accountBalance');
        localStorage.removeItem('userAddress');
        localStorage.removeItem('cartproduct');
        localStorage.removeItem('chatHistory');
        cartproduct = [];
        const cardList = document.querySelector('.card-list');
        if (cardList) cardList.innerHTML = '';
        updateCartValue();
        updateTotal();
        updateNavbarAfterLogin();
        alert('Đăng xuất thành công!');
        // Redirect if on profile
        if (window.location.pathname.includes('profile.html')) {
            window.location.href = 'index.html';
        }
    }
};

// Open login modal (new - fixed focus)
const openLoginModal = (e) => {
    if (e) e.preventDefault();
    const modal = document.getElementById('authModal');
    if (!modal) return;
    modal.style.display = 'block';
    modal.classList.add('active');
    showTab('login');
    setTimeout(() => {
        const loginPhoneInput = document.getElementById('loginPhone');
        if (loginPhoneInput) loginPhoneInput.focus();
    }, 100);
};

// Close modal (new - fixed timeout for animation)
const closeModal = (modal) => {
    if (!modal) return;
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
};

// Check login status on load (new - fixed selector)
const checkLoginStatus = () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const savedUserName = localStorage.getItem('userName');
    if (isLoggedIn && savedUserName) {
        updateNavbarAfterLogin(savedUserName);
    } else {
        updateNavbarAfterLogin(); // Reset to login
    }
};

// =========================================
// CHAT FUNCTIONS (Fixed classes to match CSS: 'chat-active', 'user'/'bot')
// =========================================

// Add message to chat (new - fixed classes: 'user'/'bot')
const addMessage = (text, type, chatMessages) => {
    if (!chatMessages) return;
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', type); // 'user' or 'bot' to match CSS
    messageDiv.innerHTML = `<p>${text}</p>`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
};

// Get bot response (new - expanded responses)
const getBotResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    if (lowerMessage.includes('giày') || lowerMessage.includes('sneaker') || lowerMessage.includes('mua')) {
        return "Tuyệt vời! Chúng tôi có nhiều mẫu giày sneaker thời trang, giá từ 500.000 VND. Bạn thích màu gì hoặc size bao nhiêu? Xem sản phẩm tại <a href='index.html#products-section'>trang sản phẩm</a>.";
    } else if (lowerMessage.includes('giá') || lowerMessage.includes('bao nhiêu')) {
        return "Giá giày dao động từ 300.000 - 2.000.000 VND tùy mẫu. Bạn có thể xem chi tiết trên trang sản phẩm. Cần tư vấn cụ thể không?";
    } else if (lowerMessage.includes('giao hàng') || lowerMessage.includes('ship')) {
        return "Chúng tôi giao hàng toàn quốc, miễn phí nội thành TP.HCM. Thời gian 2-5 ngày. Bạn ở khu vực nào?";
    } else if (lowerMessage.includes('liên hệ') || lowerMessage.includes('số điện thoại')) {
        return "Bạn có thể gọi 0123 456 789 hoặc email contact@thegioigay.com. Hoặc điền form liên hệ trên trang này!";
    } else if (lowerMessage.includes('cảm ơn') || lowerMessage.includes('bye')) {
        return "Cảm ơn bạn đã chat! Nếu cần hỗ trợ thêm, hãy quay lại nhé. Chúc bạn mua sắm vui vẻ! 😊";
    } else {
        const randomResponses = [
            "Tôi hiểu bạn đang cần tư vấn. Bạn quan tâm về giày thể thao, thời trang hay thoải mái?",
            "Chúng tôi có bộ sưu tập giày mới nhất. Hãy cho tôi biết thêm chi tiết để hỗ trợ tốt hơn!",
            "Bạn đã xem sản phẩm nổi bật chưa? Có ưu đãi đặc biệt đấy!",
            "Nếu bạn đăng nhập, có thể lưu giỏ hàng và theo dõi đơn hàng dễ dàng hơn."
        ];
        return randomResponses[Math.floor(Math.random() * randomResponses.length)];
    }
};

// Save/Load chat history (new - fixed try-catch)
const saveChatHistory = (text, type) => {
    try {
        let history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
        history.push({ text, type, timestamp: new Date().toISOString() });
        if (history.length > 20) history = history.slice(-20); // Limit history
        localStorage.setItem('chatHistory', JSON.stringify(history));
    } catch (error) {
        console.error('Lỗi save chat history:', error);
    }
};

const loadChatHistory = (chatMessages) => {
    if (!chatMessages) return;
    try {
        const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
        history.forEach(msg => {
            addMessage(msg.text, msg.type, chatMessages);
        });
    } catch (error) {
        console.error('Lỗi load chat history:', error);
    }
};

// Send chat message (new - fixed timeout random)
const sendChatMessage = (chatInput, chatMessages, sendMessage) => {
    if (!chatInput || !chatMessages) return;
    const message = chatInput.value.trim();
    if (!message) return;

    addMessage(message, 'user', chatMessages);
    chatInput.value = '';
    saveChatHistory(message, 'user');

    // Disable send button during response
    if (sendMessage) sendMessage.disabled = true;

    setTimeout(() => {
        let botResponse = getBotResponse(message);
        addMessage(botResponse, 'bot', chatMessages);
        saveChatHistory(botResponse, 'bot');
        if (sendMessage) sendMessage.disabled = false;
    }, Math.random() * 1000 + 1000); // 1-2s delay
};

// Init chat (new - fixed classes: 'chat-active', body 'chat-open', focus)
const initChat = () => {
    const chatToggle = document.getElementById('chatToggle');
    const chatWindow = document.getElementById('chatWindow');
    const chatClose = document.querySelector('.chat-close');
    const chatInput = document.getElementById('chatInput');
    const sendMessage = document.getElementById('sendMessage');
    const chatMessages = document.getElementById('chatMessages');

    if (!chatToggle || !chatWindow) return;

    chatToggle.addEventListener('click', () => {
        const isActive = chatWindow.classList.contains('chat-active');
        chatWindow.classList.toggle('chat-active');
        document.body.classList.toggle('chat-open', !isActive);
        chatToggle.classList.toggle('active', !isActive);

        if (!isActive) { // Opening
            if (chatInput) chatInput.focus();
            if (chatMessages && chatMessages.children.length === 0) {
                loadChatHistory(chatMessages);
                if (chatMessages.children.length === 0) {
                    addMessage("Xin chào! Tôi là trợ lý ảo của THẾ GIỚI GIÀY. Bạn cần tư vấn gì về giày dép? (Ví dụ: 'Tôi muốn mua giày sneaker' hoặc 'Giá giày bao nhiêu?')", 'bot', chatMessages);
                }
            }
        }
    });

    if (chatClose) {
        chatClose.addEventListener('click', () => {
            chatWindow.classList.remove('chat-active');
            document.body.classList.remove('chat-open');
            chatToggle.classList.remove('active');
        });
    }

    // Click outside to close (new - fixed selector)
    document.addEventListener('click', (e) => {
        if (chatWindow.classList.contains('chat-active') &&
            !chatWindow.contains(e.target) && !chatToggle.contains(e.target)) {
            chatWindow.classList.remove('chat-active');
            document.body.classList.remove('chat-open');
            chatToggle.classList.remove('active');
        }
    });

    if (sendMessage) {
        sendMessage.addEventListener('click', () => sendChatMessage(chatInput, chatMessages, sendMessage));
    }
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendChatMessage(chatInput, chatMessages, sendMessage);
            }
        });
    }

    // Transition end for initial load (new)
    chatWindow.addEventListener('transitionend', () => {
        if (chatWindow.classList.contains('chat-active') && chatMessages && chatMessages.children.length === 0) {
            loadChatHistory(chatMessages);
            if (chatMessages.children.length === 0) {
                addMessage("Xin chào! Tôi là trợ lý ảo của THẾ GIỚI GIÀY. Bạn cần tư vấn gì về giày dép?", 'bot', chatMessages);
            }
        }
    });
};

// Init contact form (new - fixed validation regex, prevent double-submit)
const initContactForm = () => {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    let isSubmitting = false; // Prevent double-submit

    contactForm.addEventListener('submit', function (e) {
        if (isSubmitting) return;
        e.preventDefault();
        isSubmitting = true;

        const formData = new FormData(contactForm);
        const name = formData.get('name')?.trim();
        const email = formData.get('email')?.trim();
        const phone = formData.get('phone')?.trim();
        const message = formData.get('message')?.trim();

        if (!name || !email || !phone || !message) {
            alert('Vui lòng điền đầy đủ thông tin!');
            isSubmitting = false;
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert('Email không hợp lệ!');
            isSubmitting = false;
            return;
        }
        if (phone.length < 10 || !/^0[1-9]\d{8,9}$/.test(phone)) {
            alert('Số điện thoại không hợp lệ (bắt đầu bằng 0, 10-11 chữ số)!');
            isSubmitting = false;
            return;
        }
        if (message.length < 10) {
            alert('Tin nhắn phải ít nhất 10 ký tự!');
            isSubmitting = false;
            return;
        }

        // Simulate send (new - could integrate EmailJS or backend)
        setTimeout(() => {
            alert(`Cảm ơn ${name}! Chúng tôi đã nhận thông tin liên hệ từ ${email} (${phone}). Tin nhắn: "${message}". Sẽ phản hồi trong 24 giờ!`);
            contactForm.reset();
            isSubmitting = false;
        }, 1000);
    });
};



// =========================================
// EVENT LISTENERS (DOMContentLoaded - Integrated All)
// =========================================
document.addEventListener('DOMContentLoaded', function () {
    // Load cart persistence first (new)
    loadCartFromStorage();

    // Check login status (new)
    checkLoginStatus();

    // Swiper init (original - conditional if element exists)
    if (document.querySelector('.mySwiper')) {
        swiper = new Swiper(".mySwiper", {
            loop: true,
            navigation: {
                nextEl: "#next",
                prevEl: "#prev",
            },
        });
    }

    // DOM elements (original + checks)
    const cartIcon = document.querySelector('.cart-icon');
    const cartTab = document.querySelector('.cart-tab');
    const closeBtn = document.querySelector('.close-btn');
    const cartList = document.querySelector('.cart-list');
    const cardList = document.querySelector('.card-list');
    const cartTotal = document.querySelector('.cart-total');
    const cartValue = document.querySelector('.cart-value');
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    const socialIcons = document.querySelectorAll('.social-icon');
    const icon = hamburger ? hamburger.querySelector('i') : null;
    const appStoreBtn = document.querySelector('.btn.bt');  // Thêm phần tử cho nút App Store

    // Initialize app const socialIcons = document.querySelectorAll('.social-icon');  // Chọn tất cả phần tử với class "social-icon"
    if (socialIcons.length > 0) {
        socialIcons.forEach(icon => {
            const iconType = icon.querySelector('i').classList[1];  // Lấy class của icon (ví dụ: fa-tiktok)
            let url = '#';  // URL mặc định

            switch (iconType) {
                case 'fa-tiktok':
                    url = 'https://tiktok.com/yourpage';
                    break;
                case 'fa-instagram':
                    url = 'https://instagram.com/yourpage';  // Thay bằng URL thực tế
                    break;
                case 'fa-facebook-f':
                    url = 'https://facebook.com/yourpage';  // Thay bằng URL thực tế
                    break;
                case 'fa-google-plus-g':
                    url = 'https://plus.google.com/yourpage';  // Google+ đã bị ngừng, có thể thay bằng Google hoặc khác
                    break;
                default:
                    url = '#';
            }

            icon.href = url;  // Đặt href cho liên kết
            icon.target = '_blank';  // Mở trong tab mới
            icon.addEventListener('click', (e) => {
                if (url !== '#') {
                    console.log(`Mở liên kết ${url}`);
                } else {
                    e.preventDefault();  // Ngăn chặn nếu URL không hợp lệ
                    alert('Liên kết mạng xã hội chưa được thiết lập!');
                }
            });
        });
        console.log('Các biểu tượng mạng xã hội đã được thiết lập.');
    } else {
        console.error('Không tìm thấy biểu tượng mạng xã hội (.social-icon)!');
    }

    if (appStoreBtn) {
        appStoreBtn.addEventListener('click', (e) => {
            e.preventDefault();  // Ngăn chặn hành vi mặc định của liên kết
            const appStoreUrl = 'https://www.apple.com/app-store/';  // URL thực tế, bạn có thể thay đổi
            window.location.href = appStoreUrl;  // Chuyển hướng đến App Store
            console.log('Nút App Store được click, chuyển hướng đến:', appStoreUrl);
        });
    } else {
        console.error('Nút App Store (.btn.bt) không tìm thấy! Kiểm tra HTML.');
    }

    const datHangBtn = document.getElementById('order-btn');  // Sử dụng ID thay vì class
    if (datHangBtn) {
        datHangBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

            if (!isLoggedIn) {
                alert('Bạn phải đăng nhập để đặt hàng!');
                openLoginModal();
                return;
            }

            if (cartproduct.length === 0) {
                alert('Giỏ hàng trống! Hãy thêm sản phẩm trước khi đặt hàng.');
                window.location.href = 'index.html#products-section';
                return;
            }

            openCheckout();
            console.log('Nút "Đặt hàng" được click, mở checkout tab.');
        });
    } else {
        console.error('Nút "Đặt hàng" (#datHangButton) không tìm thấy! Kiểm tra HTML.');
    }



    // Hamburger menu (original - fixed toggle)
    if (hamburger && mobileMenu && icon) {
        hamburger.addEventListener('click', () => {
            mobileMenu.classList.toggle('mobile-menu-active');
            if (icon.classList.contains('fa-bars')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
            } else {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });
    }

    // Cart events (original + new: openCart/closeCart) - FIXED: Đảm bảo cartIcon gọi openCart đúng
    if (cartIcon && cartTab) {
        cartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Cart icon clicked, opening cart...'); // Debug
            openCart();
        });
    } else {
        console.error('Cart icon or cart tab not found! Cannot attach event.');
    }


    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeCart();
        });
    }

    // Click outside cart to close (fixed - thêm check để tránh conflict với cartIcon)
    document.addEventListener('click', (e) => {
        if (cartTab && cartTab.classList.contains('cart-tab-active')) {
            const overlay = document.querySelector('.cart-overlay');
            if (overlay && (e.target === overlay || (!cartTab.contains(e.target) && !e.target.closest('.cart-icon')))) {
                closeCart();
            }
        }
    });

    // Checkout events (new - trigger từ .checkout-trigger, close, pay, radio, outside)
    const checkoutTrigger = document.querySelector('.checkout-trigger');
    if (checkoutTrigger) {
        checkoutTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Checkout trigger clicked, opening checkout tab...');
            openCheckout(); // Mở tab thanh toán
        });
    } else {
        console.error('Checkout trigger (.checkout-trigger) not found!');
    }

    // Close checkout nút "Hủy" (.close-checkout)
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('close-checkout')) {
            e.preventDefault();
            closeCheckout();
        }
    });

    // Nút thanh toán (#payBill)
    const payBillBtn = document.getElementById('payBill');
    if (payBillBtn) {
        payBillBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleCheckout(); // Xử lý thanh toán

        });
    }


        initComments();

    const saveAddressBtn = document.getElementById('saveAddressBtn');
    const closeAddressBtn = document.getElementById('closeAddressModal');

    if (saveAddressBtn) {
        saveAddressBtn.addEventListener('click', (e) => {
            e.preventDefault();
            saveAddress();  // Lưu và update header
        });
    }
    if (closeAddressBtn) {
        closeAddressBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeAddressModal();
        });
    }

    // Click outside modal to close
    const addressModal = document.getElementById('addressModal');
    if (addressModal) {
        addressModal.addEventListener('click', (e) => {
            if (e.target === addressModal) {
                closeAddressModal();
            }
        });
    }

    // Click outside cart/checkout to close (merged: Chỉ đóng cart nếu không phải checkout active, KHÔNG đóng checkout)
    document.addEventListener('click', (e) => {
        const cartTab = document.querySelector('.cart-tab');
        const checkoutTab = document.querySelector('.checkout-tab');
        const overlay = document.querySelector('.cart-overlay');

        // Nếu cart active VÀ KHÔNG phải checkout active: Đóng cart khi click overlay (bình thường)
        if (cartTab && cartTab.classList.contains('cart-tab-active') &&
            !checkoutTab?.classList?.contains('checkout-tab-active') &&  // Optional chaining: An toàn nếu checkoutTab null
            overlay && (e.target === overlay || (!cartTab.contains(e.target) && !e.target.closest('.cart-icon')))) {
            closeCart();
        }

        // Nếu checkout active: KHÔNG đóng checkout (chỉ đóng bằng nút close-checkout hoặc JS riêng)
        // (Overlay có pointer-events: none từ CSS, nên click overlay không trigger closeCheckout nữa)
        // → Cart bị che dưới overlay, nhưng checkout vẫn tương tác bình thường
    });



    // Init radio events (gọi sau DOM ready, update total khi load tab)
    initShippingEvents();



    // Resize to close cart on desktop/mobile switch (new - debounced)
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (window.innerWidth > 750 && document.body.classList.contains('cart-open')) {
                closeCart();
            }
        }, 250);
    });

    // Rebuild cart from storage (new - if cardList exists) - FIXED: Gọi rebuild trước initApp để UI sẵn sàng
    if (cardList) {
        rebuildCartFromStorage();
        if (cardList.children.length === 0) {
            showEmptyCartMessage(cardList);
        }
        updateTotal(); // Cập nhật total ngay khi load
    }

    // Modal elements and events (new - fixed selectors)
    const modal = document.getElementById('authModal');
    const loginBtns = document.querySelectorAll('.login-trigger'); // Both desktop/mobile
    const closeBtnModal = document.querySelector('.close');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    loginBtns.forEach(btn => btn.addEventListener('click', openLoginModal));

    if (closeBtnModal && modal) {
        closeBtnModal.addEventListener('click', () => closeModal(modal));
    }
    if (modal) {
        window.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(modal);
        });
    }

    // Tab switching (new)
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const tab = this.dataset.tab;
            showTab(tab);
        });
    });

    // Login form submit (new - fixed validation, persistence)
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const phone = document.getElementById('loginPhone').value.trim();
            const password = document.getElementById('loginPassword').value.trim();

            if (!phone || !password) {
                alert('Vui lòng nhập đầy đủ thông tin!');
                return;
            }
            if (phone.length < 10 || !/^0[1-9]\d{8,9}$/.test(phone)) {
                alert('Số điện thoại không hợp lệ (ví dụ: 0123456789)!');
                return;
            }

            const savedUserData = localStorage.getItem(phone);
            if (savedUserData) {
                try {
                    const userData = JSON.parse(savedUserData);
                    if (userData.password !== password) {
                        alert('Mật khẩu không đúng!');
                        return;
                    }
                    const userName = userData.name || phone;
                    localStorage.setItem('accountBalance', userData.balance || 0);
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('userName', userName);
                    localStorage.setItem('userPhone', phone);

                    alert(`Đăng nhập thành công! Chào mừng ${userName}`);
                    updateNavbarAfterLogin(userName);
                    closeModal(modal);
                    loginForm.reset();
                    // Redirect to profile if on index/contact
                    if (!window.location.pathname.includes('profile.html')) {
                        window.location.href = 'profile.html';
                    }
                } catch (error) {
                    console.error('Lỗi parse user data:', error);
                    alert('Lỗi dữ liệu tài khoản!');
                }
            } else {
                alert('Tài khoản không tồn tại! Vui lòng đăng ký trước.');
                showTab('signup');
            }
        });
    }

    // Signup form submit (new - fixed captcha, phone check, redirect)
    if (signupForm) {
        signupForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const name = document.getElementById('signupName').value.trim();
            const phone = document.getElementById('signupPhone').value.trim();
            const password = document.getElementById('signupPassword').value.trim();
            const confirmPassword = document.getElementById('signupConfirmPassword').value.trim();
            const userCaptchaAnswer = parseInt(document.getElementById('captchaAnswer').value) || 0;

            if (!name || !phone || !password || !confirmPassword) {
                alert('Vui lòng nhập đầy đủ thông tin!');
                return;
            }
            if (phone.length < 10 || !/^0[1-9]\d{8,9}$/.test(phone)) {
                alert('Số điện thoại không hợp lệ (ví dụ: 0123456789)!');
                return;
            }
            if (password.length < 6) {
                alert('Mật khẩu phải ít nhất 6 ký tự!');
                return;
            }
            if (password !== confirmPassword) {
                alert('Mật khẩu xác nhận không khớp!');
                return;
            }
            if (userCaptchaAnswer !== captchaAnswer) {
                alert('Captcha không đúng! Vui lòng thử lại.');
                generateCaptcha();
                return;
            }

            if (localStorage.getItem(phone)) {
                alert('Số điện thoại đã được đăng ký! Vui lòng đăng nhập.');
                showTab('login');
                return;
            }

            const newUser = {
                name: name,
                phone: phone,
                password: password,
                address: "",
                balance: 0
            };
            localStorage.setItem(phone, JSON.stringify(newUser));

            alert(`Đăng ký thành công! Chào mừng ${name}. Đang tự động đăng nhập...`);

            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userName', name);
            localStorage.setItem('userPhone', phone);
            localStorage.setItem('accountBalance', 0);

            updateNavbarAfterLogin(name);
            closeModal(modal);
            signupForm.reset();
            generateCaptcha(); // Reset for next time

            // Redirect to profile
            window.location.href = 'profile.html';
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'c' || e.key === 'C') {
            e.preventDefault();
            openCart();
        }
    });

    // Protect profile links (new - fixed selector)
    document.querySelectorAll('a[href="profile.html"]').forEach(link => {
        link.addEventListener('click', function (e) {
            const isLoggedInCheck = localStorage.getItem('isLoggedIn') === 'true';
            if (!isLoggedInCheck) {
                e.preventDefault();
                openLoginModal();
                return false;
            }
        });
    });


    // Thêm kiểm tra đăng nhập cho liên kết "Trang sản phẩm" và "Trang liên hệ"
    document.querySelectorAll('a').forEach(link => {
        if (link.textContent.trim().includes('Trang sản phẩm') || link.textContent.trim().includes('Trang liên hệ')) {
            link.addEventListener('click', function (e) {
                const isLoggedInCheck = localStorage.getItem('isLoggedIn') === 'true';
                if (!isLoggedInCheck) {
                    e.preventDefault();  // Ngăn chặn chuyển hướng
                    alert('Bạn phải đăng nhập để truy cập trang này!');
                    openLoginModal();
                    return false;
                }
            });
        }

        // Smooth scroll for "Trang sản phẩm" (new - fixed fallback)
        if (link.textContent.trim().includes('Trang sản phẩm')) {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                let productSection = document.getElementById('products-section');
                if (!productSection) {
                    const cartListFallback = document.querySelector('.cart-list');
                    if (cartListFallback) {
                        productSection = cartListFallback.closest('section');
                    }
                }
                if (productSection) {
                    const offsetTop = productSection.getBoundingClientRect().top + window.pageYOffset - 100;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                } else {
                    console.warn('Không tìm thấy phần sản phẩm!');
                    window.location.href = 'index.html#products-section';
                }
            });
        }
    });

    // Init chat (new - conditional if elements exist)
    if (document.getElementById('chatToggle')) {
        initChat();
    }

    // Init contact form (new - conditional)
    initContactForm();

    // Init app (original - conditional for products-section)
    if (document.getElementById('products-section') || document.querySelector('.cart-list')) {
        initApp();
    }

    console.log('JavaScript loaded successfully! Cart:', cartproduct.length, 'Logged in:', localStorage.getItem('isLoggedIn') === 'true');


    // =========================================
    // TRACKING FUNCTIONS (Integrated from tracking.js - Only run on tracking page)
    // =========================================
    if (document.getElementById('trackingForm')) {
        // Hàm render orders (cập nhật: Hiển thị orderCode, list xác thực mua hàng với chi tiết)
        function renderOrders(orders) {
            const ordersList = document.getElementById('ordersList');
            ordersList.innerHTML = ''; // Clear trước

            if (orders.length === 0) {
                ordersList.innerHTML = '<p>Không tìm thấy đơn hàng nào. Vui lòng kiểm tra mã đơn hàng hoặc số điện thoại.</p>';
                return;
            }

            orders.forEach(order => {
                const orderDiv = document.createElement('div');
                orderDiv.className = 'order-item';
                orderDiv.innerHTML = `
                    <h4>Mã đơn hàng: ${order.orderCode}</h4>  <!-- Cập nhật: Hiển thị orderCode -->
                    <p>Ngày đặt: ${new Date(order.timestamp).toLocaleDateString('vi-VN')}</p>
                    <p>Địa chỉ giao: ${order.address || 'Chưa cập nhật'}</p>
                    <p>Sản phẩm: ${order.items.map(item => `${item.name} (x${item.quantity || 1})`).join(', ')}</p>  <!-- Cập nhật: Hiển thị qty nếu có -->
                    <p>Tổng tiền: ${order.total.toLocaleString('vi-VN')} VND (Phí ship: ${order.shippingFee.toLocaleString('vi-VN')} VND)</p>
                    <p>Phương thức giao: ${order.shipping === 'express' ? 'Hỏa tốc' : 'Bình thường'}</p>
                    <div class="status-bar">
                        <span class="status ${order.status === 'Đã thanh toán' ? 'completed' : 'pending'}">${order.status}</span>
                    </div>
                `;
                ordersList.appendChild(orderDiv);
            });
        }

        // Event listener cho form tracking (cập nhật: Lọc theo orderCode, hiển thị list xác thực)
        document.getElementById('trackingForm').addEventListener('submit', function (e) {
            e.preventDefault();
            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            if (!isLoggedIn) {
                alert('Bạn phải đăng nhập để theo dõi đơn hàng!');
                // Gọi openLoginModal từ main.js (nếu đã load)
                if (typeof openLoginModal === 'function') openLoginModal();
                return;
            }

            const code = document.getElementById('trackingCode').value.trim();
            const phone = document.getElementById('trackingPhone').value.trim() || localStorage.getItem('userPhone');

            if (!code && !phone) {
                alert('Vui lòng nhập mã đơn hàng hoặc số điện thoại!');
                return;
            }

            // Lấy orders từ localStorage (giống main.js)
            let orders = [];
            try {
                orders = JSON.parse(localStorage.getItem('orders')) || [];
            } catch (error) {
                console.error('Lỗi load orders:', error);
                orders = [];
            }

            // Lọc orders theo orderCode (ưu tiên code, nếu không có thì phone - tạm thời giữ, có thể mở rộng)
            let filteredOrders = [];
            if (code) {
                filteredOrders = orders.filter(order => order.orderCode === code);  // Cập nhật: Lọc theo orderCode
            } else if (phone) {
                // Giả sử phone liên kết với user (có thể mở rộng lọc theo userPhone nếu lưu trong order)
                filteredOrders = orders.filter(order => true);  // Tạm thời giữ, ưu tiên code
            }

            // Hiển thị kết quả (list danh sách xác thực mua hàng)
            document.getElementById('trackingResult').style.display = 'block';
            renderOrders(filteredOrders);
        });

        // Đảm bảo main.js load xong trước khi attach events (nếu cần)
        console.log('Trang theo dõi đơn đã được tải, chờ một chút...');
    }
});



// =========================================
// END OF SCRIPT
// =========================================
