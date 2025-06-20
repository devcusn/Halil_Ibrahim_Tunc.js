# Product Carousel App

A JavaScript script developed for the E-Commerce website that displays product recommendations in carousel format.

### Basic Usage

```javascript
const app = new ProductCarouselApp({
  targetElement: 'cx-page-slot[position="Section1"]', // Target element
  url: "API_ENDPOINT_URL", // URL to fetch product data from
});

app.init();
```

Note: The ProductCarouselApp inserts the carousel element right after the target element.

### Customization

#### Using Different API Endpoint or Target Element

```javascript
const app = new ProductCarouselApp({
  targetElement: ".my-target-element",
  url: "https://api.example.com/products",
});
```

## Issue

### SPA Problem

In client-side rendering applications, we need to manually remove the carousel we added. That's why the checkBrowserHistory() function was implemented.

- Check URL changes
- Hides the carousel on the wrong pages
- Shows it again when you return to the homepage
