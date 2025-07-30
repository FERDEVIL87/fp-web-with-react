<template>
  <section class="pc-list-section-bs">
    <div class="container py-4 py-md-5">
      <div class="hardware-title-wrapper text-center mb-4">
        <h1 class="hardware-title-bs">Toko Laptop</h1>
      </div>

      <!-- ... Keranjang Belanja Global ... -->
      <div class="text-center my-4 py-3 border-top border-bottom border-secondary">
        <h4>Keranjang Belanja Global</h4>
        <p v-if="cartStore.items.length > 0">
          Total Item: {{ cartStore.items.reduce((acc, item) => acc + item.qty, 0) }} | Total Harga: <span class="text-success fw-bold">{{ formatPrice(cartStore.totalPrice) }}</span>
        </p>
        <p v-else class="text-muted">Keranjang belanja utama masih kosong.</p>
        <button class="btn btn-success btn-lg px-5" @click="goToCheckout">
           <i class="bi bi-cart-check-fill me-2"></i> Lihat Keranjang & Checkout
        </button>
      </div>

      <!-- ... Filters ... -->
      <div class="row justify-content-center mb-4">
        <div class="col-lg-10 col-xl-8">
          <div class="filters-bs p-3 rounded-3">
            <div class="row g-2 g-md-3 align-items-center">
              <div class="col-md">
                <input id="searchLaptop" type="text" v-model.trim="searchQuery" placeholder="Cari nama laptop..." class="form-control form-control-lg"/>
              </div>
              <div class="col-md-auto">
                <select id="categoryFilter" v-model="selectedCategoryFilter" class="form-select form-select-lg">
                  <option value="">Semua Kategori</option>
                  <option value="Low-End">Low-End</option>
                  <option value="Mid-Range">Mid-Range</option>
                  <option value="High-End">High-End</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-info" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Memuat data laptop...</p>
      </div>

      <!-- Content -->
      <div v-else>
        <div v-if="filteredLaptops.length > 0">
          <div v-for="categoryData in categoriesWithLaptopsAndPagination" :key="categoryData.name" class="category-section-bs mb-5">
            <div class="category-header-bs text-center">
              <h3 class="category-title-bs">{{ categoryData.name }}</h3>
            </div>
            <div class="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-3 g-lg-4 justify-content-center">
              <div v-for="laptop in categoryData.paginatedLaptops" :key="laptop.id" class="col d-flex align-items-stretch">
                <div class="card h-100 card-bs" @click="openModal(laptop)" role="button" tabindex="0">
                  <div class="card-img-wrapper-bs">
                    <img :src="getImageUrl(laptop.image)" :alt="`Gambar ${laptop.name}`" class="card-img-top card-img-bs" />
                  </div>
                  <div class="card-body d-flex flex-column p-3">
                    <h4 class="card-title card-title-bs mb-2">{{ laptop.name }}</h4>
                    <p class="card-text-desc-bs small mb-2">{{ laptop.description.split(',')[0] }}</p>
                     <div class="mt-auto"> 
                      <p class="card-text card-text-price-bs mb-2"><strong>Harga:</strong> {{ formatPrice(laptop.price) }}</p>
                      <button v-if="laptop.stock > 0" class="btn btn-sm btn-primary w-100" @click.stop="openModal(laptop)">
                          <i class="bi bi-cart-plus-fill me-1"></i> Pilih & Checkout
                      </button>
                      <button v-else class="btn btn-sm btn-secondary w-100" disabled>Stok Habis</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- Pagination controls per category -->
            <div v-if="categoryData.laptops.length > itemsPerPage" class="d-flex justify-content-center my-3">
              <nav>
                <ul class="pagination pagination-sm mb-0">
                  <li class="page-item" :class="{ disabled: categoryPageMap[categoryData.name] === 1 }">
                    <button class="page-link" @click="changeCategoryPage(categoryData.name, categoryPageMap[categoryData.name] - 1)" :disabled="categoryPageMap[categoryData.name] === 1">Prev</button>
                  </li>
                  <li
                    v-for="page in categoryData.totalPages"
                    :key="page"
                    class="page-item"
                    :class="{ active: categoryPageMap[categoryData.name] === page }"
                  >
                    <button class="page-link" @click="changeCategoryPage(categoryData.name, page)">{{ page }}</button>
                  </li>
                  <li class="page-item" :class="{ disabled: categoryPageMap[categoryData.name] === categoryData.totalPages }">
                    <button class="page-link" @click="changeCategoryPage(categoryData.name, categoryPageMap[categoryData.name] + 1)" :disabled="categoryPageMap[categoryData.name] === categoryData.totalPages">Next</button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
        <div v-else class="no-results-bs text-center py-5">
          <p>Tidak ada laptop yang cocok dengan kriteria pencarian Anda.</p>
        </div>
      </div>
      
      <!-- Modal -->
      <div class="modal fade" id="laptopDetailModalBs" tabindex="-1" ref="laptopDetailModalRef">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content modal-content-bs">
            <div class="modal-header modal-header-bs">
              <h5 class="modal-title w-100 text-center">{{ selectedLaptopForModal?.name }}</h5>
              <button type="button" class="btn-close" @click="closeModal"></button>
            </div>
            <div class="modal-body modal-body-bs">
              <div v-if="selectedLaptopForModal" class="row g-3">
                <div class="col-lg-5 text-center">
                  <img :src="getImageUrl(selectedLaptopForModal.image)" :alt="`Gambar ${selectedLaptopForModal.name}`" class="img-fluid rounded" />
                </div>
                <div class="col-lg-7">
                  <p><strong>Kategori:</strong> {{ selectedLaptopForModal.category }}</p>
                  <p><strong>Brand:</strong> {{ selectedLaptopForModal.brand }}</p>
                  <p><strong>Harga:</strong> {{ formatPrice(selectedLaptopForModal.price) }}</p>
                  <p><strong>Stok:</strong> <span :class="{'text-stock-ready-bs': selectedLaptopForModal.stock > 0, 'text-stock-kosong-bs': selectedLaptopForModal.stock <= 0}">{{ selectedLaptopForModal.stock > 0 ? `Tersedia (${selectedLaptopForModal.stock})` : 'Kosong' }}</span></p>
                  <h4>Spesifikasi:</h4>
                  <p>{{ selectedLaptopForModal.description }}</p>
                  <div class="d-flex align-items-center gap-3 mt-4">
                    <div class="input-group" style="max-width: 140px;">
                      <label for="checkoutQtyInput" class="input-group-text">Qty:</label>
                      <input id="checkoutQtyInput" type="number" min="1" :max="selectedLaptopForModal.stock" v-model.number="checkoutQty" class="form-control" :disabled="selectedLaptopForModal.stock <= 0"/>
                    </div>
                    <button type="button" class="btn btn-primary" :disabled="selectedLaptopForModal.stock <= 0" @click="addItemToCart(selectedLaptopForModal)">
                      <i class="bi bi-cart-plus-fill me-1"></i> Tambah ke Keranjang
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<script>
import { Modal } from 'bootstrap';
import { cartStore } from '@/store/cartStore';
import { useRouter } from 'vue-router';
import apiClient from '@/services/api.js'; // Impor apiClient
import '@/assets/Laptop.css';

export default {
  name: "LaptopListSection",
  setup() {
    const router = useRouter();
    return { router, cartStore };
  },
  data() {
    return {
      laptops: [],
      searchQuery: "",
      selectedCategoryFilter: "",
      selectedLaptopForModal: null,
      bootstrapLaptopModal: null,
      checkoutQty: 1,
      loading: true,
      categoryPageMap: {
        'Low-End': 1,
        'Mid-Range': 1,
        'High-End': 1,
      },
      itemsPerPage: 15,
      pagination: {
        total: 0,
        pages: 0,
        currentPage: 1,
      },
    };
  },
  // Menggunakan created() hook untuk mengambil data saat komponen dibuat
  async created() {
    await this.fetchLaptops();
  },
  mounted() {
    // Inisialisasi modal setelah komponen di-mount
    const modalElement = this.$refs.laptopDetailModalRef;
    if (modalElement) {
      this.bootstrapLaptopModal = new Modal(modalElement);
    }
  },
  computed: {
    filteredLaptops() {
      if (this.loading) return []; // Jangan filter jika masih loading
      return this.laptops.filter((laptop) => {
        const matchesSearch = laptop.name.toLowerCase().includes(this.searchQuery.toLowerCase());
        const matchesCategory = this.selectedCategoryFilter ? laptop.category === this.selectedCategoryFilter : true;
        return matchesSearch && matchesCategory;
      });
    },
    categoriesWithLaptops() {
      const uniqueCategories = ["Low-End", "Mid-Range", "High-End"];
      return uniqueCategories
        .map(categoryName => ({
          name: categoryName,
          laptops: this.filteredLaptops.filter(laptop => laptop.category === categoryName),
        }))
        .filter(category => category.laptops.length > 0);
    },
    categoriesWithLaptopsAndPagination() {
      // Gabungkan kategori dengan pagination
      const categories = ["Low-End", "Mid-Range", "High-End"];
      return categories
        .map(categoryName => {
          const laptops = this.filteredLaptops.filter(laptop => laptop.category === categoryName);
          const totalPages = Math.ceil(laptops.length / this.itemsPerPage) || 1;
          const currentPage = this.categoryPageMap[categoryName] || 1;
          const start = (currentPage - 1) * this.itemsPerPage;
          const end = start + this.itemsPerPage;
          return {
            name: categoryName,
            laptops,
            paginatedLaptops: laptops.slice(start, end),
            totalPages,
          };
        })
        .filter(category => category.laptops.length > 0);
    },
  },
  methods: {
    getImageUrl(imagePath) {
      // Jika url sudah lengkap (dari link eksternal), gunakan langsung
      if (!imagePath || imagePath.startsWith('http')) {
        return imagePath || 'https://placehold.co/400x300?text=No+Image';
      }
      // Jika url adalah path lokal (dari upload), gabungkan dengan URL backend
      const backendUrl = 'http://127.0.0.1:8000'; // Sesuaikan jika perlu
      return `${backendUrl}${imagePath}`;
    },
    // ==========================================================
    // METODE BARU UNTUK MENGAMBIL DATA DARI LARAVEL
    // ==========================================================
    async fetchLaptops() {
      this.loading = true;
      try {
        // Gunakan apiClient untuk memanggil endpoint /laptops
        const response = await apiClient.get('/laptops');
        this.laptops = response.data.data.map(laptop => ({
          ...laptop,
          // Pastikan tipe data number untuk harga dan stok
          price: Number(laptop.price),
          stock: Number(laptop.stock) || 0,
        }));
        this.pagination = {
          total: response.data.total,
          pages: response.data.pages,
          currentPage: response.data.currentPage,
        };
      } catch (error) {
        console.error("Gagal memuat data laptop dari Laravel:", error);
        alert("Gagal memuat data laptop. Pastikan server backend berjalan.");
        this.laptops = []; // Kosongkan data jika gagal
        this.pagination = { total: 0, pages: 0, currentPage: 1 };
      } finally {
        this.loading = false;
      }
    },
    // ==========================================================

    formatPrice(value) {
      if (typeof value !== "number") return 'Rp 0';
      return `Rp ${new Intl.NumberFormat('id-ID').format(value)}`;
    },
    openModal(laptop) {
      this.selectedLaptopForModal = laptop;
      this.checkoutQty = 1;
      if (this.bootstrapLaptopModal) this.bootstrapLaptopModal.show();
    },
    closeModal() {
      if (this.bootstrapLaptopModal) this.bootstrapLaptopModal.hide();
    },
    goToCheckout() {
      if (cartStore.items.length === 0) {
        alert("Keranjang belanja Anda kosong.");
        return;
      }
      this.router.push('/checkout');
    },
    addItemToCart(laptop) {
      if (!laptop || this.checkoutQty < 1 || this.checkoutQty > laptop.stock) {
        alert("Jumlah tidak valid atau stok tidak mencukupi.");
        return;
      }
      cartStore.addItem({
        id: String(laptop.id),
        source: 'laptop',
        name: laptop.name,
        price: Number(laptop.price),
        qty: this.checkoutQty,
        category: laptop.category,
        brand: laptop.brand,
        image: laptop.image,
        specification: laptop.description
      });
      alert(`${laptop.name} (x${this.checkoutQty}) telah ditambahkan ke keranjang!`);
      this.closeModal();
    },
    changeCategoryPage(categoryName, page) {
      const category = this.categoriesWithLaptopsAndPagination.find(cat => cat.name === categoryName);
      if (!category) return;
      if (page < 1 || page > category.totalPages) return;
      this.$set(this.categoryPageMap, categoryName, page);
      // Optional: scroll to top of category section after page change
      this.$nextTick(() => {
        const section = this.$el.querySelector(`.category-title-bs:contains('${categoryName}')`);
        if (section) section.scrollIntoView({ behavior: 'smooth' });
      });
    },
  },
  watch: {
    // Reset page ke 1 jika filter berubah
    searchQuery() {
      this.categoryPageMap = { 'Low-End': 1, 'Mid-Range': 1, 'High-End': 1 };
    },
    selectedCategoryFilter() {
      this.categoryPageMap = { 'Low-End': 1, 'Mid-Range': 1, 'High-End': 1 };
    },
  },
};
</script>

<style scoped>
.text-muted{
  color: #fff !important;
}
</style>