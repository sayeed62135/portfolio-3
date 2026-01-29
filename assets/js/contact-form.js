// Contact Form Handler
// Supports multiple backends: FormSpree, Web3Forms, EmailJS, or custom PHP

(function() {
    'use strict';

    const form = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');

    if (!form) return;

    // Configuration - Choose your backend
    const CONFIG = {
        // Option 1: FormSpree (Easiest - just add your form ID)
        formspree: {
            enabled: true,
            endpoint: 'https://formspree.io/f/YOUR_FORM_ID' // Replace with your FormSpree form ID
        },
        
        // Option 2: Web3Forms (Free, no signup needed)
        web3forms: {
            enabled: false,
            accessKey: 'YOUR_WEB3FORMS_ACCESS_KEY' // Get from https://web3forms.com
        },
        
        // Option 3: EmailJS (Requires account)
        emailjs: {
            enabled: false,
            serviceID: 'YOUR_SERVICE_ID',
            templateID: 'YOUR_TEMPLATE_ID',
            publicKey: 'YOUR_PUBLIC_KEY'
        },
        
        // Option 4: Custom PHP backend
        customPHP: {
            enabled: false,
            endpoint: 'contact.php'
        }
    };

    // Form submission handler
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get form data
        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message')
        };

        // Validate
        if (!validateForm(data)) {
            return;
        }

        // Disable submit button
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        try {
            let success = false;

            // Try FormSpree
            if (CONFIG.formspree.enabled) {
                success = await sendViaFormSpree(data);
            }
            // Try Web3Forms
            else if (CONFIG.web3forms.enabled) {
                success = await sendViaWeb3Forms(data);
            }
            // Try EmailJS
            else if (CONFIG.emailjs.enabled) {
                success = await sendViaEmailJS(data);
            }
            // Try Custom PHP
            else if (CONFIG.customPHP.enabled) {
                success = await sendViaPHP(data);
            }
            else {
                throw new Error('No email service configured. Please set up FormSpree, Web3Forms, EmailJS, or custom PHP backend.');
            }

            if (success) {
                showStatus('success', 'Message sent successfully! I\'ll get back to you soon.');
                form.reset();
            }

        } catch (error) {
            console.error('Form submission error:', error);
            showStatus('error', 'Failed to send message. Please try again or email directly at sayeed.swadeshit@gmail.com');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });

    // Validation
    function validateForm(data) {
        if (!data.name || data.name.trim().length < 2) {
            showStatus('error', 'Please enter your name (at least 2 characters)');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!data.email || !emailRegex.test(data.email)) {
            showStatus('error', 'Please enter a valid email address');
            return false;
        }

        if (!data.subject || data.subject.trim().length < 3) {
            showStatus('error', 'Please enter a subject (at least 3 characters)');
            return false;
        }

        if (!data.message || data.message.trim().length < 10) {
            showStatus('error', 'Please enter a message (at least 10 characters)');
            return false;
        }

        return true;
    }

    // FormSpree integration
    async function sendViaFormSpree(data) {
        const response = await fetch(CONFIG.formspree.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('FormSpree request failed');
        }

        return true;
    }

    // Web3Forms integration
    async function sendViaWeb3Forms(data) {
        const payload = {
            access_key: CONFIG.web3forms.accessKey,
            name: data.name,
            email: data.email,
            subject: data.subject,
            message: data.message
        };

        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.message || 'Web3Forms submission failed');
        }

        return true;
    }

    // EmailJS integration
    async function sendViaEmailJS(data) {
        // Load EmailJS SDK if not already loaded
        if (typeof emailjs === 'undefined') {
            await loadScript('https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js');
            emailjs.init(CONFIG.emailjs.publicKey);
        }

        const templateParams = {
            from_name: data.name,
            from_email: data.email,
            subject: data.subject,
            message: data.message
        };

        const response = await emailjs.send(
            CONFIG.emailjs.serviceID,
            CONFIG.emailjs.templateID,
            templateParams
        );

        if (response.status !== 200) {
            throw new Error('EmailJS request failed');
        }

        return true;
    }

    // Custom PHP backend
    async function sendViaPHP(data) {
        const response = await fetch(CONFIG.customPHP.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message || 'Server error');
        }

        return true;
    }

    // Utility: Load external script
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Show status message
    function showStatus(type, message) {
        if (!formStatus) return;

        formStatus.className = 'form-status ' + type;
        formStatus.textContent = message;
        formStatus.setAttribute('role', 'alert');

        // Auto-hide after 5 seconds
        setTimeout(() => {
            formStatus.style.display = 'none';
        }, 5000);
    }

    // Real-time validation (optional)
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            if (input.value.trim()) {
                input.style.borderColor = 'var(--accent-gold)';
            } else {
                input.style.borderColor = 'var(--border-glass)';
            }
        });
    });

    console.log('Contact form initialized');

})();

/* ============================================
   SETUP INSTRUCTIONS:
   ============================================
   
   OPTION 1: FormSpree (Recommended - Easiest)
   1. Go to https://formspree.io
   2. Sign up for free
   3. Create a new form
   4. Copy your form endpoint URL
   5. Replace 'YOUR_FORM_ID' in the config above
   6. Set formspree.enabled = true
   
   OPTION 2: Web3Forms (No signup needed)
   1. Go to https://web3forms.com
   2. Get your free access key
   3. Replace 'YOUR_WEB3FORMS_ACCESS_KEY' in config
   4. Set web3forms.enabled = true
   
   OPTION 3: EmailJS (More features)
   1. Go to https://www.emailjs.com
   2. Sign up and create a service
   3. Create an email template
   4. Get your Service ID, Template ID, and Public Key
   5. Update the config with your credentials
   6. Set emailjs.enabled = true
   
   OPTION 4: Custom PHP Backend
   1. Create a contact.php file on your server
   2. Set customPHP.enabled = true
   3. See contact-backend.php for example code
   
   ============================================
*/
