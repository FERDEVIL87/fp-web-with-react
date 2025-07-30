<template>
  <section class="pc-list-section-bs">
    <div class="container py-4 py-md-5">
      <h2 class="section-title-bs text-center">Paket Rakitan PC & Kustom PC</h2>

      <!-- Tombol Custom -->
      <div class="text-center mb-4">
        <button class="btn btn-pembelian-paket-bs" @click="showSimulasi = !showSimulasi">
          {{ showSimulasi ? 'Tutup Rakitan Kustom' : 'Buat Rakitan Kustom' }}
        </button>
      </div>

      <!-- Bagian Simulasi Kustom -->
      <transition name="fade-slide">
        <div v-if="showSimulasi" class="simulasi-form-bs p-3 rounded-3 mb-4 shadow-lg">
          <div v-if="loadingParts" class="text-center p-5">Memuat komponen...</div>
          <div v-else-if="partsError" class="text-center p-5 text-danger">{{ partsError }}</div>
          <div v-else>
            <table class="table table-dark table-bordered align-middle mb-0">
              <thead>
                <tr>
                  <th>Komponen</th><th>Nama</th><th>Harga</th><th>Pilihan</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(options, part) in partsData" :key="part">
                  <td><strong>{{ part.replace(/_/g, ' ') }}</strong></td>
                  <td>{{ selectedParts[part] ? selectedParts[part].name : 'Belum dipilih' }}</td>
                  <td>{{ selectedParts[part] ? formatPrice(selectedParts[part].price) : '-' }}</td>
                  <td>
                    <div class="dropdown">
                      <button class="btn btn-sm btn-outline-info dropdown-toggle" type="button" data-bs-toggle="dropdown" :disabled="options.length === 0">
                        {{ options.length > 0 ? 'Pilih' : 'Kosong' }}
                      </button>
                      <ul class="dropdown-menu">
                        <li v-for="item in options" :key="item.id">
                          <a class="dropdown-item" href="#" @click.prevent="selectPart(part, item)">{{ item.name }} ({{ formatPrice(item.price) }})</a>
                        </li>
                        <li v-if="options.length === 0"><span class="dropdown-item-text text-muted">Komponen tidak tersedia</span></li>
                        <li v-if="selectedParts[part]"><hr class="dropdown-divider"><a class="dropdown-item text-danger" href="#" @click.prevent="selectPart(part, null)">Kosongkan</a></li>
                      </ul>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <div class="d-flex justify-content-between align-items-center mt-3">
              <div class="total-bs fs-5 fw-bold">Total Rakitan: {{ formatPrice(totalSimulasi) }}</div>
              <div>
                <button class="btn btn-secondary me-2" @click="resetSimulasi">Reset</button>
                <button class="btn btn-success" @click="addToCartSimulasi" :disabled="!isSimulasiLengkap" title="Harap lengkapi semua komponen">
                  Tambah ke Keranjang
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition>
      
      <!-- Keranjang Belanja Global -->
      <div class="text-center my-4 py-3 border-top border-bottom border-secondary">
        <h4>Keranjang Belanja Global</h4>
        <p v-if="cartStore.items.length > 0">Total Item: {{ cartStore.items.length }} | Total Harga: <span class="text-success fw-bold">{{ formatPrice(cartStore.totalPrice) }}</span></p>
        <p v-else class="text-muted">Keranjang belanja utama masih kosong.</p>
        <button class="btn btn-success btn-lg px-5" @click="goToCheckout">Lihat Keranjang & Checkout</button>
      </div>

      <!-- Filter untuk Paket Jadi -->
      <div class="row justify-content-center mb-4">
        <div class="col-lg-10 col-xl-8">
          <div class="filters-bs p-3 rounded-3">
            <div class="row g-2 g-md-3 align-items-center">
              <div class="col-md">
                <input type="text" v-model="searchQuery" placeholder="Cari nama paket..." class="form-control form-control-lg"/>
              </div>
              <div class="col-md-auto">
                <select v-model="selectedCategoryFilter" class="form-select form-select-lg">
                  <option value="">Semua Kategori</option>
                  <option v-for="cat in uniqueCategoriesList" :key="cat" :value="cat">{{ cat }}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tampilan Paket Jadi -->
      <div v-if="loadingPCs" class="text-center py-5">Memuat paket rakitan...</div>
      <div v-else-if="errorPCs" class="text-center text-danger py-5">{{ errorPCs }}</div>
      <div v-else-if="filteredPCs.length > 0">
        <div v-for="categoryData in categoriesWithPCsAndPagination" :key="categoryData.name" class="category-section-bs mb-5">
          <div class="category-header-bs text-center">
            <h3 class="category-title-bs">{{ categoryData.name }}</h3>
          </div>
          <div class="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-3 g-lg-4 justify-content-center">
            <div v-for="pc in categoryData.paginatedPCs" :key="pc.id" class="col d-flex align-items-stretch">
              <div class="card h-100 card-bs" role="button" tabindex="0">
                <div class="card-img-wrapper-bs" @click="openModal(pc)">
                  <img :src="getImageUrl(pc.image)" :alt="pc.name" class="card-img-top card-img-bs" />
                </div>
                <div class="card-body d-flex flex-column p-3">
                  <h4 class="card-title card-title-bs mb-2" @click="openModal(pc)">{{ pc.name }}</h4>
                  <p class="card-text-desc-bs small mb-2" @click="openModal(pc)">{{ pc.description }}</p>
                  <div class="mt-auto">
                    <p class="card-text card-text-price-bs mb-2"><strong>Harga:</strong> {{ formatPrice(pc.price) }}</p>
                    <button class="btn btn-sm btn-primary w-100" @click.stop="addPaketToCart(pc)">
                      <i class="bi bi-cart-plus-fill me-1"></i> Tambah ke Keranjang
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Pagination controls per category -->
          <div v-if="categoryData.pcs.length > itemsPerPage" class="d-flex justify-content-center my-3">
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
        <p>Tidak ada rakitan PC yang cocok dengan kriteria pencarian Anda.</p>
      </div>

      <!-- Modal Detail Paket Jadi -->
      <div class="modal fade" id="pcDetailModalBs" tabindex="-1" ref="pcDetailModalRef">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content modal-content-bs">
            <div class="modal-header">
              <h5 class="modal-title w-100 text-center">{{ selectedPCForModal?.name }}</h5>
              <button type="button" class="btn-close" @click="closeModal"></button>
            </div>
            <div class="modal-body">
              <div v-if="selectedPCForModal" class="row">
                <div class="col-lg-5 text-center">
                  <img :src="getImageUrl(selectedPCForModal.image)" :alt="selectedPCForModal.name" class="img-fluid rounded" />
                </div>
                <div class="col-lg-7">
                  <p><strong>Kategori:</strong> {{ selectedPCForModal.category }}</p>
                  <p><strong>Harga:</strong> {{ formatPrice(selectedPCForModal.price) }}</p>
                  <p><strong>Deskripsi:</strong> {{ selectedPCForModal.description }}</p>
                  <div v-if="selectedPCForModal.specs">
                    <h4>Spesifikasi Detail:</h4>
                    <ul>
                      <li v-for="(value, key) in selectedPCForModal.specs" :key="key">
                        <strong>{{ key }}:</strong> {{ value }}
                      </li>
                    </ul>
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
import apiClient from '@/services/api.js';
import '@/assets/PaketRakitan.css';

export default {
  name: "PaketRakitanPC",
  setup() {
    const router = useRouter();
    return { router, cartStore };
  },
  data() {
    return {
      // Data untuk Paket Jadi
      pcs: [],
      loadingPCs: true,
      errorPCs: null,
      searchQuery: "",
      selectedCategoryFilter: "",
      selectedPCForModal: null,
      bootstrapPCModal: null,

      // Data untuk Simulasi
      showSimulasi: false,
      partsData: {},
      loadingParts: true,
      partsError: null,
      selectedParts: {},

      // Pagination untuk Paket Jadi
      categoryPageMap: {},
      itemsPerPage: 8, // Berapa item per halaman per kategori
    };
  },
  async created() {
    // Panggil kedua fungsi fetch saat komponen dibuat
    this.fetchPaketRakitans();
    this.fetchPcPartsForSimulasi();
  },
  computed: {
    // --- Computed untuk Paket Jadi ---
    uniqueCategoriesList() {
      if (!this.pcs || this.pcs.length === 0) return [];
      const categories = this.pcs.map(pc => pc.category);
      return [...new Set(categories)].sort();
    },
    filteredPCs() {
      if (!this.pcs) return [];
      return this.pcs.filter((pc) => {
        const matchesSearch = pc.name.toLowerCase().includes(this.searchQuery.toLowerCase());
        const matchesCategory = this.selectedCategoryFilter ? pc.category === this.selectedCategoryFilter : true;
        return matchesSearch && matchesCategory;
      });
    },
    categoriesWithPCsAndPagination() {
      if (this.uniqueCategoriesList.length === 0) return [];
      
      let categoriesToDisplay = this.uniqueCategoriesList;
      // Jika ada filter kategori, hanya tampilkan kategori itu
      if (this.selectedCategoryFilter) {
          categoriesToDisplay = [this.selectedCategoryFilter];
      }

      return categoriesToDisplay.map(categoryName => {
        const pcsInCategory = this.filteredPCs.filter(pc => pc.category === categoryName);
        const totalPages = Math.ceil(pcsInCategory.length / this.itemsPerPage) || 1;
        const currentPage = this.categoryPageMap[categoryName] || 1;
        const start = (currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        
        return {
          name: categoryName,
          pcs: pcsInCategory,
          paginatedPCs: pcsInCategory.slice(start, end),
          totalPages,
        };
      }).filter(cat => cat.pcs.length > 0); // Hanya tampilkan kategori yang punya produk setelah difilter
    },

    // --- Computed untuk Simulasi ---
    totalSimulasi() {
      return Object.values(this.selectedParts).reduce((total, part) => {
        return total + (part ? Number(part.price) : 0);
      }, 0);
    },
    isSimulasiLengkap() {
      if (Object.keys(this.partsData).length === 0) return false;
      // Cek apakah semua komponen (kecuali CPU alternatif) sudah dipilih
      const requiredParts = Object.keys(this.partsData).filter(p => p !== 'PROCESSOR AMD' && p !== 'PROCESSOR INTEL');
      const hasCPU = this.selectedParts['PROCESSOR INTEL'] || this.selectedParts['PROCESSOR AMD'];
      
      if (!hasCPU) return false;
      
      for (const partKey of requiredParts) {
        if (!this.selectedParts[partKey]) return false;
      }
      return true;
    }
  },
  methods: {
    getImageUrl(imagePath) {
      if (!imagePath || imagePath.startsWith('http')) {
        return imagePath || 'https://placehold.co/400x300?text=No+Image';
      }
      const backendUrl = apiClient.defaults.baseURL.replace('/api', '');
      return `${backendUrl}${imagePath}`;
    },
    
    // --- Metode untuk Paket Jadi ---
    async fetchPaketRakitans() {
      this.loadingPCs = true;
      this.errorPCs = null;
      try {
        const response = await apiClient.get('/pc-rakitans', { params: { limit: 1000 } });
        this.pcs = response.data.data;
      } catch (error) {
        console.error("Gagal memuat paket rakitan:", error);
        this.errorPCs = "Gagal memuat data paket rakitan.";
      } finally {
        this.loadingPCs = false;
      }
    },
    addPaketToCart(pc) {
      const paketItem = {
        id: pc.id,
        source: 'paket_rakitan',
        name: pc.name,
        price: pc.price,
        qty: 1,
        category: pc.category,
        brand: 'Rakitan',
        image: pc.image,
        specification: Object.entries(pc.specs).map(([key, value]) => `${key}: ${value}`).join('; ')
      };
      cartStore.addItem(paketItem);
      alert(`${pc.name} berhasil ditambahkan ke keranjang!`);
    },
    openModal(pc) {
      this.selectedPCForModal = pc;
      if (this.bootstrapPCModal) this.bootstrapPCModal.show();
    },
    closeModal() {
      if (this.bootstrapPCModal) this.bootstrapPCModal.hide();
    },

    // --- Metode untuk Simulasi Kustom ---
    async fetchPcPartsForSimulasi() {
      this.loadingParts = true;
      this.partsError = null;
      try {
        const response = await apiClient.get('/simulasi-parts');
        this.partsData = response.data;
        this.resetSimulasi();
      } catch (error) {
        console.error("Gagal memuat komponen PC untuk simulasi:", error);
        this.partsError = "Gagal memuat komponen untuk Kustom Rakitan.";
      } finally {
        this.loadingParts = false;
      }
    },
    selectPart(part, item) {
      // Logika khusus untuk CPU: jika pilih Intel, kosongkan AMD, begitu sebaliknya
      if (part === 'PROCESSOR INTEL' && item) {
        this.selectedParts['PROCESSOR AMD'] = null;
      }
      if (part === 'PROCESSOR AMD' && item) {
        this.selectedParts['PROCESSOR INTEL'] = null;
      }
      this.selectedParts[part] = item;
    },
    resetSimulasi() {
      const initialSelection = {};
      for (const partKey in this.partsData) {
        initialSelection[partKey] = null;
      }
      this.selectedParts = initialSelection;
    },
    addToCartSimulasi() {
      if (!this.isSimulasiLengkap) {
        alert('Harap lengkapi semua komponen sebelum melanjutkan! (Pastikan 1 CPU terpilih)');
        return;
      }
      const selectedForCart = {};
      let customNameParts = [];
      for (const partKey in this.selectedParts) {
        const part = this.selectedParts[partKey];
        if (part) { // Hanya tambahkan part yang dipilih
          selectedForCart[partKey] = { name: part.name, price: part.price };
          customNameParts.push(part.name);
        }
      }
      const customName = `Rakitan Kustom (${customNameParts.slice(0, 2).join(', ')}...)`;
      const customBuildItem = {
        id: `sim-${Date.now()}`,
        source: 'rakitan_kustom',
        name: customName,
        price: this.totalSimulasi,
        qty: 1,
        image: 'https://hamiltonrepairs.com/wp-content/uploads/2021/01/AdobeStock_259371766-Converted.jpg',
        specification: { parts: selectedForCart }
      };
      cartStore.addItem(customBuildItem);
      alert('PC rakitan kustom berhasil ditambahkan ke keranjang!');
      this.resetSimulasi();
      this.showSimulasi = false;
    },

    // --- Metode Umum ---
    formatPrice(value) {
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value || 0);
    },
    goToCheckout() {
      this.router.push('/checkout');
    },
    changeCategoryPage(categoryName, page) {
      const category = this.categoriesWithPCsAndPagination.find(cat => cat.name === categoryName);
      if (!category || page < 1 || page > category.totalPages) return;
      this.categoryPageMap[categoryName] = page;
      this.$forceUpdate(); // Paksa update jika Vue tidak mendeteksi perubahan
    },
    resetCategoryPages() {
      this.categoryPageMap = {};
      this.uniqueCategoriesList.forEach(cat => {
        this.categoryPageMap[cat] = 1;
      });
    },
  },
  watch: {
    searchQuery() { this.resetCategoryPages(); },
    selectedCategoryFilter() { this.resetCategoryPages(); },
  },
  mounted() {
    this.resetCategoryPages();
    const modalElement = this.$refs.pcDetailModalRef;
    if (modalElement) {
        this.bootstrapPCModal = new Modal(modalElement);
    }
  },
};
</script>

<style scoped>
.text-muted{
  color: #fff !important;
}
.btn-pembelian-paket-bs{
  color: white;
}
</style>