<template>
  <section class="container py-4">
    <h1 class="text-center fw-bold mb-4" style="font-family:'Orbitron',sans-serif;color:#fff;min-height:2.5em;will-change: transform;">
      ULTIMATE LAPTOPS HUB
    </h1>

    <div class="text-center my-4 py-3 border-top border-bottom border-secondary">
        <h2 class="mb-3" style="font-family:'Orbitron',sans-serif;color:#fff;">Keranjang Belanja Global</h2>
        <p v-if="cartStore.items.length > 0" class="mb-2" style="color:#1aff6b;">
          Total Item: {{ cartStore.items.reduce((acc, item) => acc + item.qty, 0) }} | Total Harga: <span style="color:#1aff6b;font-weight:bold;">{{ formatPrice(cartStore.totalPrice) }}</span>
        </p>
        <p v-else class="mb-2" style="color:#b0b0b0;">Keranjang belanja utama masih kosong.</p>
        <button class="btn btn-success btn-lg px-5" @click="goToCheckout" style="font-family:'Orbitron',sans-serif;">
           <i class="bi bi-cart-check-fill me-2"></i> Lihat Keranjang & Checkout
        </button>
      </div>

    <div class="d-flex flex-wrap justify-content-center gap-2 mb-4">
      <button
        v-for="(card, index) in cards"
        :key="index"
        class="btn btn-outline-info px-3 py-1 fw-bold"
        :class="{ active: selectedCategory && selectedCategory.title === card.title }"
        @click="selectCategory(card)"
      >
        {{ card.title }}
      </button>
    </div>

    <div v-if="selectedCategory" class="bg-dark bg-opacity-85 rounded-3 p-3 mb-4" style="background:#181c22 !important;min-height:350px;">
      <h2 class="text-center fw-bold mb-3" style="font-family:'Orbitron',sans-serif;color:#fff;">
        {{ selectedCategory.title }}
      </h2>
      <!-- ... sisa template filter ... -->
      <div class="row g-2 align-items-center mb-2">
        <div class="col-12 col-md-6">
          <input type="text" v-model="searchQuery" placeholder="Search laptop..." class="form-control bg-secondary bg-opacity-25 text-light border-info" autocomplete="off"/>
        </div>
        <div class="col-12 col-md-6">
          <select v-model="selectedBrand" class="form-select bg-secondary bg-opacity-25 text-light border-info">
            <option value="">All Brands</option>
            <option v-for="brand in brands" :key="brand" :value="brand">{{ brand }}</option>
          </select>
        </div>
      </div>
      <div class="mb-3">
        <label class="form-label text-light fw-bold d-block mb-1">Rentang Harga</label>
        <div class="d-flex align-items-center mb-1">
          <span class="me-2 text-light" style="min-width:100px;">{{ formatPrice(minPrice) }}</span>
          <input type="range" v-model.number="minPrice" :min="minSliderBound" :max="maxSliderBound" :step="priceStep" class="form-range" @input="maxPrice = Math.max(minPrice, maxPrice)"/>
        </div>
        <div class="d-flex align-items-center mb-1">
          <span class="me-2 text-light" style="min-width:100px;">{{ formatPrice(maxPrice) }}</span>
          <input type="range" v-model.number="maxPrice" :min="minSliderBound" :max="maxSliderBound" :step="priceStep" class="form-range" @input="minPrice = Math.min(minPrice, maxPrice)"/>
        </div>
      </div>


      <div v-if="loading" class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3 mt-2" style="min-height:320px;">
        <div v-for="n in 8" :key="n" class="col"><div class="card placeholder-card h-100"><div class="placeholder-img"></div></div></div>
      </div>
      <div v-else-if="laptops.length > 0" class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3 mt-2" style="min-height:320px;">
        <div v-for="laptop in laptops" :key="laptop.id" class="col">
          <div class="card h-100 border-info text-light d-flex flex-column" role="button" @click="showDetails(laptop)">
            <img :src="getImageUrl(laptop.image)" :alt="laptop.name" class="card-img-top" style="height:120px;object-fit:cover;background:#101829;" loading="lazy"/>
            <div class="card-body py-2 d-flex flex-column flex-grow-1">
              <h4 class="card-title fw-bold mb-1" style="font-family:'Orbitron',sans-serif;color:#fff;">{{ laptop.name }}</h4>
              <p class="mb-1"><span class="fw-semibold">Brand:</span> {{ laptop.brand }}</p>
              <p class="mb-1"><span class="fw-semibold">Stock:</span> <span :class="getStockClass(laptop.stock)">{{ laptop.stock }}</span></p>
              <p class="fw-bold mb-2">{{ formatPrice(laptop.price) }}</p>
              <button class="btn btn-sm btn-info fw-bold mt-auto" @click.stop="addItemToCartFromCard(laptop)" :disabled="laptop.stock === 'Kosong' || laptop.stock === 0 || laptop.stock === '0'">
                <i class="bi bi-cart-plus-fill"></i> Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-center text-info py-4"><p>No laptops match your current filters.</p></div>

      <!-- Pagination controls -->
      <div v-if="pagination.pages > 1" class="d-flex justify-content-center my-3">
        <nav>
          <ul class="pagination pagination-sm mb-0">
            <li class="page-item" :class="{ disabled: pagination.currentPage === 1 }">
              <button class="page-link" @click="changePage(pagination.currentPage - 1)" :disabled="pagination.currentPage === 1">Prev</button>
            </li>
            <li
              v-for="page in pagination.pages"
              :key="page"
              class="page-item"
              :class="{ active: pagination.currentPage === page }"
            >
              <button class="page-link" @click="changePage(page)">{{ page }}</button>
            </li>
            <li class="page-item" :class="{ disabled: pagination.currentPage === pagination.pages }">
              <button class="page-link" @click="changePage(pagination.currentPage + 1)" :disabled="pagination.currentPage === pagination.pages">Next</button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
    <div v-else class="text-center text-info py-4"><p>✨ Please select a category above to explore our awesome laptops! ✨</p></div>

    <div class="modal fade" id="consoleDetailModal" tabindex="-1" ref="consoleModalRef">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content bg-dark text-light">
          <div class="modal-header border-0 pb-0">
            <h3 class="modal-title w-100 text-center fw-bold" style="font-family:'Orbitron',sans-serif;color:#fff;">{{ selectedProduct?.name }}</h3>
            <button type="button" class="btn-close btn-close-white" @click="closeDetails"></button>
          </div>
          <div class="modal-body">
            <img v-if="selectedProduct" :src="getImageUrl(selectedProduct.image)" :alt="selectedProduct.name" class="d-block mx-auto mb-3 rounded" style="max-width:220px;max-height:120px;object-fit:contain;background:#101829;" loading="lazy"/>
            <div v-if="selectedProduct" class="mb-2">
              <p class="mb-1"><strong>Price:</strong> <span>{{ formatPrice(selectedProduct.price) }}</span></p>
              <p class="mb-1"><strong>Brand:</strong> <span>{{ selectedProduct.brand }}</span></p>
              <p class="mb-1"><strong>Stock:</strong> <span :class="getStockClass(selectedProduct.stock)">{{ selectedProduct.stock }}</span></p>
            </div>
            <div v-if="selectedProduct?.specs && selectedProduct.specs.length > 0">
              <p class="fw-bold text-info mb-1">Features:</p>
              <ul class="ps-3 mb-0">
                <li v-for="(feature, index) in selectedProduct.specs" :key="index">{{ feature }}</li>
              </ul>
            </div>
            <div v-else-if="selectedProduct"><p class="text-muted">No additional features listed.</p></div>
            <div v-if="selectedProduct && (selectedProduct.stock !== 'Kosong' && Number(selectedProduct.stock) > 0)" class="mt-3 pt-3 border-top border-secondary">
                <div class="d-flex align-items-center justify-content-center gap-2 mb-2">
                    <label class="form-label mb-0">Qty:</label>
                    <input type="number" v-model.number="modalQuantity" min="1" :max="selectedProduct.stock === 'Ready' ? 99 : selectedProduct.stock" class="form-control form-control-sm bg-secondary bg-opacity-25 text-light border-info" style="width: 70px;"/>
                </div>
                <button class="btn btn-info w-100 fw-bold" @click="addItemToCartFromModal(selectedProduct)">Add to Cart</button>
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
import apiClient from '@/services/api.js';
import '@/assets/console.css';

export default {
  name: "LaptopsHub", // Nama diubah
  setup() {
    const router = useRouter();
    return { router, cartStore };
  },
  data() {
    return {
      cards: [ // Kategori dapat disesuaikan untuk laptop
        { title: "Gaming Laptops" },
        { title: "Business Laptops" },
        { title: "Ultrabooks" },
        { title: "Workstation Laptops" },
      ],
      selectedCategory: null,
      searchQuery: "",
      selectedBrand: "",
      minPrice: 0,
      maxPrice: 50000000,
      priceStep: 500000,
      selectedProduct: null,
      bootstrapModalInstance: null,
      laptops: [], // Data akan diisi dari API
      loading: true,
      modalQuantity: 1,
      pagination: { // State paginasi dari server
          total: 0,
          pages: 0,
          currentPage: 1
      },
    };
  },
  async mounted() {
    await this.fetchLaptops();
    const modalElement = this.$refs.consoleModalRef;
    if (modalElement) {
      this.bootstrapModalInstance = new Modal(modalElement);
    }
  },
  computed: {
    brands() {
      if (!this.selectedCategory) return [];
      // Idealnya, daftar merek harus berasal dari API.
      // Untuk saat ini, kita akan membuatnya dari data yang diambil di halaman saat ini.
      const uniqueBrands = new Set(this.laptops.map(l => l.brand));
      return [...uniqueBrands].sort();
    },
    minSliderBound() { return 0; },
    maxSliderBound() {
      // Batas atas slider bisa ditetapkan secara statis atau dari API
      return 50000000;
    },
  },
  methods: {
    async fetchLaptops() {
      this.loading = true;
      try {
        const params = {
            page: this.pagination.currentPage,
            search: this.searchQuery,
            brand: this.selectedBrand,
            category: this.selectedCategory?.title,
            min_price: this.minPrice,
            max_price: this.maxPrice,
        };
        
        // Menggunakan apiClient untuk memanggil endpoint /laptops
        const response = await apiClient.get('/laptops', { params });
        
        // TERAPKAN LOGIKA DARI SNIPPET
        this.laptops = response.data.data; // Mengambil data dari properti 'data'
        this.pagination = {
            total: response.data.total,
            pages: response.data.last_page, // Sesuaikan dengan nama properti dari Laravel (biasanya last_page)
            currentPage: response.data.current_page // Sesuaikan dengan nama properti dari Laravel
        };

        if (this.cards.length > 0 && !this.selectedCategory) {
            this.selectCategory(this.cards[0]);
        }
      } catch (error) {
        console.error("Gagal memuat data laptop dari Laravel:", error);
        alert("Gagal memuat data. Pastikan server backend berjalan.");
      } finally {
        this.loading = false;
      }
    },
    updatePriceSliderBounds() {
        this.$nextTick(() => {
          this.maxPrice = this.maxSliderBound;
          this.minPrice = this.minSliderBound;
        });
    },
    selectCategory(category) {
      this.selectedCategory = category;
      this.pagination.currentPage = 1; // Reset ke halaman pertama saat kategori berubah
      this.fetchLaptops(); // Ambil data untuk kategori baru
    },
    formatPrice(price) {
      return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price || 0);
    },
    showDetails(laptop) {
      this.selectedProduct = laptop;
      this.modalQuantity = 1;
      if (this.bootstrapModalInstance) this.bootstrapModalInstance.show();
    },
    closeDetails() {
      if (this.bootstrapModalInstance) this.bootstrapModalInstance.hide();
    },
    getStockClass(stock) {
      return Number(stock) > 0 ? 'text-success fw-bold' : 'text-danger fw-bold';
    },
    addItemToCart(laptop, quantity) {
        if (!laptop || quantity < 1) return;
        const stockNumber = Number(laptop.stock);
        if (isNaN(stockNumber) || stockNumber < quantity) {
            alert(`Stok tidak mencukupi.`);
            return;
        }
        const itemToAdd = {
            id: String(laptop.id),
            source: 'laptop', // sumber diubah
            name: laptop.name,
            price: Number(laptop.price),
            qty: quantity,
            category: laptop.category,
            brand: laptop.brand,
            image: laptop.image,
            specification: Array.isArray(laptop.specs) ? laptop.specs.join(', ') : 'N/A'
        };
        cartStore.addItem(itemToAdd);
        alert(`${laptop.name} (x${quantity}) ditambahkan ke keranjang!`);
    },
    addItemToCartFromCard(laptop) {
        this.addItemToCart(laptop, 1);
    },
    addItemToCartFromModal(laptop) {
        this.addItemToCart(laptop, this.modalQuantity);
        this.closeDetails();
    },
    goToCheckout() {
      if (cartStore.items.length === 0) {
        alert("Keranjang belanja Anda kosong.");
        return;
      }
      this.router.push('/checkout');
    },
    getImageUrl(imagePath) {
      if (!imagePath || imagePath.startsWith('http')) {
        return imagePath || 'https://placehold.co/400x300?text=No+Image';
      }
      const backendUrl = 'http://127.0.0.1:8000';
      return `${backendUrl}${imagePath}`;
    },
    changePage(page) {
      if (page < 1 || page > this.pagination.pages) return;
      this.pagination.currentPage = page;
      this.fetchLaptops(); // Ambil data untuk halaman baru
    },
  },
  watch: {
    // Panggil API lagi saat filter berubah
    searchQuery() { this.pagination.currentPage = 1; this.fetchLaptops(); },
    selectedBrand() { this.pagination.currentPage = 1; this.fetchLaptops(); },
    minPrice() { this.pagination.currentPage = 1; this.fetchLaptops(); },
    maxPrice() { this.pagination.currentPage = 1; this.fetchLaptops(); },
  }
};
</script>