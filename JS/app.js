/**
 * ============================================
 * LUXE BEAUTY - Main JavaScript
 * Premium Cosmetics E-commerce Website
 * ============================================
 */

// ============================================
// LOADING SCREEN
// ============================================
window.addEventListener('load', function() {
    const loading = document.getElementById('loading');
    if (loading) {
        setTimeout(() => {
            loading.classList.add('hidden');
        }, 500);
    }
});

// ============================================
// NAVBAR FUNCTIONALITY
// ============================================
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

// Navbar scroll effect
window.addEventListener('scroll', function() {
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        // Only remove 'scrolled' if we're on homepage
        if (document.querySelector('.hero')) {
            navbar.classList.remove('scrolled');
        }
    }
});

// Mobile menu toggle
if (navToggle) {
    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        this.classList.toggle('active');
    });
}

// Close mobile menu when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.navbar')) {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    }
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

// ============================================
// SCROLL ANIMATIONS
// ============================================
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all animated elements
document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right').forEach(el => {
    observer.observe(el);
});

// ============================================
// BACK TO TOP BUTTON
// ============================================
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', function() {
    if (window.scrollY > 500) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }
});

if (backToTop) {
    backToTop.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ============================================
// PRODUCT FILTERING
// ============================================
const filterButtons = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.product-card');

filterButtons.forEach(button => {
    button.addEventListener('click', function() {
        // Update active button
        filterButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        
        const filterValue = this.dataset.filter;
        
        // Filter products
        productCards.forEach(card => {
            const category = card.dataset.category;
            
            if (filterValue === 'all' || category === filterValue) {
                card.style.display = 'block';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 50);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 400);
            }
        });
    });
});

// ============================================
// SHOPPING CART FUNCTIONALITY
// ============================================
class ShoppingCart {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('luxeCart')) || [];
        this.init();
    }
    
    init() {
        this.updateCartCount();
        this.bindAddToCartButtons();
    }
    
    // Format price to VND
    formatPrice(price) {
        return new Intl.NumberFormat('vi-VN').format(price) + '₫';
    }
    
    // Add item to cart
    addToCart(product) {
        const existingIndex = this.cart.findIndex(item => item.id === product.id);
        
        if (existingIndex > -1) {
            this.cart[existingIndex].quantity += 1;
        } else {
            this.cart.push({
                ...product,
                quantity: 1
            });
        }
        
        this.saveCart();
        this.updateCartCount();
        this.showNotification(`Đã thêm "${product.name}" vào giỏ hàng!`);
    }
    
    // Remove item from cart
    removeFromCart(index) {
        this.cart.splice(index, 1);
        this.saveCart();
        this.updateCartCount();
    }
    
    // Update item quantity
    updateQuantity(index, delta) {
        this.cart[index].quantity = Math.max(1, Math.min(10, this.cart[index].quantity + delta));
        this.saveCart();
        this.updateCartCount();
    }
    
    // Save cart to localStorage
    saveCart() {
        localStorage.setItem('luxeCart', JSON.stringify(this.cart));
    }
    
    // Update cart count in navbar
    updateCartCount() {
        const cartCountEl = document.getElementById('cartCount');
        if (cartCountEl) {
            const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCountEl.textContent = totalItems;
        }
    }
    
    // Show notification
    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: #0a0a0a;
            color: white;
            padding: 15px 25px;
            border-radius: 0;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 9999;
            animation: slideInRight 0.3s ease forwards;
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        `;
        
        // Add animation keyframes if not exists
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease forwards';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    // Bind add to cart buttons
    bindAddToCartButtons() {
        document.querySelectorAll('.btn-add-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                
                const product = {
                    id: parseInt(button.dataset.id),
                    name: button.dataset.name,
                    price: parseInt(button.dataset.price),
                    image: button.dataset.image
                };
                
                this.addToCart(product);
                
                // Button animation
                button.style.transform = 'scale(0.95)';
                button.innerHTML = '<i class="fas fa-check"></i> Đã Thêm';
                
                setTimeout(() => {
                    button.style.transform = 'scale(1)';
                    button.innerHTML = 'Thêm Vào Giỏ';
                }, 1500);
            });
        });
    }
    
    // Get cart total
    getTotal() {
        return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }
}

// Initialize shopping cart
const cart = new ShoppingCart();

// ============================================
// REVIEW SLIDER
// ============================================
class ReviewSlider {
    constructor() {
        this.currentIndex = 1;
        this.totalReviews = 3;
        this.init();
    }
    
    init() {
        const prevBtn = document.getElementById('prevReview');
        const nextBtn = document.getElementById('nextReview');
        
        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => this.prev());
            nextBtn.addEventListener('click', () => this.next());
        }
        
        // Dot navigation
        document.querySelectorAll('.review-dot').forEach(dot => {
            dot.addEventListener('click', () => {
                this.goTo(parseInt(dot.dataset.index));
            });
        });
        
        // Auto slide
        this.autoSlide();
    }
    
    show(index) {
        // Hide all reviews
        for (let i = 1; i <= this.totalReviews; i++) {
            const review = document.getElementById(`review-${i}`);
            if (review) {
                review.style.display = 'none';
            }
        }
        
        // Show current review
        const currentReview = document.getElementById(`review-${index}`);
        if (currentReview) {
            currentReview.style.display = 'block';
        }
        
        // Update dots
        document.querySelectorAll('.review-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i + 1 === index);
        });
    }
    
    next() {
        this.currentIndex = this.currentIndex >= this.totalReviews ? 1 : this.currentIndex + 1;
        this.show(this.currentIndex);
    }
    
    prev() {
        this.currentIndex = this.currentIndex <= 1 ? this.totalReviews : this.currentIndex - 1;
        this.show(this.currentIndex);
    }
    
    goTo(index) {
        this.currentIndex = index;
        this.show(this.currentIndex);
    }
    
    autoSlide() {
        setInterval(() => {
            this.next();
        }, 6000);
    }
}

// Initialize review slider if on homepage
if (document.querySelector('.reviews-slider')) {
    const reviewSlider = new ReviewSlider();
}

// ============================================
// NEWSLETTER FORM
// ============================================
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = this.querySelector('input[type="email"]').value;
        
        // Validate email
        if (!email || !email.includes('@')) {
            alert('Vui lòng nhập email hợp lệ!');
            return;
        }
        
        // Show success message
        alert('Cảm ơn bạn đã đăng ký! Bạn sẽ nhận được voucher giảm 15% qua email.');
        this.reset();
    });
}

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        
        if (href === '#') return;
        
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            const navHeight = navbar.offsetHeight;
            const targetPosition = target.offsetTop - navHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ============================================
// ACTIVE NAV LINK ON SCROLL
// ============================================
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 150;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href*="${sectionId}"]`);
        
        if (navLink) {
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
                navLink.classList.add('active');
            }
        }
    });
});

// ============================================
// PARALLAX EFFECT FOR HERO
// ============================================
const hero = document.querySelector('.hero');
if (hero) {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        hero.style.backgroundPositionY = -(scrolled * 0.3) + 'px';
    });
}

// ============================================
// LAZY LOADING FOR IMAGES
// ============================================
const lazyImages = document.querySelectorAll('img[loading="lazy"]');
const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src || img.src;
            img.classList.add('loaded');
            observer.unobserve(img);
        }
    });
});

lazyImages.forEach(img => {
    imageObserver.observe(img);
});

// ============================================
// ACCESSIBILITY: KEYBOARD NAVIGATION
// ============================================
document.addEventListener('keydown', function(e) {
    // ESC key closes mobile menu
    if (e.key === 'Escape') {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    }
});

// ============================================
// CONSOLE WELCOME MESSAGE
// ============================================
console.log('%c LUXE Beauty ', 'background: #722F37; color: white; font-size: 20px; padding: 10px;');
console.log('%c Welcome to LUXE Beauty - Premium Cosmetics ', 'color: #722F37; font-size: 12px;');
