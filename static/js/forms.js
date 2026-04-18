// Water Management System - Forms JavaScript

class WaterForms {
    constructor() {
        this.init();
    }

    init() {
        this.initializeFormValidation();
        this.setupUsageForm();
        this.setupQualityForm();
        this.setupRegistrationForm();
        this.setupLoginForm();
    }

    initializeFormValidation() {
        // Bootstrap form validation
        const forms = document.querySelectorAll('.needs-validation');
        forms.forEach(form => {
            form.addEventListener('submit', event => {
                if (!form.checkValidity()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                form.classList.add('was-validated');
            });
        });
    }

    setupUsageForm() {
        const usageForm = document.getElementById('usage-form');
        if (!usageForm) return;

        const usageInput = document.getElementById('usage_liters');
        const sourceSelect = document.getElementById('source');
        const purposeSelect = document.getElementById('purpose');
        const locationSelect = document.getElementById('location');

        // Real-time validation
        usageInput?.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9.]/g, '');
            if (this.value < 0) this.value = 0;
            if (this.value > 1000000) this.value = 1000000;
        });

        // Auto-calculate cost if rate is available
        usageInput?.addEventListener('blur', function() {
            calculateCost();
        });

        // Form submission
        usageForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.submitUsageForm();
        });
    }

    setupQualityForm() {
        const qualityForm = document.getElementById('quality-form');
        if (!qualityForm) return;

        const phInput = document.getElementById('ph_level');
        const turbidityInput = document.getElementById('turbidity');
        const chlorineInput = document.getElementById('chlorine');
        const temperatureInput = document.getElementById('temperature');
        const dissolvedOxygenInput = document.getElementById('dissolved_oxygen');
        const conductivityInput = document.getElementById('conductivity');

        // Real-time validation and quality status calculation
        const qualityInputs = [phInput, turbidityInput, chlorineInput, temperatureInput, dissolvedOxygenInput, conductivityInput];
        
        qualityInputs.forEach(input => {
            if (input) {
                input.addEventListener('input', function() {
                    validateQualityInput(this);
                    calculateQualityStatus();
                });
            }
        });

        qualityForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.submitQualityForm();
        });
    }

    setupRegistrationForm() {
        const registrationForm = document.getElementById('registration-form');
        if (!registrationForm) return;

        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirm_password');
        const emailInput = document.getElementById('email');
        const usernameInput = document.getElementById('username');

        // Password strength indicator
        passwordInput?.addEventListener('input', function() {
            updatePasswordStrength(this.value);
        });

        // Confirm password validation
        confirmPasswordInput?.addEventListener('input', function() {
            validatePasswordMatch();
        });

        // Email validation
        emailInput?.addEventListener('blur', function() {
            validateEmail(this);
        });

        // Username availability check
        usernameInput?.addEventListener('blur', function() {
            checkUsernameAvailability(this.value);
        });

        registrationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.submitRegistrationForm();
        });
    }

    setupLoginForm() {
        const loginForm = document.getElementById('login-form');
        if (!loginForm) return;

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.submitLoginForm();
        });
    }

    // Validation functions
    validateQualityInput(input) {
        const value = parseFloat(input.value);
        const min = parseFloat(input.min);
        const max = parseFloat(input.max);

        if (isNaN(value)) {
            input.setCustomValidity('Please enter a valid number');
        } else if (value < min || value > max) {
            input.setCustomValidity(`Value must be between ${min} and ${max}`);
        } else {
            input.setCustomValidity('');
        }
    }

    calculateQualityStatus() {
        const ph = parseFloat(document.getElementById('ph_level')?.value) || 0;
        const turbidity = parseFloat(document.getElementById('turbidity')?.value) || 0;
        const chlorine = parseFloat(document.getElementById('chlorine')?.value) || 0;

        let status = 'Poor';
        let statusClass = 'danger';

        if (ph >= 6.5 && ph <= 8.5 && turbidity < 5 && chlorine >= 0.2 && chlorine <= 1.0) {
            status = 'Excellent';
            statusClass = 'success';
        } else if (ph >= 6.0 && ph <= 9.0 && turbidity < 10 && chlorine >= 0.1 && chlorine <= 2.0) {
            status = 'Good';
            statusClass = 'primary';
        } else if (ph >= 5.5 && ph <= 9.5 && turbidity < 20 && chlorine < 3.0) {
            status = 'Fair';
            statusClass = 'warning';
        }

        const statusElement = document.getElementById('quality_status');
        if (statusElement) {
            statusElement.value = status;
            statusElement.className = `form-control text-${statusClass} fw-bold`;
        }
    }

    calculateCost() {
        const usage = parseFloat(document.getElementById('usage_liters')?.value) || 0;
        const rate = 0.001; // Example rate: $0.001 per liter
        const cost = (usage * rate).toFixed(2);
        
        const costInput = document.getElementById('cost');
        if (costInput) {
            costInput.value = cost;
        }
    }

    updatePasswordStrength(password) {
        const strengthElement = document.getElementById('password-strength');
        if (!strengthElement) return;

        let strength = 0;
        let feedback = [];

        if (password.length >= 8) strength++;
        else feedback.push('At least 8 characters');

        if (/[a-z]/.test(password)) strength++;
        else feedback.push('Lowercase letter');

        if (/[A-Z]/.test(password)) strength++;
        else feedback.push('Uppercase letter');

        if (/[0-9]/.test(password)) strength++;
        else feedback.push('Number');

        if (/[^a-zA-Z0-9]/.test(password)) strength++;
        else feedback.push('Special character');

        const strengthLevels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
        const strengthClasses = ['danger', 'warning', 'info', 'primary', 'success'];

        strengthElement.textContent = strengthLevels[strength];
        strengthElement.className = `form-text text-${strengthClasses[strength]}`;
        
        if (feedback.length > 0) {
            strengthElement.textContent += ` (Missing: ${feedback.join(', ')})`;
        }
    }

    validatePasswordMatch() {
        const password = document.getElementById('password')?.value;
        const confirmPassword = document.getElementById('confirm_password')?.value;
        const confirmInput = document.getElementById('confirm_password');

        if (confirmInput) {
            if (password !== confirmPassword) {
                confirmInput.setCustomValidity('Passwords do not match');
            } else {
                confirmInput.setCustomValidity('');
            }
        }
    }

    validateEmail(emailInput) {
        const email = emailInput.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            emailInput.setCustomValidity('Please enter a valid email address');
        } else {
            emailInput.setCustomValidity('');
        }
    }

    async checkUsernameAvailability(username) {
        if (!username || username.length < 3) return;

        try {
            const response = await fetch(`/api/check-username?username=${username}`);
            const data = await response.json();
            
            const usernameInput = document.getElementById('username');
            if (data.exists) {
                usernameInput.setCustomValidity('Username is already taken');
            } else {
                usernameInput.setCustomValidity('');
            }
        } catch (error) {
            console.error('Error checking username:', error);
        }
    }

    // Form submission functions
    async submitUsageForm() {
        const form = document.getElementById('usage-form');
        const submitBtn = form.querySelector('button[type="submit"]');
        
        showLoadingSpinner(submitBtn);

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await postData('/add-usage', data);
            if (response && response.success) {
                showAlert('Water usage recorded successfully!', 'success');
                form.reset();
                form.classList.remove('was-validated');
            }
        } catch (error) {
            console.error('Error submitting usage form:', error);
        } finally {
            hideLoadingSpinner(submitBtn, 'Record Usage');
        }
    }

    async submitQualityForm() {
        const form = document.getElementById('quality-form');
        const submitBtn = form.querySelector('button[type="submit"]');
        
        showLoadingSpinner(submitBtn);

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await postData('/add-quality', data);
            if (response && response.success) {
                showAlert('Water quality test recorded successfully!', 'success');
                form.reset();
                form.classList.remove('was-validated');
            }
        } catch (error) {
            console.error('Error submitting quality form:', error);
        } finally {
            hideLoadingSpinner(submitBtn, 'Record Quality Test');
        }
    }

    async submitRegistrationForm() {
        const form = document.getElementById('registration-form');
        const submitBtn = form.querySelector('button[type="submit"]');
        
        showLoadingSpinner(submitBtn);

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await postData('/register', data);
            if (response && response.success) {
                showAlert('Registration successful! Please log in.', 'success');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            }
        } catch (error) {
            console.error('Error submitting registration form:', error);
        } finally {
            hideLoadingSpinner(submitBtn, 'Register');
        }
    }

    async submitLoginForm() {
        const form = document.getElementById('login-form');
        const submitBtn = form.querySelector('button[type="submit"]');
        
        showLoadingSpinner(submitBtn);

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await postData('/login', data);
            if (response && response.success) {
                showAlert('Login successful!', 'success');
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1000);
            } else {
                showAlert('Invalid username or password', 'danger');
            }
        } catch (error) {
            console.error('Error submitting login form:', error);
            showAlert('Login failed. Please try again.', 'danger');
        } finally {
            hideLoadingSpinner(submitBtn, 'Login');
        }
    }
}

// Initialize forms when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.waterForms = new WaterForms();
});
