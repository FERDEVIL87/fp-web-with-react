<script setup>
import { ref, onMounted } from 'vue';
import 'vue3-carousel/dist/carousel.css';
import { Carousel, Slide, Pagination, Navigation } from 'vue3-carousel';
import apiClient from '@/services/api.js';
import '@/assets/Home.css';

import doomVideoPoster from "/videos/doom.webm";

// --- LOGIKA UNTUK BANNER ---
const banners = ref([]);
const isLoadingBanners = ref(true);
const bannerError = ref(null);

const fetchBanners = async () => {
  isLoadingBanners.value = true;
  bannerError.value = null;
  try {
    const response = await apiClient.get('/banners');
    banners.value = response.data.data.map(banner => ({
      ...banner,
      imageWidth: 650,
      imageHeight: 400,
      badges: [],
      backgroundColor: "linear-gradient(135deg, #18181b 0%, #27272a 50%, #3f3f46 100%)",
      accentColor: "#a3a3a3",
    }));
    if (banners.value.length > 0) {
      currentSlideAccentColor.value = banners.value[0].accentColor;
    }
  } catch (error) {
    console.error("Gagal memuat banner dari API:", error);
    bannerError.value = "Gagal memuat promosi.";
  } finally {
    isLoadingBanners.value = false;
  }
};

// --- LOGIKA UNTUK TECH NEWS (PAGINASI BACKEND) ---
const techNews = ref([]);
const isLoadingNews = ref(true);
const newsError = ref(null);
const newsPagination = ref({ total: 0, pages: 1, currentPage: 1 });
const itemsPerPage = 10;

// -- FUNGSI fetchTechNews DENGAN LOGGING UNTUK DEBUGGING --
const fetchTechNews = async (page = 1) => {
  isLoadingNews.value = true;
  newsError.value = null;
  console.log(`1. MEMULAI FETCH TECH NEWS UNTUK HALAMAN: ${page}`);

  try {
    const response = await apiClient.get('/tech-news', {
        params: { 
            page: page, 
            limit: itemsPerPage 
        }
    });

    console.log("2. RESPON API DITERIMA:", response);
    console.log("3. DATA MENTAH DARI API (response.data):", response.data);

    // Validasi struktur data dari backend
    if (response.data && Array.isArray(response.data.data) && typeof response.data.currentPage !== 'undefined') {
      techNews.value = response.data.data;
      
      newsPagination.value = {
          total: response.data.total,
          pages: response.data.pages,
          currentPage: response.data.currentPage
      };
      
      console.log("4. DATA BERITA SETELAH DISIMPAN:", techNews.value);
      console.log("5. DATA PAGINASI SETELAH DISIMPAN:", newsPagination.value);
    } else {
      // Jika struktur salah, berikan pesan error yang jelas
      console.error("Struktur data dari backend tidak sesuai. Data yang diterima:", response.data);
      newsError.value = "Format data berita dari server tidak valid.";
      techNews.value = []; // Kosongkan array berita untuk mencegah error di template
    }

  } catch (error) {
    console.error("GAGAL FETCH! Detail Error:", error);
    newsError.value = "Gagal memuat berita terkini. Pastikan server backend berjalan.";
  } finally {
    isLoadingNews.value = false;
    console.log("6. SELESAI FETCH TECH NEWS.");
  }
};


// --- FUNGSI HELPERS ---
const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://placehold.co/600x350?text=No+Image';
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  const backendUrl = apiClient.defaults.baseURL.replace('/api', '');
  return `${backendUrl}${imagePath}`;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('id-ID', options);
};

// --- LOGIKA PAGINATION BERITA ---
function changeNewsPage(page) {
  if (page < 1 || page > newsPagination.value.pages || page === newsPagination.value.currentPage) return;
  fetchTechNews(page);
  setTimeout(() => {
    document.querySelector('.tech-news-section')?.scrollIntoView({ behavior: 'smooth' });
  }, 100);
}

// --- PENGATURAN CAROUSEL ---
const carouselSettings = { itemsToShow: 1, snapAlign: 'center', transition: 500 };
const carouselBreakpoints = { 700: { itemsToShow: 1, snapAlign: 'center' }, 1024: { itemsToShow: 1, snapAlign: 'start' } };
const currentSlideAccentColor = ref('#a3a3a3');
const onSlideChange = (data) => {
  if (banners.value[data.currentSlideIndex]) {
    currentSlideAccentColor.value = banners.value[data.currentSlideIndex].accentColor;
  }
};

// --- DATA STATIS UNTUK TIM ---
const team = ref([
  { name: "Dhimas Apryza H", nim: "23.11.5495", peran: "Frontend Developer & Leader", photo: "/imgprofil/dhimas.jpg.webp" },
  { name: "Ferdy Syaifanoor", nim: "23.11.54", peran: "Prototype & UI/UX Designer, Coordinator, Database Engineer", photo: "/imgprofil/ferdy.jpg.webp" },
  { name: "Didit Gunawan", nim: "23.11.5462", peran: "Frontend Developer", photo: "/imgprofil/didit.webp" },
  { name: "Eri Oktafianto", nim: "23.11.5482", peran: "Frontend Developer", photo: "/imgprofil/eri.webp" },
  { name: "R.M Alfarizky C.K", nim: "23.11.5473", peran: "Frontend Developer", photo: "/imgprofil/alfarizky.jpg.webp" },
  { name: "Ahmad Rafi H", nim: "23.11.5474", peran: "Frontend Developer", photo: "/imgprofil/rafi.webp" },
  { name: "Naufal Zaky A.P", nim: "23.11.5455", peran: "Backend Developer", photo: "/imgprofil/naufal.jpg.webp" }
]);

// --- ONMOUNTED HOOK (Lifecycle) ---
onMounted(() => {
  fetchBanners();
  fetchTechNews(1); // Memuat halaman pertama berita saat komponen siap
});
</script>

<template>
  <div class="page-wrapper home-page-content">

    <section class="video-hero-section">
      <div class="video-overlay top-gradient"></div>
      <video
        autoplay
        muted
        loop
        playsinline
        class="hero-background-video"
        :poster="doomVideoPoster"
        preload="metadata"
      >
        <source src="/videos/doom.webm" type="video/mp4">
        <track kind="captions" src="" srclang="en" label="English captions" default>
        Your browser does not support the video tag.
      </video>
      <div class="video-overlay bottom-gradient"></div>
      <div class="hero-content-overlay">
        <div class="hero-text-container">
          <h1>ENTER THE DARK AGES</h1>
          <p>OFFICIAL LICENSED GAMING AND STREAMING HARDWARE</p>
          <a href="#product-carousel-starts" class="shop-now-button">SHOP NOW</a>
        </div>
      </div>
    </section>

    <section class="product-hero-slider" id="product-carousel-starts">
      <Carousel
        :settings="carouselSettings"
        :breakpoints="carouselBreakpoints"
        :wrap-around="true"
        :autoplay="5000"
        :pause-autoplay-on-hover="true"
        @slide-start="onSlideChange"
        :style="{'--slide-accent-color': currentSlideAccentColor }"
      >
        <Slide v-for="(banner, index) in banners" :key="banner.id">
          <div class="carousel__item" :style="{ background: banner.backgroundColor }">
            <div class="product-slide-content">
              <div class="product-text-info">
                <h2 class="product-brand" :style="{ color: banner.accentColor }">{{ banner.brand }}</h2>
                <h1 class="product-name">{{ banner.name }}</h1>
                <p class="product-slogan">{{ banner.slogan }}</p>
                <ul class="product-features">
                  <li v-for="feature in banner.features" :key="feature">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-lg" viewBox="0 0 16 16" :style="{ color: banner.accentColor }">
                      <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z"/>
                    </svg>
                    {{ feature }}
                  </li>
                </ul>
              </div>

              <div class="product-image-container">
                <img
                  :src="getImageUrl(banner.imageSrc)"
                  :alt="banner.name"
                  class="product-image"
                  :loading="index === 0 ? 'eager' : 'lazy'"
                  :fetchpriority="index === 0 ? 'high' : 'auto'"
                  :width="banner.imageWidth"
                  :height="banner.imageHeight"
                />
              </div>

              <div class="product-badges-container">
                <div v-for="badge in banner.badges" :key="badge.text + badge.subtext" class="product-badge">
                  <div v-if="badge.icon === 'fan'" class="badge-icon-fan">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-3.79V8.5c0-.28.22-.5.5-.5s.5.22.5.5v7.71c2.42-.95 4-3.27 4-5.96 0-.28-.22-.5-.5-.5s-.5.22-.5.5c0 2.21-1.79 4-4 4s-4-1.79-4-4c0-.28-.22-.5-.5-.5s-.5.22-.5.5c0 2.69 1.58 5.01 4 5.96zM8.75 12.5c.28 0 .5-.22.5-.5V8c0-2.21 1.79-4 4-4s4 1.79 4 4v4c0 .28-.22-.5-.5-.5s-.5-.22-.5-.5V8c0-1.65-1.35-3-3-3s-3 1.35-3 3v4c0 .28-.22-.5-.5-.5s-.5.22-.5-.5z"/></svg>
                  </div>
                  <span class="badge-main-text">{{ badge.text }}</span>
                  <span class="badge-subtext">{{ badge.subtext }}</span>
                  <span v-if="badge.detail" class="badge-detail">{{ badge.detail }}</span>
                </div>
              </div>
            </div>
          </div>
        </Slide>

        <template #addons>
          <Navigation />
          <Pagination />
        </template>
      </Carousel>
    </section>

    <section class="tech-news-section">
      <div class="tech-news-container">
        <h2 class="section-title tech-news-title">Tech Bytes & Insights</h2>
        <p class="section-subtitle tech-news-subtitle">
          Ikuti Perkembangan Terkini di Dunia Komputer.
        </p>

        <!-- Kondisi Loading dan Error -->
        <div v-if="isLoadingNews" class="text-center text-muted py-5">Memuat Berita...</div>
        <div v-else-if="newsError" class="text-center text-danger py-5">{{ newsError }}</div>
        
        <!-- Grid Berita (Hanya Tampil Jika Tidak Loading, Tidak Error, dan Ada Berita) -->
        <div v-else-if="techNews.length > 0" class="news-grid">
          <article v-for="news in techNews" :key="news.id" class="news-item">
            <img
              :src="getImageUrl(news.imageUrl)"
              :alt="news.title"
              class="news-image"
              loading="lazy"
              width="600" height="350"
            >
            <div class="news-content">
              <h3 class="news-item-title">{{ news.title }}</h3>
              <p class="news-item-excerpt">{{ news.excerpt }}</p>
              <div class="news-item-footer">
                <span class="news-item-meta">{{ formatDate(news.date) }} | {{ news.source }}</span>
                <a :href="news.readMoreUrl" class="news-read-more" target="_blank" rel="noopener noreferrer">Read More »</a>
              </div>
            </div>
          </article>
        </div>
        
        <!-- Kondisi Jika Tidak Ada Berita Sama Sekali -->
        <div v-else class="text-center text-muted py-5">Tidak ada berita yang ditemukan.</div>

        <!-- Kontrol Paginasi (Hanya Tampil Jika Tidak Loading dan Ada Lebih Dari 1 Halaman) -->
        <div v-if="!isLoadingNews && newsPagination.pages > 1" class="d-flex justify-content-center my-4">
          <nav>
            <ul class="pagination pagination-sm mb-0">
              <!-- Tombol Sebelumnya -->
              <li class="page-item" :class="{ disabled: newsPagination.currentPage === 1 }">
                <button class="page-link" @click="changeNewsPage(newsPagination.currentPage - 1)" :disabled="newsPagination.currentPage === 1">Prev</button>
              </li>
              <!-- Tombol Nomor Halaman -->
              <li
                v-for="page in newsPagination.pages"
                :key="page"
                class="page-item"
                :class="{ active: newsPagination.currentPage === page }"
              >
                <button class="page-link" @click="changeNewsPage(page)">{{ page }}</button>
              </li>
              <!-- Tombol Berikutnya -->
              <li class="page-item" :class="{ disabled: newsPagination.currentPage === newsPagination.pages }">
                <button class="page-link" @click="changeNewsPage(newsPagination.currentPage + 1)" :disabled="newsPagination.currentPage === newsPagination.pages">Next</button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </section>

    <section class="store-info-section">
      <div class="store-info-container">
        <h2 class="section-title store-section-title">Welcome to JWR Comp</h2>
        <p class="section-subtitle store-section-subtitle">
          Jogja Workstation and Rig a.k.a JWR, Destinasi Utama untuk Perangkat Gaming Terkini, Konsultasi Ahli, dan Pengalaman Bermain Tanpa Tanding.
        </p>

        <div class="info-grid">
          <div class="info-block">
            <h3><i class="icon-store" role="img" aria-label="Store icon"></i>Tentang Kami</h3>
            <p>Kami adalah sekelompok penggila teknologi dan gamer yang berdedikasi untuk menghadirkan komponen terbaik, periferal canggih, dan sistem rakitan kustom berkualitas tinggi. Misi kami adalah memberdayakan kehidupan digital Anda—baik untuk gaming, kreasi konten, maupun pekerjaan profesional.</p>
          </div>

          <div class="info-block">
            <h3><i class="icon-pin" role="img" aria-label="Location pin icon"></i>Kunjungi toko kami</h3>
            <p><strong>Alamat:</strong> Sidoarum, Sleman Regency, Special Region of Yogyakarta</p>
            <p><strong>Nomor WA:</strong> <a href="tel:+1555TECHNOW">(+62) 666-999</a></p>
            <p><strong>Email:</strong> <a href="mailto:jwrcomp@gmail.com">jwrcomp@gmail.com</a></p>
          </div>

          <div class="info-block">
            <h3><i class="icon-clock" role="img" aria-label="Clock icon"></i>Jam Operasional</h3>
            <p><strong>Senin - Jum'at:</strong> 9:00 AM - 8:00 PM</p>
            <p><strong>Sabtu:</strong> 9:00 AM - 7:00 PM</p>
            <p><strong>Minggu:</strong> 9:00 AM - 5:00 PM</p>
          </div>

          <div class="info-block">
            <h3><i class="icon-services" role="img" aria-label="Tools icon for services"></i>Melayani</h3>
            <ul>
              <li>Custom PC Building</li>
              <li>Hardware Upgrades & Installation</li>
              <li>Diagnostics & Repair</li>
              <li>Expert Technical Support</li>
              <li>Gaming Lounges (Coming Soon!)</li>
            </ul>
          </div>
        </div>

        <div class="map-social-container">
          <div class="map-placeholder">
            <h4><i class="icon-map" role="img" aria-label="Map icon"></i>Lokasi Kami</h4>
            <div class="map-embed-placeholder" style="padding:0;">
              <iframe
                src="https://www.google.com/maps?q=-7.7876072,110.3104607&z=17&hl=en&output=embed"
                width="100%"
                height="250"
                style="border:0; border-radius:8px; min-height:200px;"
                allowfullscreen=""
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
                title="Lokasi JWR Comp di Google Maps"
              ></iframe>
            </div>
          </div>
          <div class="social-links">
            <h4><i class="icon-connect" role="img" aria-label="Connect icon"></i>Follow Kami di</h4>
            <a href="https://www.youtube.com/@jwrcomp" aria-label="YouTube" target="_blank" rel="noopener">
              <svg width="1.5em" height="1.5em" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:middle;"><path d="M23.498 6.186a2.994 2.994 0 0 0-2.107-2.117C19.228 3.5 12 3.5 12 3.5s-7.228 0-9.391.569A2.994 2.994 0 0 0 .502 6.186C0 8.36 0 12 0 12s0 3.64.502 5.814a2.994 2.994 0 0 0 2.107 2.117C4.772 20.5 12 20.5 12 20.5s7.228 0 9.391-.569a2.994 2.994 0 0 0 2.107-2.117C24 15.64 24 12 24 12s0-3.64-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              <span class="ms-2">@jwrcomp</span>
            </a>
            <a href="https://www.instagram.com/jwrcomp" aria-label="Instagram" target="_blank" rel="noopener">
              <svg width="1.5em" height="1.5em" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:middle;"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.242 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.242-1.308-3.608C2.013 15.584 2 15.204 2 12s.013-3.584.072-4.85c.059-1.281.292-2.393 1.272-3.373.98-.98 2.092-1.213 3.373-1.272C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.771.131 4.659.363 3.678 1.344c-.98.98-1.213 2.092-1.272 3.373C2.013 8.332 2 8.741 2 12c0 3.259.013 3.668.072 4.948.059 1.281.292 2.393 1.272 3.373.98.98 2.092 1.213 3.373 1.272C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.281-.059 2.393-.292 3.373-1.272.98-.98 1.213-2.092 1.272-3.373.059-1.28.072-1.689.072-4.948 0-3.259-.013-3.668-.072-4.948-.059-1.281-.292-2.393-1.272-3.373-.98-.98-2.092-1.213-3.373-1.272C15.668.013 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/></svg>
              <span class="ms-2">@jwrcomp</span>
            </a>
            <a href="https://www.tiktok.com/@jwrcomp" aria-label="TikTok" target="_blank" rel="noopener">
              <svg width="1.5em" height="1.5em" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:middle;"><path d="M12.75 2v14.25a2.25 2.25 0 1 1-2.25-2.25h.75V12h-.75a4.5 4.5 0 1 0 4.5 4.5V8.25c.69.42 1.49.75 2.25.75V6.75c-.97 0-2.25-.78-2.25-2.25V2h-2.25z"/></svg>
              <span class="ms-2">@jwrcomp</span>
            </a>
          </div>
        </div>

      </div>
    </section>

    <!-- Section Tim Kami -->
    <section class="team-section py-5 bg-black">
      <div class="container">
        <div class="text-center mb-5">
          <h2 class="fw-bold text-info" style="font-size:2rem; letter-spacing:1px;">Tim Kami</h2>
          <p class="text-muted" style="font-size:1.1rem;">7 JWR Forces di balik pengembangan website ini</p>
        </div>
        <div class="row justify-content-center g-4">
          <div
            v-for="member in team"
            :key="member.name"
            class="col-12 col-sm-6 col-md-4 col-lg-3 d-flex justify-content-center"
          >
            <div class="team-card text-center p-4">
              <img
                :src="member.photo"
                :alt="member.name"
                class="team-photo mb-3"
              />
              <h5 class="mb-1 text-info fw-semibold">{{ member.name }}</h5>
              <p class="mb-0 text-secondary" style="font-size:0.98rem;">
                <strong>NIM:</strong> {{ member.nim }}
              </p>
              <p class="mb-0 text-secondary" style="font-size:0.98rem;">
                <strong>Peran:</strong> {{ member.peran }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<style scoped>
.text-muted{
  color: #fff !important;
}

/* Banner & Carousel Section Only */
.video-hero-section {
  position: relative;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  text-align: center;
  background-color: #000000;
  padding-bottom: 10vh;
}
.hero-background-video {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: translate(-50%, -50%);
  z-index: 1;
  filter: brightness(0.5) grayscale(0.2);
}
.video-overlay {
  position: absolute;
  left: 0;
  width: 100%;
  z-index: 2;
  pointer-events: none;
}
.video-overlay.top-gradient {
  top: 0;
  height: 20vh;
  background: linear-gradient(to top, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.8) 70%, #000000 100%);
}
.video-overlay.bottom-gradient {
  bottom: 0;
  height: 30vh;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, #000000 90%);
}
.hero-content-overlay {
  position: relative;
  z-index: 3;
  padding: 20px;
  width: 100%;
  max-width: 800px;
}
.hero-text-container h1 {
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(2.8rem, 7vw, 4.5rem);
  font-weight: 900;
  color: #E5E7EB;
  text-transform: uppercase;
  margin-bottom: 15px;
  letter-spacing: 2px;
  text-shadow: 2px 2px 10px rgba(0,0,0,0.9), 0 0 15px rgba(0,0,0,0.7);
}
.hero-text-container p {
  font-family: 'Roboto', sans-serif;
  font-size: clamp(0.8rem, 2vw, 1.1rem);
  color: #B0B0B8;
  margin-bottom: 35px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 400;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  text-shadow: 1px 1px 8px rgba(0,0,0,0.8), 0 0 6px rgba(0,0,0,0.6);
}
.shop-now-button {
  display: inline-block;
  background-color: #4B5563;
  color: #F3F4F6;
  padding: 14px 35px;
  font-family: 'Orbitron', sans-serif;
  font-weight: 700;
  font-size: clamp(0.9rem, 1.8vw, 1.1rem);
  text-decoration: none;
  text-transform: uppercase;
  border-radius: 4px;
  border: 1px solid #6B7280;
  transition: background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  letter-spacing: 1px;
  cursor: pointer;
}
.shop-now-button:hover, .shop-now-button:focus {
  background-color: #374151;
  color: #FFFFFF;
  border-color: #9CA3AF;
  transform: translateY(-3px) scale(1.03);
  box-shadow: 0 6px 20px rgba(107, 114, 128, 0.3), 0 0 15px rgba(55, 65, 81, 0.2);
  outline: none;
}
.product-hero-slider {
  width: 100%;
  box-sizing: border-box;
  height: 100vh;
  font-family: 'Roboto', sans-serif;
  background-color: #000000;
  position: relative;
  display: flex;
  align-items: center;
  overflow: hidden;
}
:deep(.carousel),
:deep(.carousel__viewport),
:deep(.carousel__track) {
  width: 100%;
  height: 100%;
}
.carousel__item {
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  color: #D1D5DB;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
}
.product-slide-content {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "text image"
    "text image"
    "badges badges";
  align-items: center;
  gap: 20px 40px;
  height: 100%;
  max-height: 90vh;
  box-sizing: border-box;
  width: 100%;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
  padding: clamp(20px, 4dvh, 40px) clamp(15px, 3vw, 40px);
}
.product-text-info,
.product-image-container,
.product-badges-container {
  opacity: 0;
  box-sizing: border-box;
}
:deep(.carousel__slide--active) .product-text-info {
  animation: fadeInFromLeft 0.8s 0.1s ease-out forwards;
}
:deep(.carousel__slide--active) .product-image-container {
  animation: fadeInFromRight 0.8s 0.3s ease-out forwards;
}
:deep(.carousel__slide--active) .product-badges-container {
  animation: fadeInUp 0.8s 0.5s ease-out forwards;
}
.product-text-info {
  grid-area: text;
  text-align: left;
  padding-right: 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.product-brand {
  font-family: 'Orbitron', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 5px;
  letter-spacing: 1px;
  text-transform: uppercase;
}
.product-name {
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 900;
  margin-bottom: 15px;
  line-height: 1.1;
  color: #F3F4F6;
}
.product-slogan {
  font-size: clamp(1.1rem, 2.5vw, 1.4rem);
  font-weight: 300;
  color: #9CA3AF;
  margin-bottom: 25px;
  max-width: 500px;
}
.product-features {
  list-style: none;
  padding-left: 0;
  margin-bottom: 30px;
}
.product-features li {
  font-size: 1rem;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  color: #D1D5DB;
}
.product-features li svg {
  margin-right: 10px;
  flex-shrink: 0;
}
.product-image-container {
  grid-area: image;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}
.product-image {
  display: block;
  max-width: 100%;
  height: auto;
  max-height: clamp(40dvh, 45vw, 60dvh);
  object-fit: contain;
  filter: drop-shadow(0 10px 25px rgba(0,0,0,0.4));
}
.product-badges-container {
  grid-area: badges;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 15px;
  padding-top: 20px;
  margin-top: 20px;
  border-top: 1px solid #374151;
  width: 100%;
}
.product-badge {
  background-color: rgba(31, 41, 55, 0.5);
  border: 1px solid #4B5563;
  border-radius: 4px;
  padding: 8px 12px;
  text-align: center;
  min-width: 100px;
  color: #D1D5DB;
  font-size: 0.8rem;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}
.badge-icon-fan {
  margin-bottom: 4px;
}
.badge-icon-fan svg {
  width: 20px;
  height: 20px;
  fill: #9CA3AF;
}
.badge-main-text {
  display: block;
  font-size: 1.1rem;
  font-weight: 700;
  font-family: 'Orbitron', sans-serif;
  color: #E5E7EB;
}
.badge-subtext {
  display: block;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #9CA3AF;
}
.badge-detail {
  display: block;
  font-size: 0.7rem;
  color: #6B7280;
}
:deep(.carousel__prev),
:deep(.carousel__next) {
  background-color: rgba(17, 24, 39, 0.6) !important;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  color: #D1D5DB !important;
  transition: background-color 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}
:deep(.carousel__prev:hover),
:deep(.carousel__next:hover) {
  background-color: rgba(17, 24, 39, 0.9) !important;
}
:deep(.carousel__prev) { left: 20px !important; }
:deep(.carousel__next) { right: 20px !important; }
:deep(.carousel__pagination) {
  position: absolute;
  bottom: clamp(15px, 3dvh, 20px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 5;
}
:deep(.carousel__pagination-button) {
  min-width: 32px;
  min-height: 32px;
  width: 32px;
  height: 32px;
  margin: 0 6px;
  border-radius: 50%;
  background-color: rgba(107, 114, 128, 0.4) !important;
  padding: 0;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
:deep(.carousel__pagination-button--active) {
  background-color: var(--slide-accent-color, #9CA3AF) !important;
  transform: scale(1.15);
  outline: 2px solid #fff;
  outline-offset: 2px;
}
@keyframes fadeInFromLeft {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes fadeInFromRight {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@media (max-width: 992px) {
  .product-slide-content {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
    grid-template-areas:
      "text"
      "image"
      "badges";
    text-align: center;
    gap: 20px;
    padding: clamp(30px, 5dvh, 50px) 15px clamp(60px, 8dvh, 70px);
    max-width: 100%;
    margin-left: 0;
    margin-right: 0;
    max-height: none;
  }
  .product-text-info {
    padding-right: 0;
    text-align: center;
    align-items: center;
  }
  .product-features li {
    margin-left: auto;
    margin-right: auto;
    max-width: 350px;
    text-align: left;
  }
  .product-image {
    max-height: clamp(30dvh, 45vw, 40dvh);
  }
  .product-badges-container {
    margin-top: 10px;
  }
}
@media (max-width: 576px) {
  .video-hero-section {
    padding-bottom: 8vh;
  }
  .hero-text-container h1 {
    font-size: clamp(2rem, 10vw, 2.8rem);
  }
  .hero-text-container p {
    font-size: clamp(0.75rem, 3vw, 0.9rem);
  }
  .shop-now-button {
    padding: 12px 25px;
    font-size: clamp(0.8rem, 2.5vw, 1rem);
  }
  .product-slide-content {
    gap: 15px;
    padding: clamp(20px, 4dvh, 40px) 10px clamp(50px, 7dvh, 60px);
  }
  .product-name {
    font-size: clamp(1.8rem, 6vw, 2.5rem);
  }
  .product-slogan {
    font-size: clamp(0.9rem, 3vw, 1.1rem);
  }
  .product-features li {
    font-size: 0.85rem;
    max-width: 100%;
  }
  .product-features {
    margin-bottom: 15px;
  }
  .product-image {
    max-height: clamp(25dvh, 50vw, 35dvh);
  }
  .badge-main-text {
    font-size: 0.9rem;
  }
  .badge-subtext, .badge-detail {
    font-size: 0.65rem;
  }
  :deep(.carousel__prev) {
    left: 5px !important;
    width: 30px;
    height: 30px;
  }
  :deep(.carousel__next) {
    right: 5px !important;
    width: 30px;
    height: 30px;
  }
  :deep(.carousel__pagination) {
    bottom: clamp(8px, 1.5dvh, 10px);
  }
  :deep(.carousel__pagination-button) {
    padding: 3px;
    width: 7px;
    height: 7px;
  }
}
</style>