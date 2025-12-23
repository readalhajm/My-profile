// إضافة السنة الحالية تلقائياً في الفوتر
const yearSpan = document.getElementById('footer-year');
if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
}

// ======== MAIN APP MODULE ========
const PortfolioApp = (function() {
    'use strict';

    // Private variables
    let currentLanguage = document.documentElement.lang || 'ar';
    let isScrolling = false;
    let animationFrameId = null;
    let isPageLoaded = false;

    // Cache DOM elements
    const elements = {
        body: document.body,
        html: document.documentElement,
        navbar: document.querySelector('.navbar'),
        navLinks: document.querySelectorAll('.nav-link'),
        sections: document.querySelectorAll('section'),
        mobileMenuToggle: document.getElementById('mobileMenuToggle'),
        navMenu: document.getElementById('navMenu'),
        themeToggle: document.getElementById('themeToggle'),
        scrollToTopBtn: document.getElementById('scrollToTop'),
        contactForm: document.getElementById('contactForm'),
        skillBars: document.querySelectorAll('.skill-bar'),
        galleryItems: document.querySelectorAll('.gallery-item'),
        filterButtons: document.querySelectorAll('.filter-btn'),
        imageModal: document.getElementById('imageModal'),
        modalImage: document.getElementById('modalImage'),
        modalClose: document.querySelector('.modal-close'),
        heroParticles: document.getElementById('heroParticles'),
        titleRole: document.getElementById('title-role'),
        loadingOverlay: document.getElementById('loadingOverlay'),
        statNumbers: document.querySelectorAll('.stat-number'),
        hero: document.getElementById('home'),
        timelineItems: document.querySelectorAll('.education-item'),
        messageCard: document.querySelector('.message-card'),
        heroShapes: document.querySelectorAll('.shape'),
        dots: document.querySelectorAll('.dot'),
        featureItems: document.querySelectorAll('.feature-item'),
        contactItems: document.querySelectorAll('.contact-item'),
        showMoreBtn: document.getElementById('showMoreBtn'),
        categoryTitles: document.querySelectorAll('.category-title')
    };

    // Utility functions
    const utils = {
        debounce: function(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        throttle: function(func, limit) {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },

        animateValue: function(element, start, end, duration, suffix = '') {
            const range = end - start;
            const increment = range / (duration / 16);
            let current = start;

            const timer = setInterval(() => {
                current += increment;
                if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                    current = end;
                    clearInterval(timer);
                }
                element.textContent = Math.floor(current) + suffix;
            }, 16);
        },

        showNotification: function(message, type = 'success', duration = 3000) {
            // Remove existing notifications
            const existingNotifications = document.querySelectorAll('.notification');
            existingNotifications.forEach(notification => notification.remove());

            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.innerHTML = `
                <div class="notification-content">
                    <div class="notification-icon">
                        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                    </div>
                    <div class="notification-message">
                        <p>${message}</p>
                    </div>
                    <button class="notification-close">&times;</button>
                </div>
            `;

            // Add styles
            notification.style.cssText = `
                position: fixed;
                top: 100px;
                right: 20px;
                background: ${type === 'success' ? 'var(--primary-color)' : 'var(--secondary-color)'};
                color: white;
                padding: 1rem;
                border-radius: var(--border-radius);
                box-shadow: var(--shadow-lg);
                z-index: 10000;
                transform: translateX(100%);
                transition: transform 0.3s ease;
                min-width: 300px;
                font-family: var(--font-primary);
            `;

            elements.body.appendChild(notification);

            // Animate in
            setTimeout(() => {
                notification.style.transform = 'translateX(0)';
                notification.classList.add('show');
            }, 100);

            // Add close functionality
            const closeBtn = notification.querySelector('.notification-close');
            closeBtn.addEventListener('click', () => {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            });

            // Auto remove
            setTimeout(() => {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            }, duration);
        },

        validateEmail: function(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        },
        scrollToElement: function(element, offset = 80) {
            const elementPosition = element.offsetTop;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        },


        addScrollProgress: function() {
            const scrollProgress = document.createElement('div');
            scrollProgress.className = 'scroll-progress';
            scrollProgress.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 0%;
                height: 3px;
                background: var(--btn-gradient);
                z-index: 1001;
                transition: width 0.1s ease;
            `;
            elements.body.appendChild(scrollProgress);

            const updateScrollProgress = () => {
                const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
                const scrollPosition = window.scrollY;
                const scrollPercentage = (scrollPosition / scrollHeight) * 100;
                scrollProgress.style.width = `${scrollPercentage}%`;
            };

            window.addEventListener('scroll', utils.throttle(updateScrollProgress, 16));
        }
    };

    // Navigation Module
    const Navigation = {
        init: function() {
            this.setupActiveNav();
            this.setupSmoothScrolling();
            this.setupNavbarScroll();
            this.setupMobileMenu();
            this.setupThemeToggle();
        },

        setupActiveNav: function() {
            const updateActiveNav = () => {
                let current = '';
                elements.sections.forEach(section => {
                    const sectionTop = section.offsetTop - 100;
                    const sectionHeight = section.clientHeight;
                    if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                        current = section.getAttribute('id');
                    }
                });

                elements.navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${current}`) {
                        link.classList.add('active');
                    }
                });
            };

            window.addEventListener('scroll', utils.throttle(updateActiveNav, 100));
            updateActiveNav();
        },

        setupSmoothScrolling: function() {
            elements.navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = link.getAttribute('href').substring(1);
                    const targetSection = document.getElementById(targetId);

                    if (targetSection) {
                        utils.scrollToElement(targetSection);

                        // Close mobile menu if open
                        if (elements.navMenu.classList.contains('mobile-open')) {
                            elements.navMenu.classList.remove('mobile-open');
                            elements.mobileMenuToggle.setAttribute('aria-expanded', 'false');
                            
                            // Reset hamburger menu
                            const spans = elements.mobileMenuToggle.querySelectorAll('span');
                            spans[0].style.transform = 'none';
                            spans[1].style.opacity = '1';
                            spans[2].style.transform = 'none';
                        }
                    }
                });
            });
        },

        setupNavbarScroll: function() {
            const handleNavbarScroll = () => {
                if (window.scrollY > 50) {
                    elements.navbar.style.background = 'var(--neutral-color)';
                    elements.navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
                } else {
                    elements.navbar.style.background = 'var(--neutral-color)';
                    elements.navbar.style.boxShadow = 'none';
                }
            };

            window.addEventListener('scroll', utils.throttle(handleNavbarScroll, 100));
        },

        setupMobileMenu: function() {
            if (!elements.mobileMenuToggle || !elements.navMenu) return;

            elements.mobileMenuToggle.addEventListener('click', () => {
                elements.navMenu.classList.toggle('mobile-open');
                const isOpen = elements.navMenu.classList.contains('mobile-open');
                elements.mobileMenuToggle.setAttribute('aria-expanded', isOpen);
                
                // Add animation to hamburger menu
                const spans = elements.mobileMenuToggle.querySelectorAll('span');
                if (isOpen) {
                    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                    spans[1].style.opacity = '0';
                    spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
                } else {
                    spans[0].style.transform = 'none';
                    spans[1].style.opacity = '1';
                    spans[2].style.transform = 'none';
                }
            });

            // Close menu when clicking on nav links
            elements.navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    elements.navMenu.classList.remove('mobile-open');
                    elements.mobileMenuToggle.setAttribute('aria-expanded', 'false');
                    
                    // Reset hamburger menu
                    const spans = elements.mobileMenuToggle.querySelectorAll('span');
                    spans[0].style.transform = 'none';
                    spans[1].style.opacity = '1';
                    spans[2].style.transform = 'none';
                });
            });

            // Close menu on window resize
            window.addEventListener('resize', utils.debounce(() => {
                if (window.innerWidth > 768) {
                    elements.navMenu.classList.remove('mobile-open');
                    elements.mobileMenuToggle.setAttribute('aria-expanded', 'false');
                    
                    // Reset hamburger menu
                    const spans = elements.mobileMenuToggle.querySelectorAll('span');
                    spans[0].style.transform = 'none';
                    spans[1].style.opacity = '1';
                    spans[2].style.transform = 'none';
                }
            }, 250));
        },

        setupThemeToggle: function() {
            if (!elements.themeToggle) return;

            // Check for saved theme preference
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                elements.body.setAttribute('data-theme', savedTheme);
                const icon = elements.themeToggle.querySelector('i');
                icon.className = savedTheme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
            }

            elements.themeToggle.addEventListener('click', () => {
                const currentTheme = elements.body.getAttribute('data-theme');
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                
                elements.body.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                
                // Update icon
                const icon = elements.themeToggle.querySelector('i');
                icon.className = newTheme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
                
                // Add rotation animation
                elements.themeToggle.style.transform = 'rotate(360deg)';
                setTimeout(() => {
                    elements.themeToggle.style.transform = 'rotate(0deg)';
                }, 500);
            });
        }
    };

    // Animations Module
    const Animations = {
        init: function() {
            this.setupScrollAnimations();
            this.setupSkillBars();
            this.setupParticles();
            this.setupTypingEffect();
            this.setupParallax();
            this.setupCounterAnimation();
            this.setupLoadingScreen();
            this.setupTimelineAnimation();
            this.setupMessageAnimation();
            this.setupShapesAnimation();
            this.setupLogoAnimation();
            this.setupCategoryAnimations();
        },

        setupScrollAnimations: function() {
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            }, observerOptions);

            const animatedElements = document.querySelectorAll('.feature-item, .skill-item, .gallery-item, .contact-item, .education-item, .highlight-item');
            animatedElements.forEach(el => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(30px)';
                el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                observer.observe(el);
            });
        },

        setupSkillBars: function() {
            const skillObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const skillBar = entry.target;
                        const level = skillBar.getAttribute('data-level');
                        skillBar.style.width = level + '%';
                        
                        // Animate percentage text
                        const percentElement = skillBar.parentElement.querySelector('.skill-percent');
                        if (percentElement) {
                            utils.animateValue(percentElement, 0, parseInt(level), 1500, '%');
                        }
                    }
                });
            }, { threshold: 0.5 });

            elements.skillBars.forEach(bar => {
                bar.style.width = '0%';
                skillObserver.observe(bar);
            });
        },

        setupParticles: function() {
            if (!elements.heroParticles) return;

            // Reduce or disable particle generation on small screens to save CPU and battery
            if (window.innerWidth < 768) {
                for (let i = 0; i < 6; i++) {
                    const particle = document.createElement('div');
                    const size = Math.random() * 6 + 4;
                    const posX = Math.random() * 100;
                    const posY = Math.random() * 100;
                    const opacity = Math.random() * 0.25 + 0.08;
                    particle.style.cssText = `
                        position: absolute;
                        width: ${size}px;
                        height: ${size}px;
                        background: rgba(37, 99, 235, ${opacity});
                        border-radius: 50%;
                        left: ${posX}%;
                        top: ${posY}%;
                        filter: blur(2px);
                    `;
                    elements.heroParticles.appendChild(particle);
                }
                return;
            }

            const createParticle = () => {
                const particle = document.createElement('div');
                const size = Math.random() * 4 + 2;
                const posX = Math.random() * 100;
                const posY = Math.random() * 100;
                const opacity = Math.random() * 0.5 + 0.2;
                const duration = Math.random() * 10 + 10;
                
                particle.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    background: rgba(37, 99, 235, ${opacity});
                    border-radius: 50%;
                    left: ${posX}%;
                    top: ${posY}%;
                    animation: floatParticle ${duration}s linear infinite;
                `;

                elements.heroParticles.appendChild(particle);

                setTimeout(() => {
                    if (particle.parentNode) {
                        particle.remove();
                    }
                }, 20000);
            };

            // Create initial (reduced) particles
            for (let i = 0; i < 12; i++) {
                setTimeout(createParticle, i * 250);
            }

            // Continue creating particles at a lower rate
            setInterval(createParticle, 1500);
        },

        setupTypingEffect: function() {
            if (!elements.titleRole) return;

            const roles = currentLanguage === 'ar'
                ? ['مطور ويب محترف','مصمم واجهات', 'خبير برمجي','مصمم جرافكس']
                : ['Professional Web Developer','UI/UX Designer', 'Full Stack Developer', 'Graphics Design'];

            let roleIndex = 0;
            let charIndex = 0;
            let isDeleting = false;
            let typingTimeout;

            const typeRole = () => {
                const currentRole = roles[roleIndex];
                
                if (isDeleting) {
                    elements.titleRole.textContent = currentRole.substring(0, charIndex - 1);
                    charIndex--;
                } else {
                    elements.titleRole.textContent = currentRole.substring(0, charIndex + 1);
                    charIndex++;
                }

                let typeSpeed = isDeleting ? 50 : 100;

                if (!isDeleting && charIndex === currentRole.length) {
                    typeSpeed = 2000;
                    isDeleting = true;
                } else if (isDeleting && charIndex === 0) {
                    isDeleting = false;
                    roleIndex = (roleIndex + 1) % roles.length;
                    typeSpeed = 500;
                }

                typingTimeout = setTimeout(typeRole, typeSpeed);
            };

            // Start typing effect
            setTimeout(typeRole, 1000);
        },

        setupParallax: function() {
            const handleParallax = () => {
                const scrolled = window.pageYOffset;
                const parallaxElements = document.querySelectorAll('.hero-background, .shape');
                
                parallaxElements.forEach((element, index) => {
                    const speed = 0.5 + (index * 0.1);
                    element.style.transform = `translateY(${scrolled * speed}px)`;
                });
            };

            window.addEventListener('scroll', utils.throttle(handleParallax, 16));
        },

        setupCounterAnimation: function() {
            const counterObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const counter = entry.target;
                        const target = parseInt(counter.getAttribute('data-target'));
                        const suffix = counter.getAttribute('data-suffix') || '';
                        
                        utils.animateValue(counter, 0, target, 2000, suffix);
                        counterObserver.unobserve(counter);
                    }
                });
            }, { threshold: 0.7 });

            elements.statNumbers.forEach(counter => {
                counterObserver.observe(counter);
            });
        },

        setupLoadingScreen: function() {
            if (!elements.loadingOverlay) return;

            window.addEventListener('load', () => {
                setTimeout(() => {
                    elements.loadingOverlay.style.opacity = '0';
                    setTimeout(() => {
                        elements.loadingOverlay.style.display = 'none';
                        isPageLoaded = true;
                    }, 500);
                }, 1000);
            });
        },

        setupTimelineAnimation: function() {
            const timelineObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const item = entry.target;
                        const icon = item.querySelector('.education-icon');
                        const details = item.querySelector('.education-details');
                        
                        // Animate icon
                        icon.style.transform = 'scale(1.2)';
                        icon.style.transition = 'transform 0.3s ease';
                        
                        setTimeout(() => {
                            icon.style.transform = 'scale(1)';
                            
                            // Animate details
                            details.style.transform = 'translateX(0)';
                            details.style.opacity = '1';
                        }, 300);
                    }
                });
            }, { threshold: 0.2 });

            elements.timelineItems.forEach(item => {
                const details = item.querySelector('.education-details');
                details.style.transform = 'translateX(-50px)';
                details.style.opacity = '0';
                details.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
                
                timelineObserver.observe(item);
            });
        },

        setupMessageAnimation: function() {
            if (!elements.messageCard) return;

            const messageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const card = entry.target;
                        const icon = card.querySelector('.message-icon');
                        
                        // Animate icon
                        icon.style.transform = 'scale(1.2) rotate(10deg)';
                        icon.style.transition = 'transform 0.5s ease';
                        
                        setTimeout(() => {
                            icon.style.transform = 'scale(1) rotate(0deg)';
                        }, 500);
                    }
                });
            }, { threshold: 0.5 });

            messageObserver.observe(elements.messageCard);
        },

        setupShapesAnimation: function() {
            elements.heroShapes.forEach((shape, index) => {
                const delay = index * 2;
                shape.style.animationDelay = `${delay}s`;
            });

            elements.dots.forEach((dot, index) => {
                const delay = index * 1;
                dot.style.animationDelay = `${delay}s`;
            });
        },

        setupLogoAnimation: function() {
            const logoIcon = document.querySelector('.logo-icon');
            if (logoIcon) {
                logoIcon.addEventListener('mouseenter', () => {
                    logoIcon.style.transform = 'rotate(360deg) scale(1.1)';
                });
                
                logoIcon.addEventListener('mouseleave', () => {
                    logoIcon.style.transform = 'rotate(0deg) scale(1)';
                });
            }
        },

        setupCategoryAnimations: function() {
            if (!elements.categoryTitles) return;

            elements.categoryTitles.forEach(title => {
                title.addEventListener('mouseenter', () => {
                    title.style.transform = 'translateY(-3px) scale(1.02)';
                });
                
                title.addEventListener('mouseleave', () => {
                    title.style.transform = 'translateY(0) scale(1)';
                });
            });
        }
    };

    // Skills Module
    const Skills = {
        init: function() {
            this.setupSkillBars();
            this.setupCategoryAnimations();
        },

        setupCategoryAnimations: function() {
            const categoryTitles = document.querySelectorAll('.category-title');
            
            categoryTitles.forEach(title => {
                title.addEventListener('mouseenter', () => {
                    title.style.transform = 'translateY(-3px) scale(1.02)';
                });
                
                title.addEventListener('mouseleave', () => {
                    title.style.transform = 'translateY(0) scale(1)';
                });
            });
        },

        setupSkillBars: function() {
            const skillObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const skillBar = entry.target;
                        const level = skillBar.getAttribute('data-level');
                        skillBar.style.width = level + '%';
                        
                        // Animate percentage text
                        const percentElement = skillBar.parentElement.querySelector('.skill-percent');
                        if (percentElement) {
                            utils.animateValue(percentElement, 0, parseInt(level), 1500, '%');
                        }
                    }
                });
            }, { threshold: 0.5 });

            const skillBars = document.querySelectorAll('.skill-bar');
            skillBars.forEach(bar => {
                bar.style.width = '0%';
                skillObserver.observe(bar);
            });
        }
    };

    // Projects Module
    const Projects = {
        init: function() {
            this.setupFilters();
            this.setupImageModal();
            this.setupShowMore();
        },

        setupShowMore: function() {
            if (!elements.showMoreBtn) return;

            elements.showMoreBtn.addEventListener('click', () => {
                const hiddenItems = document.querySelectorAll('.hidden-item');
                
                hiddenItems.forEach((item, index) => {
                    item.classList.remove('hidden-item');
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                        item.classList.add('visible');
                    }, index * 100);
                });
                
                elements.showMoreBtn.style.display = 'none';
            });
        },

        setupFilters: function() {
            elements.filterButtons.forEach(button => {
                button.addEventListener('click', () => {
                    // Update active state
                    elements.filterButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');

                    const filter = button.getAttribute('data-filter');
                    
                    // إظهار/إخفاء زر "إظهار المزيد"
                    if (filter === 'all') {
                        if (elements.showMoreBtn) {
                            elements.showMoreBtn.style.display = 'inline-flex';
                        }
                    } else {
                        if (elements.showMoreBtn) {
                            elements.showMoreBtn.style.display = 'none';
                        }
                    }

                    elements.galleryItems.forEach((item, index) => {
                        const itemCategory = item.getAttribute('data-category');
                        const shouldShow = filter === 'all' || itemCategory === filter;
                        
                        // للعرض عند اختيار "الكل" - إظهار 6 فقط في البداية
                        if (filter === 'all' && index >= 6 && !item.classList.contains('hidden-item')) {
                            item.style.display = 'none';
                            return;
                        }

                        if (shouldShow) {
                            item.style.display = 'block';
                            setTimeout(() => {
                                item.style.opacity = '1';
                                item.style.transform = 'scale(1)';
                                item.classList.add('visible');
                            }, index * 100);
                        } else {
                            item.style.opacity = '0';
                            item.style.transform = 'scale(0.8)';
                            setTimeout(() => {
                                item.style.display = 'none';
                            }, 300);
                        }
                    });
                });
            });
        },

        setupImageModal: function() {
            if (!elements.imageModal || !elements.modalImage || !elements.modalClose) return;

            // Open modal when clicking on gallery images
            const galleryImages = document.querySelectorAll('.gallery-item img');
            const galleryLinks = document.querySelectorAll('.gallery-link');

            const openModal = (imageSrc, imageAlt) => {
                elements.modalImage.src = imageSrc;
                elements.modalImage.alt = imageAlt;
                elements.imageModal.style.display = 'flex';
                elements.body.style.overflow = 'hidden';
                
                // Add animation
                setTimeout(() => {
                    elements.imageModal.querySelector('.modal-content').style.transform = 'scale(1)';
                }, 10);
            };

            const closeModal = () => {
                const modalContent = elements.imageModal.querySelector('.modal-content');
                modalContent.style.transform = 'scale(0.8)';
                
                setTimeout(() => {
                    elements.imageModal.style.display = 'none';
                    elements.modalImage.src = '';
                    elements.modalImage.alt = '';
                    elements.body.style.overflow = 'auto';
                }, 300);
            };

            galleryImages.forEach(img => {
                img.addEventListener('click', () => openModal(img.src, img.alt));
            });

            galleryLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    if (link.querySelector('i').classList.contains('fa-eye')) {
                        e.preventDefault();
                        const galleryItem = link.closest('.gallery-item');
                        const img = galleryItem.querySelector('img');
                        openModal(img.src, img.alt);
                    }
                });
            });

            elements.modalClose.addEventListener('click', closeModal);

            elements.imageModal.addEventListener('click', (e) => {
                if (e.target === elements.imageModal) {
                    closeModal();
                }
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && elements.imageModal.style.display === 'flex') {
                    closeModal();
                }
            });
        }
    };

    // Contact Module
    const Contact = {
        init: function() {
            this.setupForm();
        },

        setupForm: function() {
            if (!elements.contactForm) return;

            elements.contactForm.addEventListener('submit', (e) => {
                e.preventDefault();

                const formData = new FormData(elements.contactForm);
                const data = {
                    name: formData.get('name'),
                    email: formData.get('email'),
                    subject: formData.get('subject'),
                    message: formData.get('message')
                };

                // Validation
                if (!this.validateForm(data)) return;

                // Simulate form submission
                this.submitForm(data);
            });
        },

        validateForm: function(data) {
            if (!data.name || !data.email || !data.subject || !data.message) {
                utils.showNotification(
                    currentLanguage === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill all fields',
                    'error'
                );
                return false;
            }

            if (!utils.validateEmail(data.email)) {
                utils.showNotification(
                    currentLanguage === 'ar' ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email',
                    'error'
                );
                return false;
            }

            return true;
        },

        submitForm: function(data) {
            // Show loading state
            const submitBtn = elements.contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
            submitBtn.disabled = true;

            // Simulate API call
            setTimeout(() => {
                utils.showNotification(
                    currentLanguage === 'ar' ? 'تم إرسال الرسالة بنجاح!' : 'Message sent successfully!',
                    'success'
                );

                elements.contactForm.reset();
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                
                // Reset form labels
                const labels = elements.contactForm.querySelectorAll('label');
                labels.forEach(label => {
                    label.style.top = '1.25rem';
                    label.style.fontSize = '';
                    label.style.color = '';
                });
            }, 2000);
        }
    };

    // Scroll Module
    const Scroll = {
        init: function() {
            this.setupScrollToTop();
            this.setupScrollToTopOnRefresh();
        },

        setupScrollToTop: function() {
            if (!elements.scrollToTopBtn) return;

            const toggleScrollToTop = () => {
                if (window.pageYOffset > 300) {
                    elements.scrollToTopBtn.classList.add('visible');
                } else {
                    elements.scrollToTopBtn.classList.remove('visible');
                }
            };

            window.addEventListener('scroll', utils.throttle(toggleScrollToTop, 100));

            elements.scrollToTopBtn.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        },

        setupScrollToTopOnRefresh: function() {
            window.scrollTo(0, 0);
            setTimeout(() => {
                window.scrollTo(0, 0);
            }, 100);
        }
    };

    // Performance optimizations
    const Performance = {
        init: function() {
            this.setupLazyLoading();
            this.setupPreloading();
            this.setupReducedMotion();
            this.setupIntersectionObserver();
        },

        setupLazyLoading: function() {
            // Ensure native lazy-loading is enabled for images where supported.
            const allImages = document.querySelectorAll('img');
            allImages.forEach(img => {
                if (!img.hasAttribute('loading')) {
                    img.setAttribute('loading', 'lazy');
                }
            });

            // If project uses data-src pattern, observe and swap the src when visible
            const lazyDataImages = document.querySelectorAll('img[data-src]');
            if (lazyDataImages.length > 0) {
                const imageObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            img.src = img.dataset.src || img.src;
                            img.classList.remove('lazy');
                            observer.unobserve(img);
                        }
                    });
                });

                lazyDataImages.forEach(img => imageObserver.observe(img));
            }
        },

        setupPreloading: function() {
            // Preload only the most critical image to avoid excessive network contention on mobile.
            const criticalResources = [ 'hero.jpg' ];

            criticalResources.forEach(src => {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'image';
                link.href = src;
                document.head.appendChild(link);
            });
        },

        setupReducedMotion: function() {
            // Check for reduced motion preference
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            
            if (prefersReducedMotion) {
                // Disable animations
                const style = document.createElement('style');
                style.textContent = `
                    * {
                        animation-duration: 0.01ms !important;
                        animation-iteration-count: 1 !important;
                        transition-duration: 0.01ms !important;
                        scroll-behavior: auto !important;
                    }
                `;
                document.head.appendChild(style);
            }
        },

        setupIntersectionObserver: function() {
            // Use IntersectionObserver for better performance
            if ('IntersectionObserver' in window) {
                // Observer already set up in other modules
                console.log('IntersectionObserver is supported');
            } else {
                // Fallback for older browsers
                console.log('IntersectionObserver is not supported, using scroll events');
            }
        }
    };

    // Optimized Animations Module
    const optimizedAnimations = {
        init: function() {
            this.setupOptimizedScrollAnimations();
            this.setupReducedMotion();
        },

        setupOptimizedScrollAnimations: function() {
            const animatedElements = document.querySelectorAll('.skill-item, .feature-item, .contact-item, .education-item, .highlight-item');
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        requestAnimationFrame(() => {
                            entry.target.style.opacity = '1';
                            entry.target.style.transform = 'translateY(0)';
                        });
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            animatedElements.forEach(el => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(30px)';
                el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                observer.observe(el);
            });
        },

        setupReducedMotion: function() {
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            
            if (prefersReducedMotion) {
                document.documentElement.style.setProperty('--transition-normal', '0.01ms');
                document.documentElement.style.setProperty('--transition-slow', '0.01ms');
            }
        }
    };

    // Public API
    return {
        init: function() {
            // Initialize all modules
            Navigation.init();
            Animations.init();
            Projects.init();
            Contact.init();
            Scroll.init();
            Performance.init();
            Skills.init();
            optimizedAnimations.init();

            // Add scroll progress
            utils.addScrollProgress();

            // Add global styles for animations
            const globalStyles = document.createElement('style');
            globalStyles.textContent = `
                @keyframes floatParticle {
                    0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
                }
                
                .nav-menu.mobile-open {
                    display: flex !important;
                    position: fixed;
                    top: 80px;
                    left: 0;
                    right: 0;
                    background: var(--neutral-color);
                    flex-direction: column;
                    padding: 2rem;
                    backdrop-filter: blur(20px);
                    border-top: 1px solid var(--glass-border);
                    z-index: 999;
                    animation: slideDown 0.3s ease;
                }
                
                .nav-menu.mobile-open .nav-link {
                    padding: 1.25rem 0;
                    border-bottom: 1px solid var(--glass-border);
                    text-align: center;
                    font-size: 1.2rem;
                }
                
                .nav-menu.mobile-open .nav-link:last-child {
                    border-bottom: none;
                }
                
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .modal-content {
                    transform: scale(0.8);
                    transition: transform 0.3s ease;
                }
                
                .notification-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 1.2rem;
                    cursor: pointer;
                    padding: 0;
                    margin-right: auto;
                }
                
                .mobile-menu-toggle span {
                    transition: all 0.3s ease;
                }
                
                .scroll-progress {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 0%;
                    height: 3px;
                    background: var(--btn-gradient);
                    z-index: 1001;
                    transition: width 0.1s ease;
                }
            `;
            document.head.appendChild(globalStyles);

            console.log('Portfolio App initialized successfully!');
        },

        // Expose utilities for external use
        utils: utils,

        // Language switcher
        setLanguage: function(lang) {
            currentLanguage = lang;
            document.documentElement.lang = lang;
            // Re-initialize language-dependent components
            Animations.setupTypingEffect();
        },

        // Check if page is fully loaded
        isPageLoaded: function() {
            return isPageLoaded;
        }
    };
})();

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    PortfolioApp.init();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause animations when page is not visible
        console.log('Page hidden, pausing animations');
    } else {
        // Resume animations when page becomes visible
        console.log('Page visible, resuming animations');
    }
});

// Handle before unload
window.addEventListener('beforeunload', () => {
    // Clean up if needed
    if (PortfolioApp.utils.animationFrameId) {
        cancelAnimationFrame(PortfolioApp.utils.animationFrameId);
    }
});

// Handle errors
window.addEventListener('error', (e) => {
    console.error('Error:', e.message);
    // Optionally show user-friendly error message
});