<template>
  <section class="container py-4">
    <h2 class="text-center fw-bold mb-4" style="font-family:'Orbitron',sans-serif;color:#fff;min-height:2.5em;">
      KOMPONEN HARDWARE
    </h2>

    
    <div class="text-center my-4 py-3 border-top border-bottom border-secondary">
        <h4 class="mb-3" style="font-family:'Orbitron',sans-serif;color:#fff;">Keranjang Belanja Global</h4>
        <p v-if="cartStore.items.length > 0" class="mb-2 text-light">
          Total Item: {{ cartStore.items.reduce((acc, item) => acc + item.qty, 0) }} | Total Harga: <span class="text-success fw-bold">{{ formatPrice(cartStore.totalPrice) }}</span>
        </p>
        <p v-else class="text-muted mb-2">Keranjang belanja utama masih kosong.</p>
        <button class="btn btn-success btn-lg px-5" @click="goToCheckout" style="font-family:'Orbitron',sans-serif;">
           <i class="bi bi-cart-check-fill me-2"></i> Lihat Keranjang & Checkout
        </button>
    </div>

    <div v-if="loading" class="text-center text-info py-5" style="font-family:'Orbitron',sans-serif;">
      <span>Loading data hardware...</span>
    </div>
    <template v-else>
      <div class="d-flex flex-wrap justify-content-center gap-2 mb-4">
        <button
          v-for="(card, index) in cards"
          :key="index"
          class="btn btn-outline-info px-3 py-1 fw-bold"
          :class="{ active: selectedCategory && selectedCategory.title === card.title }"
          style="font-family:'Orbitron',sans-serif;"
          @click="selectCategory(card)"
        >
          {{ card.title }}
        </button>
      </div>
      <div v-if="selectedCategory" class="bg-dark rounded-4 shadow-sm p-3 mb-4" style="background:#181c22 !important;min-height:240px;">
        <h3 class="text-center fw-bold mb-3" style="font-family:'Orbitron',sans-serif;color:#fff;">
          {{ selectedCategory.title }}
        </h3>
        <div class="row g-2 align-items-center mb-3">
          <div class="col-12 col-md-4 mb-2 mb-md-0">
            <label for="searchComponentInput" class="form-label visually-hidden">Cari Komponen</label>
            <input
              id="searchComponentInput"
              type="text"
              v-model="searchQuery"
              placeholder="Search Component"
              class="form-control form-control-sm bg-secondary bg-opacity-25 text-light border-info"
              autocomplete="off"
              aria-label="Cari komponen"
            />
          </div>
          <div class="col-12 col-md-4 mb-2 mb-md-0">
            <label for="brandSelect" class="form-label visually-hidden">Pilih Brand</label>
            <select
              id="brandSelect"
              v-model="selectedBrand"
              class="form-select form-select-sm bg-secondary bg-opacity-25 text-light border-info"
              aria-label="Pilih brand"
            >
              <option value="">All Brands</option>
              <option v-for="brand in filteredBrands" :key="brand" :value="brand">{{ brand }}</option>
            </select>
          </div>
          <div class="col-md-4">
            <label for="sortSelect" class="form-label visually-hidden">Urutkan</label>
            <select id="sortSelect" v-model="sortBy" class="form-select form-select-sm bg-secondary bg-opacity-25 text-light border-info" aria-label="Urutkan">
              <option disabled value="">Urutkan</option>
              <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
        </div>
        
        
        <div class="row align-items-center mb-3">
          <div class="col-12">
            <label class="form-label text-white d-block">Rentang Harga</label>
            <div class="mb-2">
              <label :for="'minPriceSlider-' + selectedCategory.title.replace(/\s+/g, '')" class="form-label text-white small">Min: {{ formatPrice(minPriceFilter) }}</label>
              <input
                :id="'minPriceSlider-' + selectedCategory.title.replace(/\s+/g, '')"
                type="range"
                class="form-range"
                :min="minPriceInCategory"
                :max="maxPriceInCategory"
                v-model.number="minPriceFilter"
                :step="priceStep"
                aria-label="Minimum harga"
                style="accent-color:#00d9ff;"
                @input="adjustMaxPriceFilter" 
              />
            </div>
            <div>
              <label :for="'maxPriceSlider-' + selectedCategory.title.replace(/\s+/g, '')" class="form-label text-white small">Max: {{ formatPrice(maxPriceFilter) }}</label>
              <input
                :id="'maxPriceSlider-' + selectedCategory.title.replace(/\s+/g, '')"
                type="range"
                class="form-range"
                :min="minPriceInCategory" 
                :max="maxPriceInCategory"
                v-model.number="maxPriceFilter"
                :step="priceStep"
                aria-label="Maksimum harga"
                style="accent-color:#00d9ff;"
                @input="adjustMinPriceFilter"
              />
            </div>
             <div class="d-flex justify-content-between text-white small mt-1">
              <span>Global Min: {{ formatPrice(minPriceInCategory) }}</span>
              <span>Global Max: {{ formatPrice(maxPriceInCategory) }}</span>
            </div>
          </div>
        </div>

        <div v-if="filteredHardware.length > 0" class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3 mt-2" style="min-height:120px;">
          <div
            v-for="item in paginatedHardware"
            :key="item.id"
            class="col d-flex align-items-stretch" 
          >
            <div
              class="card h-100 border-info d-flex flex-column" 
              role="button"
              tabindex="0"
              style="background:#232b36;color:#fff;cursor:pointer;"
            >
              <img
                :src="getImageUrl(item.image)"
                :alt="item.name"
                class="card-img-top"
                style="height:120px;width:100%;object-fit:cover;background:#101829;display:block;"
                loading="lazy"
                width="240"
                height="120"
                @click="showDetails(item)"
                @keydown.enter.prevent="showDetails(item)"
                @keydown.space.prevent="showDetails(item)"
              />
              <div class="card-body py-2 d-flex flex-column flex-grow-1">
                <h4 class="card-title fw-bold mb-1" style="font-family:'Orbitron',sans-serif;font-size:1rem;" @click="showDetails(item)">{{ item.name }}</h4>
                <p class="mb-1" @click="showDetails(item)"><span class="fw-semibold">Brand:</span> {{ item.brand }}</p>
                <p class="mb-1" @click="showDetails(item)">
                  <span class="fw-semibold">Stock:</span>
                  <span :class="getStockClass(item.stock)" :style="item.stock > 0 || item.stock === 'Ready' ? 'color:#1aff6b;' : 'color:#ff4d4d;'">
                    {{ item.stock === 'Ready' ? 'Ready' : (item.stock > 0 ? item.stock : 'Kosong') }}
                  </span>
                </p>
                <p class="fw-bold mb-2" @click="showDetails(item)" style="color:#fff;">{{ formatPrice(item.price) }}</p>
                <button 
                    class="btn btn-sm btn-info fw-bold mt-auto" 
                    style="font-family:'Orbitron',sans-serif;"
                    @click.stop="addItemToCartFromCard(item)"
                    :disabled="item.stock === 'Kosong' || item.stock === 0"
                >
                    <i class="bi bi-cart-plus-fill"></i> Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
        <!-- Pagination controls -->
        <div v-if="filteredHardware.length > itemsPerPage" class="d-flex justify-content-center my-3">
          <nav>
            <ul class="pagination pagination-sm mb-0">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="changePage(currentPage - 1)" :disabled="currentPage === 1">Prev</button>
              </li>
              <li
                v-for="page in totalPages"
                :key="page"
                class="page-item"
                :class="{ active: currentPage === page }"
              >
                <button class="page-link" @click="changePage(page)">{{ page }}</button>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button class="page-link" @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">Next</button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      <div v-else class="text-center text-info py-4" style="font-family:'Orbitron',sans-serif;min-height:80px;">
        <p>No hardware components match your current filters.</p>
      </div>
      <div v-else class="text-center text-info py-4" style="font-family:'Orbitron',sans-serif;">
        <p>✨ Please select a category above to explore our hardware components! ✨</p>
      </div>
      
      
      <div class="modal fade" id="hardwareDetailModal" tabindex="-1" aria-labelledby="hardwareDetailModalLabel" aria-hidden="true" ref="hardwareModalRef">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content bg-dark text-light">
            <div class="modal-header border-0 pb-0">
              <h3 class="modal-title w-100 text-center fw-bold" id="hardwareDetailModalLabel" style="font-family:'Orbitron',sans-serif;color:#fff;">
                {{ selectedProduct?.name }}
              </h3>
              <button type="button" class="btn-close btn-close-white" aria-label="Close" @click="closeDetails"></button>
            </div>
            <div class="modal-body">
              <img v-if="selectedProduct" :src="getImageUrl(selectedProduct.image)" :alt="selectedProduct.name" class="d-block mx-auto mb-3 rounded" style="max-width:220px;max-height:120px;object-fit:contain;background:#101829;" loading="lazy" width="220" height="120" />
              <div v-if="selectedProduct" class="mb-3">
                <p class="mb-1"><strong>Price:</strong> <span>{{ formatPrice(selectedProduct.price) }}</span></p>
                <p class="mb-1"><strong>Brand:</strong> <span>{{ selectedProduct.brand }}</span></p>
                <p class="mb-1"><strong>Stock:</strong> 
                  <span :class="getStockClass(selectedProduct.stock)" :style="selectedProduct.stock > 0 || selectedProduct.stock === 'Ready' ? 'color:#1aff6b;' : 'color:#ff4d4d;'">
                    {{ selectedProduct.stock === 'Ready' ? 'Ready' : (selectedProduct.stock > 0 ? selectedProduct.stock : 'Kosong') }}
                  </span>
                </p>
              </div>
              <div v-if="selectedProduct?.specs && selectedProduct.specs.length > 0">
                <p class="fw-bold text-info mb-1">Features:</p>
                <ul class="ps-3 mb-0">
                  <li v-for="(feature, index) in selectedProduct.specs" :key="index">{{ feature }}</li>
                </ul>
              </div>
              <div v-else-if="selectedProduct">
                 <p class="text-muted fst-italic">No specific features listed for this component.</p>
              </div>

            <div v-if="selectedProduct && (selectedProduct.stock > 0 || selectedProduct.stock === 'Ready')" class="mt-3 pt-3 border-top border-secondary">
                <div class="d-flex align-items-center justify-content-center gap-2 mb-2">
                    <label for="modalQtyHardware" class="form-label mb-0 text-light">Qty:</label>
                    <input 
                        type="number" 
                        id="modalQtyHardware" 
                        v-model.number="modalQuantity" 
                        min="1" 
                        :max="selectedProduct.stock === 'Ready' ? 99 : (typeof selectedProduct.stock === 'number' ? selectedProduct.stock : 99)"
                        class="form-control form-control-sm bg-secondary bg-opacity-25 text-light border-info" 
                        style="width: 70px;"
                    >
                </div>
                <button 
                    class="btn btn-info w-100 fw-bold" 
                    style="font-family:'Orbitron',sans-serif;"
                    @click="addItemToCartFromModal(selectedProduct)"
                >
                    <i class="bi bi-cart-plus-fill"></i> Add to Cart
                </button>
            </div>
            <div v-else-if="selectedProduct" class="mt-3 text-center">
                <p class="text-danger fw-bold">This item is currently out of stock.</p>
            </div>
            </div>
            <div class="modal-footer border-0 pt-0">
                <button type="button" class="btn btn-outline-secondary" @click="closeDetails">Close</button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>

<script>
import { Modal } from 'bootstrap';
import { cartStore } from '@/store/cartStore';
import { useRouter } from 'vue-router';
import apiClient from '@/services/api.js'; // Use centralized API client
import '@/assets/hardware.css';

export default {
  name: "HardwareList",
  setup() {
    const router = useRouter();
    return { router, cartStore };
  },
  data() {
    return {
      cards: [
        { title: "PROCESSOR INTEL" }, { title: "PROCESSOR AMD" }, { title: "MAINBOARD" },
        { title: "MEMORY" }, { title: "VGA" }, { title: "HDD" }, { title: "SSD" },
        { title: "PSU" }, { title: "CASE" }, { title: "LED MONITOR" }, { title: "MOUSE" },
        { title: "KEYBOARD" }, { title: "MOUSEPAD" }, { title: "WEBCAM" }, { title: "CABLE" },
        { title: "HEADSET" }, { title: "SPEAKER" }, { title: "USB FLASHDISK" }, { title: "PRINTER" },
      ],
      selectedCategory: null,
      searchQuery: "",
      selectedBrand: "",
      minPriceFilter: 0,
      maxPriceFilter: 0,
      selectedProduct: null,
      bootstrapModalInstance: null,
      sortBy: 'lowToHigh',
      sortOptions: [
        { value: 'lowToHigh', label: 'Harga Termurah' },
        { value: 'highToLow', label: 'Harga Termahal' }
      ],
      allHardware: [],
      loading: true,
      modalQuantity: 1,
      currentPage: 1,
      itemsPerPage: 50,
    };
  },
  computed: {
    priceStep() {
      const range = this.maxPriceInCategory - this.minPriceInCategory;
      if (range <= 0) return 50000;
      return Math.max(50000, Math.floor(range / 100 / 50000) * 50000 || 50000);
    },
    filteredBrands() {
      if (!this.selectedCategory || !this.allHardware.length) return [];
      const itemsInCategory = this.allHardware.filter(item => item.category === this.selectedCategory.title);
      return [...new Set(itemsInCategory.map(item => item.brand))].sort();
    },
    minPriceInCategory() {
        if (!this.selectedCategory || !this.allHardware.length) return 0;
        const itemsInCategory = this.allHardware.filter(item => item.category === this.selectedCategory.title);
        if (itemsInCategory.length === 0) return 0;
        return Math.min(...itemsInCategory.map(item => Number(item.price) || 0), 0);
    },
    maxPriceInCategory() {
        if (!this.selectedCategory || !this.allHardware.length) return 10000000;
        const itemsInCategory = this.allHardware.filter(item => item.category === this.selectedCategory.title);
        if (itemsInCategory.length === 0) return 10000000;
        const max = Math.max(...itemsInCategory.map(item => Number(item.price) || 0), 0);
        return max > 0 ? max : 10000000;
    },
    filteredHardware() {
      if (!this.selectedCategory || !this.allHardware.length) return [];
      let filtered = this.allHardware.filter(
        item => item.category.toUpperCase() === this.selectedCategory.title.toUpperCase()
      );
      if (this.searchQuery) {
        filtered = filtered.filter(item =>
          item.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }
      if (this.selectedBrand) {
        filtered = filtered.filter(item => item.brand === this.selectedBrand);
      }
      
      filtered = filtered.filter(item => 
        (Number(item.price) || 0) >= this.minPriceFilter &&
        (Number(item.price) || 0) <= this.maxPriceFilter
      );
      
      if (this.sortBy === 'highToLow') {
        filtered.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
      } else {
        filtered.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
      }
      return filtered;
    },
    paginatedHardware() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredHardware.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredHardware.length / this.itemsPerPage) || 1;
    },
  },
  methods: {
    async fetchHardwareData() {
        this.loading = true;
        try {
            // 1. Panggil endpoint API Express yang benar: /pc-parts
            const response = await apiClient.get('/pc-parts', {
                params: {
                    // Kirim parameter untuk mengambil SEMUA data sekaligus
                    // Backend akan menangani filtering dan pagination di sisi klien
                    limit: 1000 // Ambil hingga 1000 item
                }
            });

            // 2. Ambil data dari properti `response.data.data`
            this.allHardware = response.data.data.map(item => ({
                ...item,
                price: Number(item.price) || 0,
                // Pastikan stock adalah number jika memungkinkan
                stock: isNaN(Number(item.stock)) ? item.stock : Number(item.stock),
            }));
        } catch (error) {
            console.error("Gagal memuat data dari API Express:", error);
            if (error.code === "ERR_NETWORK") {
                alert("Tidak dapat terhubung ke server backend. Pastikan server Express (nodemon index.js) sedang berjalan.");
            }
            this.allHardware = [];
        } finally {
            this.loading = false;
        }
    },

    getImageUrl(imagePath) {
        if (!imagePath) {
            return 'https://placehold.co/400x300?text=No+Image';
        }
        if (imagePath.startsWith('http')) {
            return imagePath;
        }
        // Ambil baseURL dari instance apiClient agar dinamis
        const backendUrl = apiClient.defaults.baseURL.replace('/api', '');
        return `${backendUrl}${imagePath}`;
    },

    // ... SEMUA METODE LAINNYA (changePage, selectCategory, formatPrice, dll.)
    // TIDAK PERLU DIUBAH SAMA SEKALI.
    // Komponen Anda sudah melakukan filtering, sorting, dan pagination di sisi klien,
    // yang mana ini sangat efisien.
    changePage(page) {
      if (page < 1 || page > this.totalPages) return;
      this.currentPage = page;
      this.$nextTick(() => {
        const productList = this.$el.querySelector('.row.row-cols-1');
        if (productList) productList.scrollIntoView({ behavior: 'smooth' });
      });
    },
    selectCategory(category) {
      this.selectedCategory = category;
      this.searchQuery = "";
      this.selectedBrand = "";
      this.sortBy = 'lowToHigh';
      this.currentPage = 1; 
      this.$nextTick(() => {
        this.minPriceFilter = this.minPriceInCategory;
        this.maxPriceFilter = this.maxPriceInCategory;
      });
    },
    formatPrice(price) {
      if (typeof price !== 'number' || isNaN(price)) {
        return 'Rp 0';
      }
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price);
    },
    showDetails(item) {
      this.selectedProduct = item;
      this.modalQuantity = 1; 
      if (this.bootstrapModalInstance) this.bootstrapModalInstance.show();
    },
    closeDetails() {
      if (this.bootstrapModalInstance) this.bootstrapModalInstance.hide();
    },
    getStockClass(stock) {
      if (stock > 0 || stock === 'Ready') return 'fw-bold'; 
      return 'fw-bold'; 
    },
    addItemToCart(item, quantity) {
        if (!item || quantity < 1) {
            alert("Item atau kuantitas tidak valid.");
            return;
        }
        const isStockAvailable = (typeof item.stock === 'number' && item.stock > 0) || item.stock === 'Ready';
        if (!isStockAvailable) {
            alert(`Item ini sedang habis.`);
            return;
        }
        if (typeof item.stock === 'number' && quantity > item.stock) {
             alert(`Kuantitas (x${quantity}) melebihi stok yang tersedia (${item.stock}).`);
            return;
        }
        const itemToAdd = {
            id: String(item.id),
            source: 'hardware', 
            name: item.name,
            price: Number(item.price), 
            qty: quantity,
            category: item.category, 
            brand: item.brand,
            image: item.image,
            specification: item.specs && Array.isArray(item.specs) ? item.specs.join(', ') : 'N/A'
        };
        cartStore.addItem(itemToAdd);
        alert(`${item.name} (x${quantity}) telah ditambahkan ke keranjang!`);
    },
    addItemToCartFromCard(item) {
        this.addItemToCart(item, 1);
    },
    addItemToCartFromModal(item) {
        this.addItemToCart(item, this.modalQuantity);
        this.closeDetails();
    },
    goToCheckout() {
      if (cartStore.items.length === 0) {
        alert("Keranjang belanja Anda kosong. Silakan tambahkan produk terlebih dahulu.");
        return;
      }
      this.router.push('/checkout');
    },
    adjustMaxPriceFilter() {
        if (this.minPriceFilter > this.maxPriceFilter) {
            this.maxPriceFilter = this.minPriceFilter;
        }
    },
    adjustMinPriceFilter() {
        if (this.maxPriceFilter < this.minPriceFilter) {
            this.minPriceFilter = this.maxPriceFilter;
        }
    },
  },
  async mounted() {
    await this.fetchHardwareData(); 
    
    const modalElement = this.$refs.hardwareModalRef; 
    if (modalElement) {
      this.bootstrapModalInstance = new Modal(modalElement);
      modalElement.addEventListener('hidden.bs.modal', () => {
        this.selectedProduct = null;
        this.modalQuantity = 1;
      });
    }
    if (this.cards && this.cards.length > 0 && !this.selectedCategory) {
      this.selectCategory(this.cards[0]); 
    }
  },
  watch: {
    searchQuery() { this.currentPage = 1; },
    selectedBrand() { this.currentPage = 1; },
    minPriceFilter() { this.currentPage = 1; },
    maxPriceFilter() { this.currentPage = 1; },
    sortBy() { this.currentPage = 1; },
  },
};
</script>