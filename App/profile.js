document.addEventListener('DOMContentLoaded', function () {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn || isLoggedIn !== 'true') {
        alert('Bạn cần đăng nhập để truy cập trang này!');
        window.location.href = 'index.html';
        return;
    }

    const userPhone = localStorage.getItem('userPhone') || '';
    if (!userPhone) {
        alert('Không tìm thấy thông tin đăng nhập!');
        localStorage.removeItem('isLoggedIn');
        window.location.href = 'index.html';
        return;
    }

    let userData = null;
    const savedUserData = localStorage.getItem(userPhone);
    if (savedUserData) {
        userData = JSON.parse(savedUserData);
    }

    const userName = userData ? userData.name : (localStorage.getItem('userName') || 'Khách hàng');
    const userAddress = userData ? userData.address : (localStorage.getItem('userAddress') || '');
    let balance = userData ? (userData.balance || 0) : parseFloat(localStorage.getItem('accountBalance')) || 0;
    let profileImageSrc = userData ? (userData.image || 'https://via.placeholder.com/100x100?text=Avatar') : 'https://via.placeholder.com/100x100?text=Avatar'; 

    document.getElementById('profileName').value = userName;
    document.getElementById('profilePhone').value = userPhone;
    document.getElementById('profileAddress').value = userAddress;
    document.getElementById('accountBalance').textContent = balance.toLocaleString('vi-VN');
    document.getElementById('profileImage').src = profileImageSrc; // Hiển thị hình ảnh khi load

    // Xử lý thay đổi hình ảnh
    document.getElementById('changeImageBtn').addEventListener('click', () => {
        document.getElementById('imageUpload').click(); // Kích hoạt input file ẩn
    });

    document.getElementById('imageUpload').addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('❌ Vui lòng chọn file hình ảnh hợp lệ (PNG, JPG, etc.)!');
                return;
            }
            if (file.size > 5 * 1024 * 1024) { // Giới hạn 5MB
                alert('❌ Kích thước file quá lớn (tối đa 5MB)!');
                return;
            }
            const reader = new FileReader();
            reader.onload = function (e) {
                profileImageSrc = e.target.result; // Base64 string
                document.getElementById('profileImage').src = profileImageSrc; // Hiển thị ngay
            };
            reader.readAsDataURL(file);
        }
    });

    document.getElementById('depositBtn').addEventListener('click', () => {
        const amountStr = prompt('💰 Nhập số tiền (VND): Nhập dương để nạp, âm để trừ (chỉ cho test):', '100000');
        const amount = parseInt(amountStr) || 0;
        if (amount !== 0 && /^\-?\d+$/.test(amountStr)) {  // Cho phép số âm
            if (amount < 0 && Math.abs(amount) > balance) {
                alert('❌ Số tiền trừ vượt quá số dư!');
                return;
            }
            balance += amount;  // Nếu âm, sẽ trừ

            localStorage.setItem('accountBalance', balance);
            if (userData) {
                userData.balance = balance;
                localStorage.setItem(userPhone, JSON.stringify(userData));
            }

            document.getElementById('accountBalance').textContent = balance.toLocaleString('vi-VN');
            const action = amount > 0 ? 'nạp' : 'trừ';
            alert(`✅ ${action.charAt(0).toUpperCase() + action.slice(1)} thành công ${Math.abs(amount).toLocaleString('vi-VN')} VND! Số dư còn: ${balance.toLocaleString('vi-VN')} VND.`);
        } else {
            alert('❌ Số tiền không hợp lệ (phải là số nguyên, dương để nạp, âm để trừ).');
        }
    });

    document.getElementById('saveBtn').addEventListener('click', () => {
        const nameInput = document.getElementById('profileName').value.trim();
        const phoneInput = document.getElementById('profilePhone').value.trim();
        const address = document.getElementById('profileAddress').value.trim();

        if (!nameInput || !phoneInput || phoneInput.length < 10 || !/^0[1-9]\d{8,9}$/.test(phoneInput)) {
            alert('❌ Vui lòng nhập đầy đủ và đúng định dạng (tên, phone hợp lệ)!');
            return;
        }

        const currentPhone = userPhone;
        if (phoneInput !== currentPhone) {
            alert('⚠️ Số điện thoại không thể thay đổi. Vui lòng liên hệ hỗ trợ nếu cần cập nhật.');
            return;
        }

        localStorage.setItem('userName', nameInput);
        localStorage.setItem('userPhone', phoneInput);
        localStorage.setItem('userAddress', address);

        if (userData) {
            userData.name = nameInput;
            userData.address = address;
            userData.balance = balance;
            userData.image = profileImageSrc; // Lưu hình ảnh
            localStorage.setItem(currentPhone, JSON.stringify(userData));
        } else {
            userData = {
                name: nameInput,
                phone: phoneInput,
                address: address,
                balance: balance,
                image: profileImageSrc // Lưu hình ảnh
            };
            localStorage.setItem(currentPhone, JSON.stringify(userData));
        }

        alert('💾 Thông tin của bạn đã được lưu thành công!');
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
        if (confirm('Bạn có chắc muốn đăng xuất?')) {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userName');
            localStorage.removeItem('userPhone');
            localStorage.removeItem('userAddress');
            localStorage.removeItem('accountBalance');
            if (userData && userPhone) {
                localStorage.removeItem(userPhone);
            }
            window.location.href = 'index.html';
        }
    });

    // Hàm render orders cho profile (tương tự tracking, nhưng chỉ hiển thị cho user hiện tại)
    function renderProfileOrders() {
        const ordersHistoryEl = document.getElementById('ordersHistory'); // Thêm <div id="ordersHistory"></div> vào profile.html
        if (!ordersHistoryEl) return;

        let orders = [];
        try {
            orders = JSON.parse(localStorage.getItem('orders')) || [];
        } catch (error) {
            console.error('Lỗi load orders:', error);
            orders = [];
        }

        const filteredOrders = orders.filter(order => order.userPhone === userPhone);
        
        ordersHistoryEl.innerHTML = '<h3>Lịch sử đơn hàng</h3>';
        if (filteredOrders.length === 0) {
            ordersHistoryEl.innerHTML += '<p>Chưa có đơn hàng nào.</p>';
            return;
        }

        filteredOrders.forEach(order => {
            const orderDiv = document.createElement('div');
            orderDiv.className = 'order-item';
            orderDiv.innerHTML = `
            <h4>Mã đơn hàng: ${order.orderCode}</h4>
            <p>Ngày đặt: ${new Date(order.timestamp).toLocaleDateString('vi-VN')}</p>
            <p>Địa chỉ giao: ${order.address || 'Chưa cập nhật'}</p>
            <p>Sản phẩm: ${order.items.map(item => `${item.name} (x${item.quantity || 1})`).join(', ')}</p>
            <p>Tổng tiền: ${order.total.toLocaleString('vi-VN')} VND (Phí ship: ${order.shippingFee.toLocaleString('vi-VN')} VND)</p>
            <p>Phương thức giao: ${order.shipping === 'express' ? 'Hỏa tốc' : 'Bình thường'}</p>
            <div class="status-bar">
                <span class="status ${order.status === 'Đã thanh toán' ? 'completed' : 'pending'}">${order.status}</span>
            </div>
        `;
            ordersHistoryEl.appendChild(orderDiv);
        });
    }

    // Gọi hàm render khi load trang
    renderProfileOrders();
});