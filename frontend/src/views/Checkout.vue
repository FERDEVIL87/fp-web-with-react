<template>
  <div class="checkout-container">
    <h2>Checkout Pesanan</h2>

    <!-- OVERLAY SAAT LOADING PEMBAYARAN -->
    <div v-if="isLoadingPayment" class="payment-loading-overlay">
      <div class="spinner"></div>
      <p>Menyimpan pesanan Anda...</p>
    </div>

    <!-- KOTAK STATUS SETELAH CHECKOUT -->
    <div v-if="paymentStatusMessage" :class="['payment-status-message', paymentSuccess ? 'success' : 'error']">
      <p v-html="paymentStatusMessage.replace(/\n/g, '<br>')"></p>
      <button v-if="paymentSuccess" @click="resetAndGoHome" class="btn-small-action">
        Kembali ke Beranda
      </button>
      <button v-else @click="resetPaymentStatus" class="btn-small-action">
        Coba Lagi
      </button>
    </div>

    <!-- KONTEN UTAMA CHECKOUT -->
    <div v-if="!isLoadingPayment && !paymentStatusMessage">
      <div v-if="cartStore.items.length === 0" class="empty-cart-message">
        <p>Keranjang belanja Anda kosong.</p>
        <p>Silakan tambahkan produk terlebih dahulu untuk melanjutkan.</p>
      </div>
      
      <form @submit.prevent="handleFinalCheckout" v-else>
        
        <!-- FORM DATA PEMBELI -->
        <div class="customer-details-form">
          <h4>Detail Pengiriman</h4>
          <div class="form-group">
            <label for="customer_name">Nama Lengkap</label>
            <input type="text" id="customer_name" v-model="customer.name" class="form-control-checkout" required>
          </div>
          <div class="form-group">
            <label for="customer_address">Alamat Lengkap</label>
            <textarea id="customer_address" v-model="customer.address" class="form-control-checkout" rows="3" required></textarea>
          </div>
          <div class="form-group">
            <label for="customer_phone">Nomor HP</label>
            <input type="tel" id="customer_phone" v-model="customer.phone" class="form-control-checkout" required>
          </div>
        </div>
        
        <!-- RINGKASAN PESANAN -->
        <h4>Ringkasan Pesanan</h4>
        <div class="table-responsive">
          <table class="checkout-table">
            <thead>
              <tr>
                <th>Gambar</th>
                <th>Nama Pesanan</th>
                <th>Jumlah</th>
                <th>Subtotal</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in cartStore.items" :key="`${item.source}-${item.id}`">
                <td data-label="Gambar"><img v-if="item.image" :src="getImageUrl(item.image)" :alt="item.name" class="checkout-item-image"/></td>
                <td data-label="Nama Pesanan">{{ item.name }}</td>
                <td data-label="Jumlah">
                  <input type="number" :value="item.qty" @input="updateQuantity(`${item.source}-${item.id}`, $event.target.value)" min="1" class="qty-input"/>
                </td>
                <td data-label="Subtotal">Rp{{ ((Number(item.price) || 0) * (Number(item.qty) || 0)).toLocaleString('id-ID') }}</td>
                <td data-label="Aksi">
                  <button type="button" @click="removeItem(`${item.source}-${item.id}`)" class="remove-item-button">Hapus</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- TOMBOL KONFIRMASI -->
        <div class="checkout-summary">
          <p class="total-text"><strong>Total Keseluruhan: Rp{{ cartStore.totalPrice.toLocaleString('id-ID') }}</strong></p>
          <button type="submit" :disabled="cartStore.items.length === 0 || isLoadingPayment">
            {{ isLoadingPayment ? 'Memproses...' : 'Konfirmasi Pesanan' }}
          </button>
        </div>
      </form>
    </div>

    <!-- BAGIAN CEK STATUS PESANAN -->
    <div class="status-checker-container mt-5">
      <h3>Cek Status Pesanan Anda</h3>
      <form @submit.prevent="checkOrderStatus">
        <div class="input-group">
          <input type="text" v-model="statusCheckName" class="form-control" placeholder="Masukkan Nama Lengkap Pemesan" required>
          <button class="btn btn-outline-info" type="submit" :disabled="loadingStatus">
            {{ loadingStatus ? 'Mencari...' : 'Cek Status' }}
          </button>
        </div>
      </form>
      <div v-if="loadingStatus" class="mt-3 text-center">Mencari pesanan...</div>
      <div v-if="statusError" class="mt-3 alert alert-danger">{{ statusError }}</div>
      <div v-if="Object.keys(orderHistory).length > 0" class="mt-4">
        <h4>Riwayat Pesanan untuk: {{ statusCheckName }}</h4>
        <div v-for="(items, transactionId) in orderHistory" :key="transactionId" class="order-history-card">
          <p><strong>ID Transaksi:</strong> {{ transactionId }}</p>
          <p><strong>Status:</strong> <span class="fw-bold">{{ items[0].status_order }}</span></p>
          <p><strong>Tanggal:</strong> {{ new Date(items[0].purchase_date).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' }) }}</p>
          <ul>
            <li v-for="item in items" :key="item.id">
              {{ item.product_name }} (x{{ item.quantity }})
              <span v-if="item.total_price">- Rp{{ Number(item.total_price).toLocaleString('id-ID') }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { cartStore } from '@/store/cartStore';
import apiClient from '@/services/api.js';
import '@/assets/co.css';

export default {
  setup() {
    return { cartStore };
  },
  data() {
    return {
      isLoadingPayment: false,
      paymentStatusMessage: '',
      paymentSuccess: false,
      customer: {
        name: '',
        address: '',
        phone: ''
      },
      statusCheckName: '',
      loadingStatus: false,
      statusError: '',
      orderHistory: {},
    };
  },
  methods: {
    getImageUrl(imagePath) {
      if (!imagePath) return '';
      if (imagePath.startsWith('http')) return imagePath;
      const backendUrl = apiClient.defaults.baseURL.replace('/api', '');
      return `${backendUrl}${imagePath}`;
    },
    updateQuantity(compositeId, newQuantity) {
      const qty = parseInt(newQuantity, 10);
      if (!isNaN(qty) && qty >= 1) { 
        cartStore.updateItemQuantity(compositeId, qty);
      }
    },
    removeItem(compositeId) {
      cartStore.removeItem(compositeId);
    },
    resetPaymentStatus() {
      this.paymentStatusMessage = '';
      this.paymentSuccess = false;
      this.isLoadingPayment = false;
    },
    resetAndGoHome() {
        this.resetPaymentStatus();
        this.$router.push('/');
    },
    async handleFinalCheckout() {
      if (cartStore.items.length === 0) return;

      if (!this.customer.name || !this.customer.address || !this.customer.phone) {
        alert("Harap isi semua detail pengiriman.");
        return;
      }

      this.isLoadingPayment = true;
      this.paymentStatusMessage = '';

      // **PAYLOAD DISESUAIKAN DENGAN BACKEND EXPRESS**
      const orderPayload = {
        customerDetails: {
          name: this.customer.name,
          address: this.customer.address,
          phone: this.customer.phone,
        },
        cart: cartStore.items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.qty, // Backend mengharapkan 'quantity'
          price: item.price,
        })),
      };

      try {
        const response = await apiClient.post('/checkout', orderPayload);
        
        this.paymentSuccess = true;
        this.paymentStatusMessage = `${response.data.message}\nID Transaksi Anda: ${response.data.transaction_id}`;
        
        cartStore.clearCart();
        
      } catch (error) {
        this.paymentSuccess = false;
        if (error.response?.data?.message) {
            this.paymentStatusMessage = `Gagal menyimpan pesanan: ${error.response.data.message}`;
        } else if (error.code === 'ERR_NETWORK') {
            this.paymentStatusMessage = 'Tidak dapat terhubung ke server. Pastikan server backend berjalan.';
        } else {
            this.paymentStatusMessage = 'Terjadi kesalahan teknis. Mohon coba kembali.';
        }
        console.error("Gagal mengirim checkout:", error);
      } finally {
        this.isLoadingPayment = false;
      }
    },
    async checkOrderStatus() {
      if (!this.statusCheckName) return;
      this.loadingStatus = true;
      this.statusError = '';
      this.orderHistory = {};
      try {
        // **ENDPOINT DAN PAYLOAD SUDAH SESUAI DENGAN BACKEND EXPRESS**
        const response = await apiClient.post('/order-status', { customer_name: this.statusCheckName });
        
        if (Object.keys(response.data).length === 0) {
            this.statusError = "Tidak ada riwayat pesanan yang ditemukan untuk nama ini.";
        } else {
            this.orderHistory = response.data;
        }
      } catch (error) {
        this.statusError = "Gagal mengambil data status pesanan.";
        console.error(error);
      } finally {
        this.loadingStatus = false;
      }
    }
  }
};
</script>