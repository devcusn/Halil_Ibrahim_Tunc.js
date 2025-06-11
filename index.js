(() => {
  class ProductCarouselApp {
    constructor({ targetElement, url }) {
      this.targetElement = document.querySelector(targetElement);
      this.url = url;
      this.query = {
        isLoading: true,
        isError: false,
        data: [],
      };
      this.favorites = [];
    }

    getCache = () => {
      try {
        const cache = localStorage.getItem("products");
        if (cache) {
          this.query.data = JSON.parse(cache);
          this.query.isLoading = false;
        }
      } catch (err) {
        throw new Error(err);
      }
    };

    getFavorites = () => {
      const favorites = localStorage.getItem("favorites");
      if (favorites) {
        this.favorites = JSON.parse(favorites);
      }
    };

    saveFavorites = () => {
      localStorage.setItem("favorites", JSON.stringify(this.favorites));
    };

    toggleFavorite = (productId) => {
      const index = this.favorites.indexOf(productId);
      if (index > -1) {
        this.favorites.splice(index, 1);
      } else {
        this.favorites.push(productId);
      }
      this.saveFavorites();
      this.updateFavoriteButtons();
    };

    updateFavoriteButtons = () => {
      const favoriteButtons = document.querySelectorAll(".favorite-btn");
      favoriteButtons.forEach((btn) => {
        const productId = btn.getAttribute("data-product-id");
        const isFavorite = this.favorites.includes(productId);
        const svgPath = btn.querySelector("svg path");

        if (isFavorite) {
          svgPath.setAttribute("fill", "#f28e00");
          svgPath.setAttribute("stroke", "#f28e00");
          btn.classList.add("favorited");
        } else {
          svgPath.setAttribute("fill", "none");
          svgPath.setAttribute("stroke", "#FF8A00");
          btn.classList.remove("favorited");
        }
      });
    };

    fetchProducts = async () => {
      try {
        this.getCache();
        if (!this.query.isLoading && this.query.data.length > 0) return;

        const response = await fetch(this.url);
        if (!response.ok) throw new Error("api response was not ok");

        this.query.data = await response.json();
        this.query.isLoading = false;
        localStorage.setItem("products", JSON.stringify(this.query.data));
      } catch (error) {
        console.error("Failed to fetch products:", error);
        this.isError = true;
        this.query.data = [];
      }
    };

    buildHTML = () => {
      const createProductHTML = (product) => `
            <a href="${product.url}" target="_blank" class="product-card-link">
              <div class="product-card">
                <div class="product-image-container">
                  <img src="${product.img}" alt="${product.name}" />
                  <div class="favorite-btn" data-product-id="${product.id}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="23" viewBox="0 0 26 23" fill="none">
                      <g id="Group 3">
                        <g id="heart">
                          <path id="Shape" fill-rule="evenodd" clip-rule="evenodd" 
                                d="M22.6339 2.97449C21.4902 1.83033 19.9388 1.1875 18.3211 1.1875C16.7034 1.1875 15.152 1.83033 14.0084 2.97449L12.8332 4.14968L11.658 2.97449C9.27612 0.592628 5.41435 0.592627 3.03249 2.97449C0.650628 5.35635 0.650628 9.21811 3.03249 11.6L4.20769 12.7752L12.8332 21.4007L21.4587 12.7752L22.6339 11.6C23.778 10.4564 24.4208 8.90494 24.4208 7.28723C24.4208 5.66952 23.778 4.11811 22.6339 2.97449Z" 
                                stroke="#FF8A00" stroke-width="2.17391" stroke-linecap="round" stroke-linejoin="round"/>
                        </g>
                      </g>
                    </svg>
                  </div>
                </div>
                <div class="product-info">
                  <h2 class="product-title">
                    <b class="brand-name">${
                      product.brand
                    }</b> - ${product.name.trim()}
                  </h2>
                  <div class="rating">
                    <div class="stars">
                      <span class="star filled">★</span>
                      <span class="star filled">★</span>
                      <span class="star filled">★</span>
                      <span class="star filled">★</span>
                      <span class="star filled">★</span>
                    </div>
                    <span class="rating-count">(${
                      Math.floor(Math.random() * 50) + 10
                    })</span>
                  </div>
                  ${
                    product.original_price > product.price
                      ? `<div class="price-container">
                         <div>
                           <span class="original-price">${product.original_price.toFixed(
                             2
                           )} TL</span> 
                           <span class='discount-item__percent'>%${(
                             ((product.original_price - product.price) /
                               product.original_price) *
                             100
                           ).toFixed(0)}</span> 
                           <span class="discount-item__badge">↓</span>
                         </div>
                         <span class="discount-price">${product.price.toFixed(
                           2
                         )} TL</span>
                       </div>`
                      : `<div class="price-container">
                         <span class="current-price">${product.price.toFixed(
                           2
                         )} TL</span>
                         ${
                           product.original_price > product.price
                             ? `<span class="original-price">${product.original_price.toFixed(
                                 2
                               )} TL</span>`
                             : ""
                         }
                       </div>`
                  }
                </div>
                <div class="card-action">  
                  <button class="add-to-cart-btn">Sepete Ekle</button>
                </div>
              </div>
            </a>
          `;

      const html = `
            <div class="product-carousel-container">
              <div class="carousel-header">
                <h2>Beğenebileceğinizi Düşündüklerimiz</h2>
              </div>
              <div class="product-carousel">
                <div class="product-list">
                  ${this.query.data.map(createProductHTML).join("")}
                </div>
                <button class="nav-btn prev">‹</button>
                <button class="nav-btn next">›</button>
              </div>
            </div>
          `;

      if (this.targetElement && this.targetElement.parentNode) {
        this.targetElement.insertAdjacentHTML("afterend", html);
      }
    };

    buildCSS = () => {
      const css = `
            .product-carousel-container {
              margin: 40px auto;
              padding: 0 15px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
              border-radius: 12px;
              padding: 30px 20px;
              min-width: 100%;
            }
    
            .carousel-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              background-color: #fef6eb;
              border-top-left-radius: 35px;
              border-top-right-radius: 35px;
              padding: 25px 67px;
            }
    
            .carousel-header h2 {
              font-size: 3rem;
              font-weight: 600;
              color: #f28e00;
              margin: 0;
              letter-spacing: -0.5px;
            }
    
            .product-carousel {
              position: relative;
              margin-top: 20px;
              background-color: #ffffff;
              overflow: visible; 
            }
    
            .nav-btn {
              position: absolute;
              display: flex;
              justify-content: center;
              align-items: center;
              width: 50px;
              height: 50px;
              padding-bottom: 3px;
              border: 1px solid #0000;
              background-color: #fef6eb;
              border-radius: 50%;
              cursor: pointer;
              font-size: 36px;
              color: #f28e00;
              font-weight: 300;
              z-index: 10;
            }
    
            .nav-btn:hover {
              background-color: #ffffff;
              border: 1px solid #f28e00;
            }
    
            .prev {
              position: absolute;
              top: 50%;
              left: -65px;
            }
    
            .next {
              position: absolute;
              top: 50%;
              right: -65px;
            }
    
            .product-card-link {
              text-decoration: none; 
              color: none;
            }
    
            .product-list {
              display: flex;
              gap: 20px;
              overflow-x: auto;
              scroll-behavior: smooth;
              padding: 10px 0px 20px 0px;
              overflow: hidden;
              border-bottom-left-radius: 35px;
              border-bottom-right-radius: 35px;
              box-shadow: rgba(235, 235, 235, 0.5) 15px 15px 30px 0px;
            }
    
            .card-action {
              padding: 0px 17px 13px 17px;
            }
    
            .product-card {
              display: flex;
              flex-direction: column;
              background: white;
              border-radius: 10px;
              position: relative;
              border: 1px solid #ededed;
              background-color: #fff;
              padding: 5px;
              height: 100%;
              margin-bottom: 3px;
              width: 242px;
            }
    
            .product-card:hover {
              box-shadow: 0 0 0 0 #00000030, inset 0 0 0 3px #f28e00;
            }
    
            .product-image-container {
              position: relative;
              height: 200px;
              overflow: hidden;
              background: #f8f9fa;
              margin-bottom: 65px;
            }
    
            .product-card img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
    
            .favorite-btn {
              position: absolute;
              top: 12px;
              right: 12px;
              background: white;
              border-radius: 50%;
              width: 50px;
              height: 50px;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              cursor: pointer;
              transition: background-color 0.2s ease;
              z-index: 5;
            }
    
            .favorite-btn:hover {
              border:1px solid  #f28e00;
              background-color:  #fff7ec;;
            }
    
            .favorite-btn.favorited {
              background-color:  #fff7ec;;
            }
    
            .favorite-btn.favorited:hover {
              background: #ffcccc;
            }
    
            .discount-price {
              color: #00a365;
              font-weight: 600;
              font-size: 2.2rem;
            }
    
            .discount-item__badge {
              display: inline-flex;
              justify-content: center;
              align-items: center;
              width: 25px;
              height: 25px;
              border-radius: 50%;
              background-color: #00a365;
              color: #ffffff;
              font-size: 14px;
            }
    
            .discount-item__percent {
              color: #00a365;
              font-size: 18px;
              font-weight: 800;
            }
    
            .product-info {
              padding: 0px 17px 13px 17px;
              flex-grow: 1;
            }
    
            .product-title {
              font-size: 1.2rem;
              height:42px;
              margin-bottom:10px;
              font-weight: 500;
              color: #2c3e50;
              overflow: hidden;
            }
    
            .rating {
              display: flex;
              align-items: center;
              gap: 6px;
              margin-bottom: 12px;
            }
    
            .stars {
              display: flex;
              flex-wrap:wrap;
              gap: 6px;
              padding: 5px 0 15px;
            }
    
            .star {
              color: #fed100;
              font-size: 14px;
              font-weight:900;
            }
    
            .rating-count {
              font-size: 12px;
              color: #7d7d7d;
            }
    
            .price-container {
              gap: 8px;
              margin-bottom: 8px;
            }
    
            .current-price {
              font-size: 2.2rem;
              font-weight: 600;
              color: #7d7d7d;
            }
    
            .original-price {
              font-size: 14px;
              color: #7d7d7d;
              font-weight: 400;
              text-decoration: line-through;
            }
    
            .add-to-cart-btn {
              width: 100%;
              background-color: #fff7ec;
              color: #f28e00;
              border: none;
              font-family: Poppins, "cursive";
              padding: 12px 16px;
              border-radius: 37.5px;
              font-weight: 700;
              font-size: 1.4rem;
              cursor: pointer;
              transition: all 0.15s ease;
              margin-top: auto;
            }
            
            .add-to-cart-btn:hover {
              background-color: #f28e00;
              color:#ffffff;
            }
    
            .add-to-cart-btn:focus {
              box-shadow:0 0 0 .2rem #fe575740;
            }
    
            .product-skeleton {
              display: flex;
              flex-direction: column;
              gap: 40px;
              padding: 10px;
              background-color: #ffffff;
              border-radius: 10px;
              border: 1px solid #f2fafe;
              height: 100%;
              min-width: 242px;
            }
            
            .image-skeleton {
              width: 100%;
              height: 200px;
              background-color: #f2fafe;
              border-top-left-radius: 16px;
              border-top-right-radius: 16px;
            }
    
            .brand-skeleton {
              padding: 20px;
              width: 80%;
              background-color: #f2fafe;
              border-radius: 32px;
            }
            
            .star-skeleton {
              width: 60%;      
              padding: 20px;
              background-color: #f2fafe;
              border-radius: 32px;
            }
            
            .price-skeleton {
              width: 40%;
              padding: 20px;
              background-color: #f2fafe;
              border-radius: 32px;
            }
            
            .button-skeleton {
              width: 95%;
              padding: 20px;
              background-color: #f2fafe;
              border-radius: 32px;
            }
    
            @media (max-width: 1480px) {
              .product-card {
                width: 272.5px;
              }
            }
    
            @media (max-width: 1280px) {
              .product-carousel-container {
                max-width: 1320px;
              }
              
              .product-card {
                width: 296.667px;
              }
            }
    
            @media (max-width: 992px) {
              .product-carousel-container {
                max-width: 960px;
              }
              
              .product-card {
                width: 335px;
              }
            }
    
            @media (max-width: 768px) {
              .product-carousel-container {
                max-width: 720px;
              }
              
              .product-card {
                width: 245px;
              }
            }
    
            @media (max-width: 576px) {
              .product-carousel-container {
                max-width: 540px;
              }
              
              .product-card {
                width: 252.5px;
              }
            }
            @media (max-width: 480px) {
              .product-carousel-container {
                width:100%
                background-color:none;
              }
                .carousel-header {
                background-color:#ffffff;
                padding: 0px 22px 0px 10px;

                }
                .carousel-header h2 {
                font-size: 2.2rem;
                font-weight:700;
                font-family:Quicksand-Bold;
                }
               
            
                .product-list {
                box-shadow: none;
                background-color:none;
                }
              
              .product-card {
                width: calc(50vw - 20px);
              }
            }   
          `;

      const style = document.createElement("style");
      style.textContent = css;
      document.head.appendChild(style);
    };

    setEvents = () => {
      const productList = document.querySelector(".product-list");
      const prevBtn = document.querySelector(".nav-btn.prev");
      const nextBtn = document.querySelector(".nav-btn.next");

      if (!productList || !prevBtn || !nextBtn) return;

      let scrollPosition = 0;

      const productCard = document.querySelector(".product-card");
      const cardWidth = productCard?.getBoundingClientRect().width;

      nextBtn.addEventListener("click", () => {
        scrollPosition += cardWidth + 25;
        productList.scrollTo({ left: scrollPosition, behavior: "smooth" });
        updateNavButtons();
      });

      prevBtn.addEventListener("click", () => {
        scrollPosition -= cardWidth + 25;
        if (scrollPosition < 0) scrollPosition = 0;
        productList.scrollTo({ left: scrollPosition, behavior: "smooth" });
        updateNavButtons();
      });

      const updateNavButtons = () => {
        prevBtn.disabled = scrollPosition <= 0;
        nextBtn.disabled =
          scrollPosition >= productList.scrollWidth - productList.clientWidth;
      };

      const favoriteButtons = document.querySelectorAll(".favorite-btn");
      favoriteButtons.forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const productId = btn.getAttribute("data-product-id");
          this.toggleFavorite(productId);
        });
      });

      updateNavButtons();
    };

    renderSkeleton = () => {
      const createProductSkeletonHTML = () => {
        return `
              <div class="product-skeleton">
                <div class="image-skeleton"></div>
                <div class="brand-skeleton"></div>
                <div class="star-skeleton"></div>
                <div class="price-skeleton"></div>
                <div class="button-skeleton"></div>
              </div>
            `;
      };

      const html = `
            <div class="product-carousel-container">
              <div class="carousel-header">
                <h2>Beğenebileceğinizi Düşündüklerimiz</h2>
              </div>
              <div class="product-carousel">
                <div class="product-list">
                  ${Array.from({ length: 10 })
                    .map((_, i) => createProductSkeletonHTML(i))
                    .join("")}
                </div>
              </div>
            </div>
          `;

      if (this.targetElement) {
        this.targetElement.insertAdjacentHTML("afterend", html);
      }
    };

    removeSkeleton = () => {
      const element = document.querySelector(".product-carousel-container");
      if (element) {
        element.remove();
      }
    };

    renderCarousel = () => {
      this.getFavorites();
      this.buildHTML();
      this.setEvents();
      this.updateFavoriteButtons();
    };

    init = async () => {
      try {
        this.buildCSS();
        this.renderSkeleton();
        await this.fetchProducts();
        this.removeSkeleton();
        this.renderCarousel();
      } catch (err) {
        console.log(err);
      }
    };
  }

  if (window.location.href !== "https://www.e-bebek.com/") {
    console.error("Wrong page");
    return;
  }

  const app = new ProductCarouselApp({
    targetElement: 'cx-page-slot[position="Section1"]',
    url: "https://gist.githubusercontent.com/sevindi/8bcbde9f02c1d4abe112809c974e1f49/raw/9bf93b58df623a9b16f1db721cd0a7a539296cf0/products.json",
  });

  app.init();
})();
