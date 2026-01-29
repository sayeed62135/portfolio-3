// Navigation and Section Switching
// Handles navigation between sections with smooth camera transitions

(function() {
    'use strict';

    // Wait for GSAP and Three.js scene to load
    function initNavigation() {
        if (typeof gsap === 'undefined' || !window.threeScene) {
            setTimeout(initNavigation, 100);
            return;
        }

        const navItems = document.querySelectorAll('.nav-item');
        const sections = document.querySelectorAll('.section-panel');
        const { camera, gridGroup } = window.threeScene;

        // Camera positions for each section
        const cameraPositions = {
            'home': { x: 0, y: 0, z: 5 },
            'about': { x: 4, y: 0, z: 4 },
            'resume': { x: -4, y: 1, z: 3 },
            'services': { x: 0, y: 3, z: 2 },
            'portfolio': { x: 0, y: 2, z: 8 },
            'contact': { x: 0, y: -2, z: 5 }
        };

        // Navigation function
        window.navigateTo = function(targetId) {
            // Update active states
            navItems.forEach(item => {
                if(item.dataset.target === targetId) {
                    item.classList.add('active');
                    item.setAttribute('aria-current', 'page');
                } else {
                    item.classList.remove('active');
                    item.removeAttribute('aria-current');
                }
            });

            sections.forEach(sec => {
                if(sec.id === targetId) {
                    sec.classList.add('active');
                    // Announce to screen readers
                    sec.setAttribute('aria-hidden', 'false');
                } else {
                    sec.classList.remove('active');
                    sec.setAttribute('aria-hidden', 'true');
                }
            });

            // Camera animation
            const targetPos = cameraPositions[targetId];
            if (targetPos && camera) {
                gsap.to(camera.position, {
                    x: targetPos.x,
                    y: targetPos.y,
                    z: targetPos.z,
                    duration: 1.5,
                    ease: "power2.inOut"
                });
            }

            // Special grid rotation for certain sections
            if (gridGroup) {
                if(targetId === 'services' || targetId === 'portfolio') {
                    gsap.to(gridGroup.rotation, { 
                        y: Math.PI, 
                        duration: 1.5,
                        ease: "power2.inOut"
                    });
                } else {
                    gsap.to(gridGroup.rotation, { 
                        y: 0, 
                        duration: 1.5,
                        ease: "power2.inOut"
                    });
                }
            }

            // Update URL hash without scrolling
            if (history.pushState) {
                history.pushState(null, null, '#' + targetId);
            } else {
                location.hash = '#' + targetId;
            }

            // Track page view (if analytics is setup)
            if (typeof gtag !== 'undefined') {
                gtag('event', 'page_view', {
                    page_title: targetId,
                    page_location: window.location.href,
                    page_path: '/#' + targetId
                });
            }
        };

        // Add click listeners to navigation items
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const target = item.dataset.target;
                navigateTo(target);
            });

            // Keyboard navigation
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const target = item.dataset.target;
                    navigateTo(target);
                }
            });
        });

        // Handle browser back/forward buttons
        window.addEventListener('popstate', () => {
            const hash = window.location.hash.substring(1);
            if (hash && cameraPositions[hash]) {
                navigateTo(hash);
            } else {
                navigateTo('home');
            }
        });

        // Load section from URL hash on page load
        const initialHash = window.location.hash.substring(1);
        if (initialHash && cameraPositions[initialHash]) {
            // Small delay to ensure everything is loaded
            setTimeout(() => {
                navigateTo(initialHash);
            }, 100);
        }

        // Portfolio "Load More" functionality
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                // You can implement dynamic loading here
                alert('Load more functionality - integrate with your backend or add more portfolio items');
            });
        }

        console.log('Navigation initialized');
    }

    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNavigation);
    } else {
        initNavigation();
    }

})();
