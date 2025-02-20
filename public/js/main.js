function tryOn(productId) {
    window.location.href = `/tryon?productId=${productId}`;
}

// Add error handling for forms
document.addEventListener('DOMContentLoaded', () => {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            try {
                const response = await fetch(form.action, {
                    method: form.method,
                    body: new URLSearchParams(formData),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });
                
                if (response.redirected) {
                    window.location.href = response.url;
                } else {
                    const data = await response.json();
                    if (data.error) {
                        alert(data.error);
                    } else {
                        window.location.href = '/';
                    }
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred. Please try again.');
            }
        });
    });

    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const userMenu = document.querySelector('.user-menu');

    mobileMenuBtn?.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navLinks.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            navLinks.classList.remove('active');
        }
    });

    // Update cart count (example function)
    const updateCartCount = (count) => {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = count;
        }
    };

    // Example: Update cart count when adding items
    const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const currentCount = parseInt(document.querySelector('.cart-count').textContent);
            updateCartCount(currentCount + 1);
        });
    });

    // Newsletter form handling
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = newsletterForm.querySelector('input[type="email"]').value;
            
            try {
                // Show loading state
                const button = newsletterForm.querySelector('button');
                const originalContent = button.innerHTML;
                button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Success message
                alert('Thank you for subscribing to our newsletter!');
                newsletterForm.reset();
                
                // Reset button
                button.innerHTML = originalContent;
            } catch (error) {
                alert('Failed to subscribe. Please try again.');
                button.innerHTML = originalContent;
            }
        });
    }
}); 