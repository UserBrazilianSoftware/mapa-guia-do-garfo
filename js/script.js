// ===== VARIÁVEIS GLOBAIS =====
let currentRating = 0;
let currentEditRating = 0;
let currentMapPlace = '';
let currentMapAddress = '';

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeModals();
    initializeFormValidation();
    initializeStarRatings();
    initializeFAQ();
    initializeFilters();
    initializeAnimations();
    initializeCounters();
    
    // Inicializar funcionalidades específicas da página
    const currentPage = getCurrentPage();
    switch(currentPage) {
        case 'index':
            initializeHomePage();
            break;
        case 'explorar':
            initializeExplorePage();
            break;
        case 'avaliacoes':
            initializeReviewsPage();
            break;
        case 'contato':
            initializeContactPage();
            break;
    }
});

// ===== UTILITÁRIOS =====
function getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('explorar')) return 'explorar';
    if (path.includes('avaliacoes')) return 'avaliacoes';
    if (path.includes('contato')) return 'contato';
    return 'index';
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span>${type === 'success' ? '✅' : type === 'error' ? '❌' : '⚠️'}</span>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function formatPhoneNumber(value) {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
        return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
}

// ===== NAVEGAÇÃO =====
function initializeNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Fechar menu ao clicar em um link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
        
        // Fechar menu ao clicar fora
        document.addEventListener('click', function(e) {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
}

// ===== MODAIS =====
function initializeModals() {
    // Fechar modais ao clicar no X ou fora do modal
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-close') || e.target.classList.contains('modal')) {
            closeAllModals();
        }
    });
    
    // Fechar modais com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.classList.remove('active');
    });
    document.body.style.overflow = 'auto';
}

// ===== AVALIAÇÕES COM ESTRELAS =====
function initializeStarRatings() {
    const starRatings = document.querySelectorAll('.star-rating');
    
    starRatings.forEach(rating => {
        const stars = rating.querySelectorAll('.star');
        const isEdit = rating.id === 'editStarRating';
        
        stars.forEach((star, index) => {
            star.addEventListener('click', function() {
                const ratingValue = index + 1;
                
                if (isEdit) {
                    currentEditRating = ratingValue;
                } else {
                    currentRating = ratingValue;
                }
                
                updateStarDisplay(rating, ratingValue);
            });
            
            star.addEventListener('mouseenter', function() {
                const ratingValue = index + 1;
                updateStarDisplay(rating, ratingValue);
            });
        });
        
        rating.addEventListener('mouseleave', function() {
            const currentValue = isEdit ? currentEditRating : currentRating;
            updateStarDisplay(rating, currentValue);
        });
    });
}

function updateStarDisplay(ratingContainer, value) {
    const stars = ratingContainer.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < value) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

// ===== VALIDAÇÃO DE FORMULÁRIOS =====
function initializeFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (form.id === 'contactForm') {
                validateContactForm();
            } else if (form.id === 'reviewForm') {
                validateReviewForm();
            } else if (form.id === 'editReviewForm') {
                validateEditReviewForm();
            }
        });
    });
    
    // Validação em tempo real
    const inputs = document.querySelectorAll('.form-input, .form-textarea, .form-select');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(input);
        });
        
        input.addEventListener('input', function() {
            clearFieldError(input);
            
            // Formatação especial para telefone
            if (input.type === 'tel') {
                input.value = formatPhoneNumber(input.value);
            }
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name || field.id;
    let isValid = true;
    let errorMessage = '';
    
    // Validação obrigatória
    if (field.required && !value) {
        isValid = false;
        errorMessage = 'Este campo é obrigatório.';
    }
    
    // Validações específicas
    if (value && field.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Digite um email válido.';
        }
    }
    
    if (value && field.type === 'tel') {
        const phoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/;
        if (!phoneRegex.test(value)) {
            isValid = false;
            errorMessage = 'Digite um telefone válido: (XX) XXXXX-XXXX';
        }
    }
    
    if (value && fieldName === 'firstName' && value.length < 2) {
        isValid = false;
        errorMessage = 'Nome deve ter pelo menos 2 caracteres.';
    }
    
    if (value && fieldName === 'message' && value.length < 10) {
        isValid = false;
        errorMessage = 'Mensagem deve ter pelo menos 10 caracteres.';
    }
    
    showFieldError(field, isValid, errorMessage);
    return isValid;
}

function showFieldError(field, isValid, errorMessage) {
    const errorElement = document.getElementById(field.name + 'Error') || 
                        document.getElementById(field.id + 'Error');
    
    if (errorElement) {
        if (isValid) {
            errorElement.textContent = '';
            errorElement.classList.remove('show');
            field.classList.remove('error');
        } else {
            errorElement.textContent = errorMessage;
            errorElement.classList.add('show');
            field.classList.add('error');
        }
    }
}

function clearFieldError(field) {
    const errorElement = document.getElementById(field.name + 'Error') || 
                        document.getElementById(field.id + 'Error');
    
    if (errorElement) {
        errorElement.classList.remove('show');
        field.classList.remove('error');
    }
}

function validateContactForm() {
    const form = document.getElementById('contactForm');
    const requiredFields = form.querySelectorAll('[required]');
    let isFormValid = true;
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isFormValid = false;
        }
    });
    
    // Validar checkbox de termos
    const termsCheckbox = document.getElementById('terms');
    if (termsCheckbox && !termsCheckbox.checked) {
        showFieldError(termsCheckbox, false, 'Você deve concordar com os termos.');
        isFormValid = false;
    }
    
    if (isFormValid) {
        submitContactForm();
    }
}

function validateReviewForm() {
    const comment = document.getElementById('reviewComment').value.trim();
    let isValid = true;
    
    if (currentRating === 0) {
        showNotification('Por favor, selecione uma avaliação com estrelas.', 'error');
        isValid = false;
    }
    
    if (!comment || comment.length < 10) {
        showNotification('O comentário deve ter pelo menos 10 caracteres.', 'error');
        isValid = false;
    }
    
    if (isValid) {
        submitReviewForm();
    }
}

function validateEditReviewForm() {
    const comment = document.getElementById('editReviewComment').value.trim();
    let isValid = true;
    
    if (currentEditRating === 0) {
        showNotification('Por favor, selecione uma avaliação com estrelas.', 'error');
        isValid = false;
    }
    
    if (!comment || comment.length < 10) {
        showNotification('O comentário deve ter pelo menos 10 caracteres.', 'error');
        isValid = false;
    }
    
    if (isValid) {
        submitEditReviewForm();
    }
}

// ===== SUBMISSÃO DE FORMULÁRIOS =====
function submitContactForm() {
    const submitBtn = document.querySelector('#contactForm .btn-primary');
    const originalText = submitBtn.innerHTML;
    
    // Mostrar loading
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    // Simular envio
    setTimeout(() => {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        
        // Resetar formulário
        document.getElementById('contactForm').reset();
        
        // Mostrar modal de sucesso
        openModal('successModal');
    }, 2000);
}

function submitReviewForm() {
    const establishmentName = document.getElementById('establishmentName').value;
    const comment = document.getElementById('reviewComment').value;
    
    showNotification(`Avaliação de "${establishmentName}" enviada com sucesso!`);
    closeModal('reviewModal');
    
    // Resetar formulário
    document.getElementById('reviewForm').reset();
    currentRating = 0;
    updateStarDisplay(document.querySelector('.star-rating'), 0);
}

function submitEditReviewForm() {
    showNotification('Avaliação atualizada com sucesso!');
    closeModal('editReviewModal');
    
    // Resetar formulário
    document.getElementById('editReviewForm').reset();
    currentEditRating = 0;
    updateStarDisplay(document.getElementById('editStarRating'), 0);
}

// ===== FAQ =====
function initializeFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', function() {
            const isActive = item.classList.contains('active');
            
            // Fechar todos os outros itens
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle do item atual
            item.classList.toggle('active', !isActive);
        });
    });
}

// ===== FILTROS =====
function initializeFilters() {
    const filterSelects = document.querySelectorAll('.filter-select');
    const clearFiltersBtn = document.querySelector('.clear-filters');
    
    filterSelects.forEach(select => {
        select.addEventListener('change', function() {
            applyFilters();
        });
    });
    
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', function() {
            filterSelects.forEach(select => {
                select.value = '';
            });
            applyFilters();
        });
    }
}

function applyFilters() {
    // Simular aplicação de filtros
    const resultsCount = document.querySelector('.results-count');
    if (resultsCount) {
        const randomCount = Math.floor(Math.random() * 50) + 10;
        resultsCount.textContent = `Mostrando ${Math.min(12, randomCount)} de ${randomCount} estabelecimentos`;
    }
    
    showNotification('Filtros aplicados!');
}

// ===== ANIMAÇÕES =====
function initializeAnimations() {
    // Intersection Observer para animações de entrada
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-slide-up');
            }
        });
    }, observerOptions);
    
    // Observar elementos que devem ser animados
    const animatedElements = document.querySelectorAll('.feature, .place-card, .stat-item, .achievement');
    animatedElements.forEach(el => observer.observe(el));
}

// ===== CONTADORES ANIMADOS =====
function initializeCounters() {
    const counters = document.querySelectorAll('.stat-number[data-target]');
    
    const observerOptions = {
        threshold: 0.5
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element) {
    const target = parseFloat(element.getAttribute('data-target'));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        if (target % 1 === 0) {
            element.textContent = Math.floor(current);
        } else {
            element.textContent = current.toFixed(1);
        }
    }, 16);
}

// ===== FUNCIONALIDADES ESPECÍFICAS DAS PÁGINAS =====

// Página Inicial
function initializeHomePage() {
    const searchBtn = document.querySelector('.search-btn');
    const locationBtn = document.querySelector('.location-btn');
    const searchInput = document.querySelector('.search-input');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            const query = searchInput.value.trim();
            if (query) {
                showNotification(`Buscando estabelecimentos em "${query}"...`);
                setTimeout(() => {
                    window.location.href = 'pages/explorar.html';
                }, 1500);
            } else {
                showNotification('Digite uma localização para buscar.', 'warning');
            }
        });
    }
    
    if (locationBtn) {
        locationBtn.addEventListener('click', function() {
            if (navigator.geolocation) {
                locationBtn.textContent = '📍 Obtendo localização...';
                locationBtn.disabled = true;
                
                navigator.geolocation.getCurrentPosition(
                    function(position) {
                        locationBtn.textContent = '📍 Localização obtida!';
                        showNotification('Localização obtida com sucesso!');
                        setTimeout(() => {
                            window.location.href = 'pages/explorar.html';
                        }, 1500);
                    },
                    function(error) {
                        locationBtn.textContent = '📍 Usar minha localização';
                        locationBtn.disabled = false;
                        showNotification('Não foi possível obter sua localização.', 'error');
                    }
                );
            } else {
                showNotification('Geolocalização não é suportada neste navegador.', 'error');
            }
        });
    }
}

// Página Explorar
function initializeExplorePage() {
    const searchBtn = document.querySelector('.search-btn');
    const searchInput = document.querySelector('.search-input-full');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            const query = searchInput.value.trim();
            if (query) {
                showNotification(`Buscando por "${query}"...`);
                applyFilters();
            } else {
                showNotification('Digite o nome de um estabelecimento.', 'warning');
            }
        });
    }
    
    // Botões de favoritos
    const favoriteButtons = document.querySelectorAll('.favorite-btn');
    favoriteButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const isFavorited = btn.textContent === '♥';
            btn.textContent = isFavorited ? '♡' : '♥';
            btn.style.color = isFavorited ? '#6c757d' : '#e74c3c';
            
            const action = isFavorited ? 'removido dos' : 'adicionado aos';
            showNotification(`Estabelecimento ${action} favoritos!`);
        });
    });
}

// Página Avaliações
function initializeReviewsPage() {
    const sortSelect = document.getElementById('sort-reviews');
    const filterSelect = document.getElementById('filter-type');
    
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            showNotification('Avaliações reordenadas!');
        });
    }
    
    if (filterSelect) {
        filterSelect.addEventListener('change', function() {
            showNotification('Filtro aplicado!');
        });
    }
}

// Página Contato
function initializeContactPage() {
    // Já inicializado na validação de formulários
}

// ===== FUNCIONALIDADES DE AVALIAÇÃO =====
function openReviewModal(establishmentName) {
    document.getElementById('establishmentName').value = establishmentName;
    currentRating = 0;
    updateStarDisplay(document.querySelector('.star-rating'), 0);
    openModal('reviewModal');
}

function closeReviewModal() {
    closeModal('reviewModal');
}

function editReview(reviewId) {
    // Simular carregamento dos dados da avaliação
    const reviewData = {
        1: { name: 'Restaurante Bella Vista', rating: 5, comment: 'Experiência incrível! A vista da cidade é deslumbrante...' },
        2: { name: 'Café Aroma', rating: 4, comment: 'Ótimo lugar para trabalhar! Wi-Fi rápido...' },
        3: { name: 'Burger House', rating: 3, comment: 'Hambúrguer saboroso, mas o atendimento deixou a desejar...' }
    };
    
    const review = reviewData[reviewId];
    if (review) {
        document.getElementById('editEstablishmentName').value = review.name;
        document.getElementById('editReviewComment').value = review.comment;
        currentEditRating = review.rating;
        updateStarDisplay(document.getElementById('editStarRating'), review.rating);
        openModal('editReviewModal');
    }
}

function deleteReview(reviewId) {
    if (confirm('Tem certeza que deseja excluir esta avaliação?')) {
        showNotification('Avaliação excluída com sucesso!');
        // Aqui você removeria o elemento da página
    }
}

function closeEditModal() {
    closeModal('editReviewModal');
}

// ===== FUNCIONALIDADES DE MAPA =====
function openMap(placeName, address) {
    currentMapPlace = placeName;
    currentMapAddress = address;
    
    document.getElementById('mapPlaceName').textContent = placeName;
    document.getElementById('mapPlaceAddress').textContent = address;
    
    openModal('mapModal');
    
    // Simular carregamento do mapa
    setTimeout(() => {
        showNotification('Mapa carregado!');
    }, 1000);
}

function closeMapModal() {
    closeModal('mapModal');
}

function openGoogleMaps() {
    const query = encodeURIComponent(`${currentMapPlace} ${currentMapAddress}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(url, '_blank');
}

// ===== MODAL DE SUCESSO =====
function closeSuccessModal() {
    closeModal('successModal');
}

// ===== FUNCIONALIDADES ADICIONAIS =====

// Busca com Enter
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const activeElement = document.activeElement;
        if (activeElement.classList.contains('search-input') || 
            activeElement.classList.contains('search-input-full')) {
            const searchBtn = document.querySelector('.search-btn');
            if (searchBtn) {
                searchBtn.click();
            }
        }
    }
});

// Scroll suave para âncoras
document.addEventListener('click', function(e) {
    if (e.target.tagName === 'A' && e.target.getAttribute('href').startsWith('#')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
});

// Lazy loading para imagens (se houver)
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => imageObserver.observe(img));
}

// Detectar scroll para header
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = 'none';
    }
});

// Prevenção de spam em formulários
let lastSubmitTime = 0;
function preventSpam() {
    const now = Date.now();
    if (now - lastSubmitTime < 3000) {
        showNotification('Aguarde alguns segundos antes de enviar novamente.', 'warning');
        return false;
    }
    lastSubmitTime = now;
    return true;
}

// Aplicar prevenção de spam aos formulários
document.addEventListener('submit', function(e) {
    if (!preventSpam()) {
        e.preventDefault();
    }
});

// ===== FUNCIONALIDADES DE ACESSIBILIDADE =====

// Navegação por teclado nos modais
document.addEventListener('keydown', function(e) {
    const activeModal = document.querySelector('.modal.active');
    if (activeModal && e.key === 'Tab') {
        const focusableElements = activeModal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    }
});

// Anúncios para leitores de tela
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

// ===== PERFORMANCE E OTIMIZAÇÃO =====

// Debounce para eventos de scroll e resize
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Aplicar debounce ao scroll
const debouncedScrollHandler = debounce(function() {
    // Handlers de scroll otimizados aqui
}, 100);

window.addEventListener('scroll', debouncedScrollHandler);

// ===== TRATAMENTO DE ERROS =====
window.addEventListener('error', function(e) {
    console.error('Erro JavaScript:', e.error);
    showNotification('Ocorreu um erro inesperado. Tente recarregar a página.', 'error');
});

// ===== ANALYTICS E TRACKING (SIMULADO) =====
function trackEvent(category, action, label) {
    // Simular tracking de eventos
    console.log(`Evento rastreado: ${category} - ${action} - ${label}`);
}

// Rastrear cliques em botões importantes
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn-primary')) {
        trackEvent('Button', 'Click', e.target.textContent.trim());
    }
    
    if (e.target.classList.contains('nav-link')) {
        trackEvent('Navigation', 'Click', e.target.textContent.trim());
    }
});

console.log('🍽️ Guia do Garfo - JavaScript carregado com sucesso!');

