
// Panier de produits
let cart = [];

// Toggle Menu Mobile
function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    const toggle = document.querySelector('.menu-toggle');
    if (!navLinks) return;

    const isActive = navLinks.classList.toggle('active');

    // basculer état visuel du bouton hamburger
    if (toggle) toggle.classList.toggle('open', isActive);

    // accessibilité
    navLinks.setAttribute('aria-hidden', !isActive);
    if (toggle) toggle.setAttribute('aria-expanded', isActive);
}

// Fermer le menu mobile lors du clic sur un lien
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            const navLinksContainer = document.getElementById('navLinks');
            if (navLinksContainer.classList.contains('active')) {
                navLinksContainer.classList.remove('active');
            }
        });
    });

    // Initialiser le panier au chargement
    initCart();
    
    // Charger le panier depuis localStorage
    loadCartFromStorage();

    // Accessibility: allow keyboard activation of the hamburger toggle
    const menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle) {
        // make focusable
        if (!menuToggle.hasAttribute('tabindex')) menuToggle.setAttribute('tabindex', '0');
        menuToggle.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMenu();
            }
        });
    }

    // Ajouter automatiquement un bouton 'Commander' à chaque carte produit
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        // Ne pas ajouter si déjà présent
        if (card.querySelector('.product-btn')) return;

        const btn = document.createElement('button');
        btn.className = 'product-btn';
        btn.type = 'button';
        btn.setAttribute('aria-label', 'Commander ce produit');
        btn.textContent = 'Commander';

        btn.addEventListener('click', function() {
            const name = card.querySelector('h3')?.textContent?.trim() || 'Produit';
            const volume = card.querySelector('.product-volume')?.textContent?.trim() || '';
            const description = card.querySelector('.product-desc')?.textContent?.trim() || '';

            // Ajouter au panier
            addToCart({ name, volume, description });

            // Ouvrir la modal du panier pour que l'utilisateur puisse valider
            const modal = document.getElementById('cartModal');
            if (modal) {
                if (!modal.classList.contains('active')) toggleCartModal();
            }
        });

        // Insérer le bouton à la fin de la carte
        card.appendChild(btn);
    });

        // No testimonial slider — static testimonials only
});

    /* testimonial slider removed — testimonials are static cards in HTML */

//  SYSTÈME DE PANIER

function initCart() {
    // Créer le bouton panier flottant
    const cartFloat = document.createElement('div');
    cartFloat.className = 'cart-float';
    cartFloat.innerHTML = `
        🛒
        <span class="cart-count" id="cartCount">0</span>
    `;
    cartFloat.onclick = toggleCartModal;
    
    // Ajouter le bouton seulement sur la page produits
    if (window.location.pathname.includes('produits.html')) {
        document.body.appendChild(cartFloat);
        
        // Créer la modal du panier
        createCartModal();
        
        // Ajouter les event listeners sur les checkboxes
        setupProductCheckboxes();
    }
}

function setupProductCheckboxes() {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        // Créer la checkbox
        const checkbox = document.createElement('div');
        checkbox.className = 'product-select';
        checkbox.innerHTML = '<input type="checkbox" class="product-checkbox">';
        
        // Insérer la checkbox dans la card
        card.style.position = 'relative';
        card.insertBefore(checkbox, card.firstChild);
        
        // Récupérer les infos du produit
        const productName = card.querySelector('h3').textContent;
        const productVolume = card.querySelector('.product-volume').textContent;
        const productDesc = card.querySelector('.product-desc').textContent;
        
        // Event listener sur la checkbox
        const checkboxInput = checkbox.querySelector('input');
        checkboxInput.addEventListener('change', function() {
            if (this.checked) {
                addToCart({
                    name: productName,
                    volume: productVolume,
                    description: productDesc
                });
            } else {
                removeFromCart(productName);
            }
        });
    });
}

function addToCart(product) {
    // Vérifier si le produit n'est pas déjà dans le panier
    if (!cart.find(item => item.name === product.name)) {
        cart.push(product);
        updateCartDisplay();
        saveCartToStorage();
        
        // Animation de confirmation
        showNotification('✓ Produit ajouté au panier');
    }
}

function removeFromCart(productName) {
    cart = cart.filter(item => item.name !== productName);
    updateCartDisplay();
    saveCartToStorage();
    
    // Décocher la checkbox correspondante
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        const name = card.querySelector('h3').textContent;
        if (name === productName) {
            const checkbox = card.querySelector('.product-checkbox');
            if (checkbox) checkbox.checked = false;
        }
    });
    
    showNotification('✓ Produit retiré du panier');
}

function updateCartDisplay() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        cartCount.textContent = cart.length;
        
        // Animation du compteur
        cartCount.style.transform = 'scale(1.3)';
        setTimeout(() => {
            cartCount.style.transform = 'scale(1)';
        }, 200);
    }
    
    // Mettre à jour le contenu de la modal
    updateCartModal();
}

function createCartModal() {
    const modal = document.createElement('div');
    modal.className = 'cart-modal';
    modal.id = 'cartModal';
    modal.innerHTML = `
        <div class="cart-content">
            <div class="cart-header">
                <h2>Mon Panier</h2>
                <button class="cart-close" onclick="toggleCartModal()">×</button>
            </div>
            <div class="cart-items" id="cartItems">
                <div class="cart-empty">Votre panier est vide</div>
            </div>
            <div class="cart-actions">
                <button class="btn-command" onclick="sendCartToWhatsApp()">
                    <span>📱</span> Commander sur WhatsApp
                </button>
                <button class="btn-secondary" onclick="clearCart()" style="width: 100%;">
                    Vider le panier
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Fermer la modal en cliquant à l'extérieur
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            toggleCartModal();
        }
    });
}

function toggleCartModal() {
    const modal = document.getElementById('cartModal');
    if (modal) {
        modal.classList.toggle('active');
        updateCartModal();
    }
}

function updateCartModal() {
    const cartItems = document.getElementById('cartItems');
    if (!cartItems) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="cart-empty">Votre panier est vide</div>';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div>
                    <div class="cart-item-name">${item.name}</div>
                    <div style="color: var(--text-gray); font-size: 0.9rem;">${item.volume}</div>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart('${item.name}')">
                    Retirer
                </button>
            </div>
        `).join('');
    }
}

function clearCart() {
    if (cart.length === 0) {
        showNotification('Le panier est déjà vide');
        return;
    }
    
    if (confirm('Voulez-vous vraiment vider le panier ?')) {
        cart = [];
        updateCartDisplay();
        saveCartToStorage();
        
        // Décocher toutes les checkboxes
        const checkboxes = document.querySelectorAll('.product-checkbox');
        checkboxes.forEach(cb => cb.checked = false);
        
        showNotification('✓ Panier vidé');
    }
}

function sendCartToWhatsApp() {
    if (cart.length === 0) {
        showNotification('⚠️ Votre panier est vide');
        return;
    }
    
    // Construire le message WhatsApp
    let message = `*🛒 NOUVELLE COMMANDE - Akel Service*%0A%0A`;
    message += `*Produits commandés :*%0A`;
    message += `━━━━━━━━━━━━━━━━━━%0A`;
    
    cart.forEach((item, index) => {
        message += `%0A*${index + 1}. ${item.name}*%0A`;
        message += `   ${item.volume}%0A`;
    });
    
    message += `%0A━━━━━━━━━━━━━━━━━━%0A`;
    message += `%0A*Nombre total de produits :* ${cart.length}%0A`;
    message += `%0A_Merci de me confirmer la disponibilité et les prix._`;
    
    // Ouvrir WhatsApp
    const phoneNumber = '22962803008';
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
    
    // Afficher message de confirmation
    showNotification('✓ Redirection vers WhatsApp...');
    
    // Fermer la modal
    setTimeout(() => {
        toggleCartModal();
    }, 1000);
}

// LocalStorage pour persister le panier
function saveCartToStorage() {
    localStorage.setItem('akelServiceCart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('akelServiceCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartDisplay();
        
        // Cocher les checkboxes des produits dans le panier
        setTimeout(() => {
            cart.forEach(cartItem => {
                const productCards = document.querySelectorAll('.product-card');
                productCards.forEach(card => {
                    const name = card.querySelector('h3')?.textContent;
                    if (name === cartItem.name) {
                        const checkbox = card.querySelector('.product-checkbox');
                        if (checkbox) checkbox.checked = true;
                    }
                });
            });
        }, 100);
    }
}

// Notification toast
function showNotification(message) {
    // Créer la notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 30px;
        background: var(--text-dark);
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
        z-index: 10001;
        animation: slideInRight 0.3s ease-out;
        font-weight: 600;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Retirer après 3 secondes
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Ajouter les animations CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    .cart-count {
        transition: transform 0.2s;
    }
`;
document.head.appendChild(style);

// FILTRES PRODUITS

function filterProducts(category) {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    const categories = document.querySelectorAll('.product-category');
    
    categories.forEach(cat => {
        if (category === 'all') {
            cat.style.display = 'block';
        } else {
            if (cat.getAttribute('data-category') === category) {
                cat.style.display = 'block';
            } else {
                cat.style.display = 'none';
            }
        }
    });

    const productsSection = document.querySelector('.products-catalog');
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// FORMULAIRE DE CONTACT

const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const nom = document.getElementById('nom').value;
        const telephone = document.getElementById('telephone').value;
        const email = document.getElementById('email').value;
        const sujet = document.getElementById('sujet').value;
        const message = document.getElementById('message').value;

        const whatsappMessage = `*📩 Nouveau message - Akel Service*%0A%0A` +
            `*Nom :* ${nom}%0A` +
            `*Téléphone :* ${telephone}%0A` +
            `*Email :* ${email || 'Non fourni'}%0A` +
            `*Sujet :* ${sujet}%0A%0A` +
            `*Message :*%0A${message}`;

        window.open(`https://wa.me/22962803008?text=${whatsappMessage}`, '_blank');

        const formMessage = document.getElementById('formMessage');
        formMessage.className = 'form-message success';
        formMessage.textContent = '✓ Redirection vers WhatsApp...';
        formMessage.style.display = 'block';

        setTimeout(() => {
            contactForm.reset();
            formMessage.style.display = 'none';
        }, 3000);
    });
}

// SMOOTH SCROLLING

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ANIMATIONS AU SCROLL

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll(
        '.service-card, .showcase-card, .product-card, ' +
        '.contact-card, .faq-item, .about-preview-content'
    );
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
    });
});

// SCROLL TO TOP BUTTON
const scrollToTopBtn = document.createElement('button');
scrollToTopBtn.innerHTML = '↑';
scrollToTopBtn.style.cssText = `
    position: fixed;
    bottom: 120px;
    right: 30px;
    width: 50px;
    height: 50px;
    background: var(--primary-orange);
    color: white;
    border: none;
    border-radius: 50%;
    font-size: 1.5rem;
    cursor: pointer;
    display: none;
    z-index: 998;
    box-shadow: 0 5px 20px var(--shadow-medium);
    transition: all 0.3s;
`;

document.body.appendChild(scrollToTopBtn);

window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
        scrollToTopBtn.style.display = 'block';
    } else {
        scrollToTopBtn.style.display = 'none';
    }
});

scrollToTopBtn.addEventListener('click', function() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

scrollToTopBtn.addEventListener('mouseenter', function() {
    this.style.transform = 'scale(1.1)';
});

scrollToTopBtn.addEventListener('mouseleave', function() {
    this.style.transform = 'scale(1)';
});

// VALIDATION TÉLÉPHONE
const phoneInput = document.getElementById('telephone');
if (phoneInput) {
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length > 0) {
            if (!value.startsWith('229')) {
                value = '229' + value;
            }
            
            if (value.length > 11) {
                value = value.substring(0, 11);
            }
            
            let formatted = '+' + value.substring(0, 3);
            if (value.length > 3) {
                formatted += ' ' + value.substring(3, 5);
            }
            if (value.length > 5) {
                formatted += ' ' + value.substring(5, 7);
            }
            if (value.length > 7) {
                formatted += ' ' + value.substring(7, 9);
            }
            if (value.length > 9) {
                formatted += ' ' + value.substring(9, 11);
            }
            
            e.target.value = formatted;
        }
    });
}

// CONSOLE LOG
console.log('%c🚗 Akel Service ', 'background: #FF6B35; color: #FFF; font-size: 20px; font-weight: bold; padding: 10px;');
console.log('%c✅ Nouveau système de panier activé', 'color: #FF6B35; font-size: 14px; font-weight: bold;'