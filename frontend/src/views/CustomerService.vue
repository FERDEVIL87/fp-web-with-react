<template>
  <section class="py-5 bg-black min-vh-100 d-flex align-items-center justify-content-center">
    <div class="container d-flex justify-content-center align-items-center" style="min-height: 80vh;">
      <div class="card shadow-lg custom-card">
        <div class="card-body px-4 py-4">
          <div class="mb-4 pb-2 border-bottom border-info">
            <h2 class="mb-1 fw-bold text-info" style="font-size: 1.7rem;">Hubungi Kami</h2>
            <p class="desc-info mb-0">Kirim pertanyaan atau pesan lewat formulir ini.</p>
          </div>

          <!-- Tampilkan pesan sukses/error -->
          <div v-if="statusMessage" :class="['alert', isSuccess ? 'alert-success' : 'alert-danger']">
            {{ statusMessage }}
          </div>

          <!-- Gunakan v-if untuk menyembunyikan form setelah sukses -->
          <form @submit.prevent="submitForm" v-if="!isSuccess">
            <div class="mb-3 text-start">
              <label class="form-label text-info fw-semibold" for="name">Nama</label>
              <input v-model="form.name" id="name" type="text" class="form-control" placeholder="Nama Anda" required autocomplete="name">
            </div>
            <div class="mb-3 text-start">
              <label class="form-label text-info fw-semibold" for="email">Email</label>
              <input v-model="form.email" id="email" type="email" class="form-control" placeholder="Email Anda" required autocomplete="email">
            </div>
            <div class="mb-4 text-start">
              <label class="form-label text-info fw-semibold" for="message">Pesan</label>
              <textarea v-model="form.message" id="message" class="form-control" placeholder="Pesan Anda" rows="4" required></textarea>
            </div>
            <button type="submit" class="btn btn-info w-100 fw-bold" :disabled="isLoading">
              {{ isLoading ? 'Mengirim...' : 'Kirim' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
// 1. Impor apiClient terpusat kita
import apiClient from '@/services/api';
import '@/assets/cs.css';

export default {
  data() {
    return {
      // 2. Sesuaikan nama field agar cocok dengan Model Sequelize (`nama` dan `pesan`)
      form: {
        nama: '',
        email: '',
        pesan: ''
      },
      isLoading: false,
      statusMessage: '',
      isSuccess: false,
    };
  },
  methods: {
    async submitForm() {
      this.isLoading = true;
      this.statusMessage = '';
      this.isSuccess = false;

      try {
        // 3. Kirim data ke API Express menggunakan apiClient
        const response = await apiClient.post('/customer-service', this.form);

        // Jika berhasil
        this.isSuccess = true;
        this.statusMessage = response.data.message;

        // Kosongkan form setelah berhasil
        this.form.nama = '';
        this.form.email = '';
        this.form.pesan = '';

      } catch (error) {
        // Jika gagal
        this.isSuccess = false;
        if (error.response && error.response.data && error.response.data.message) {
          this.statusMessage = `Gagal mengirim: ${error.response.data.message}`;
        } else if (error.code === 'ERR_NETWORK') {
          this.statusMessage = 'Tidak dapat terhubung ke server. Pastikan backend berjalan.';
        } else {
          this.statusMessage = 'Terjadi kesalahan. Silakan coba lagi.';
        }
        console.error('Error submitting form:', error);
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>
