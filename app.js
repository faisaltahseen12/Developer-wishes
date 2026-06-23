// Application logic for Date Proposal website

document.addEventListener("DOMContentLoaded", () => {
    // -------------------------------------------------------------------------
    // 1. FLOATING HEARTS CANVAS BACKGROUND
    // -------------------------------------------------------------------------
    const canvas = document.getElementById("heartsCanvas");
    const ctx = canvas.getContext("2d");
    
    let hearts = [];
    const maxHearts = 40;

    function resizeCanvas() {
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    }
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    class Heart {
        constructor() {
            this.reset();
            if (canvas) this.y = Math.random() * canvas.height;
        }

        reset() {
            if (!canvas) return;
            this.x = Math.random() * canvas.width;
            this.y = canvas.height + 20;
            this.size = Math.random() * 15 + 10;
            this.speedY = Math.random() * 0.8 + 0.4;
            this.speedX = Math.sin(Math.random() * Math.PI) * 0.3;
            this.opacity = Math.random() * 0.5 + 0.3;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotSpeed = (Math.random() - 0.5) * 0.01;
        }

        draw() {
            if (!ctx) return;
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = "rgba(255, 23, 68, 0.4)";
            
            ctx.beginPath();
            const d = this.size;
            ctx.moveTo(0, -d / 4);
            ctx.bezierCurveTo(-d / 2, -d / 2, -d, -d / 4, -d, d / 4);
            ctx.bezierCurveTo(-d, d * 0.7, 0, d * 1.1, 0, d * 1.2);
            ctx.bezierCurveTo(0, d * 1.1, d, d * 0.7, d, d * 0.4);
            ctx.bezierCurveTo(d, -d / 4, d / 2, -d / 2, 0, -d / 4);
            ctx.closePath();
            ctx.fill();
            
            ctx.restore();
        }

        update() {
            this.y -= this.speedY;
            this.x += this.speedX;
            this.rotation += this.rotSpeed;
            this.opacity -= 0.0005;

            if (this.y < -30 || this.opacity <= 0) {
                this.reset();
            }
        }
    }

    if (canvas) {
        for (let i = 0; i < maxHearts; i++) {
            hearts.push(new Heart());
        }

        function animateHearts() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            hearts.forEach(heart => {
                heart.update();
                heart.draw();
            });
            requestAnimationFrame(animateHearts);
        }
        animateHearts();
    }

    // -------------------------------------------------------------------------
    // 2. EVASIVE "NO" BUTTON LOGIC
    // -------------------------------------------------------------------------
    const btnDecline = document.getElementById("btn-decline");
    
    function evade() {
        if (!btnDecline) return;
        if (!btnDecline.classList.contains("evading")) {
            btnDecline.classList.add("evading");
        }
        
        const padding = 30;
        const btnWidth = btnDecline.offsetWidth;
        const btnHeight = btnDecline.offsetHeight;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        const maxX = windowWidth - btnWidth - padding;
        const maxY = windowHeight - btnHeight - padding;
        
        let randomX = Math.random() * (maxX - padding) + padding;
        let randomY = Math.random() * (maxY - padding) + padding;
        
        btnDecline.style.left = `${randomX}px`;
        btnDecline.style.top = `${randomY}px`;
    }

    if (btnDecline) {
        btnDecline.addEventListener("mouseover", evade);
        btnDecline.addEventListener("mouseenter", evade);
        btnDecline.addEventListener("click", (e) => {
            e.preventDefault();
            evade();
        });
        btnDecline.addEventListener("touchstart", (e) => {
            e.preventDefault();
            evade();
        });
    }

    // -------------------------------------------------------------------------
    // 3. WIZARD STEP NAVIGATION
    // -------------------------------------------------------------------------
    const steps = [
        "card-proposal",
        "card-info",
        "card-date",
        "card-location",
        "card-food",
        "card-summary",
        "card-success"
    ];
    let currentStepIndex = 0;
    
    const progressWrapper = document.getElementById("progressWrapper");
    const progressSteps = document.querySelector(".progress-steps");
    const stepIndicators = document.querySelectorAll(".step-indicator");
    
    const selections = {
        name: "",
        phone: "",
        date: "",
        location: "",
        customLocation: "",
        foods: [],
        customFood: "",
        note: ""
    };

    function showStep(index) {
        // Hide all stage cards
        steps.forEach(stepId => {
            const card = document.getElementById(stepId);
            if (card) card.classList.remove("active");
        });
        
        // Show current step card
        const currentCard = document.getElementById(steps[index]);
        if (currentCard) {
            currentCard.classList.add("active");
        }
        
        currentStepIndex = index;
        
        // Handle progress bar visibility
        if (index > 0 && index < steps.length - 1) {
            if (progressWrapper) progressWrapper.classList.remove("hidden");
            updateProgressBar(index);
        } else {
            if (progressWrapper) progressWrapper.classList.add("hidden");
        }
    }

    function updateProgressBar(wizardIndex) {
        if (!progressSteps) return;
        const activeStep = wizardIndex; // Step indices match our indicator data-steps 1 to 5
        
        stepIndicators.forEach((indicator) => {
            const indicatorStep = parseInt(indicator.dataset.step);
            indicator.classList.remove("active", "completed");
            
            if (indicatorStep === activeStep) {
                indicator.classList.add("active");
            } else if (indicatorStep < activeStep) {
                indicator.classList.add("completed");
            }
        });
        
        progressSteps.setAttribute("data-progress", activeStep - 1);
    }

    // Accept proposal
    const btnAccept = document.getElementById("btn-accept");
    if (btnAccept) {
        btnAccept.addEventListener("click", () => {
            showStep(1); // Go to User Info Card
        });
    }

    // Back buttons
    const backButtons = document.querySelectorAll(".btn-back");
    backButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            if (currentStepIndex > 0) {
                showStep(currentStepIndex - 1);
            }
        });
    });

    // -------------------------------------------------------------------------
    // 4. USER INFO CARD (Name & Contact) HANDLERS
    // -------------------------------------------------------------------------
    const userNameInput = document.getElementById("user-name");
    const userPhoneInput = document.getElementById("user-phone");
    const btnInfoNext = document.getElementById("btn-info-next");

    function validateInfoInputs() {
        if (userNameInput && userPhoneInput && btnInfoNext) {
            const nameVal = userNameInput.value.trim();
            const phoneVal = userPhoneInput.value.trim();
            btnInfoNext.disabled = !(nameVal.length > 0 && phoneVal.length > 0);
        }
    }

    if (userNameInput) userNameInput.addEventListener("input", validateInfoInputs);
    if (userPhoneInput) userPhoneInput.addEventListener("input", validateInfoInputs);

    if (btnInfoNext) {
        btnInfoNext.addEventListener("click", () => {
            selections.name = userNameInput.value.trim();
            selections.phone = userPhoneInput.value.trim();
            showStep(2); // Go to Date picker card
        });
    }

    // -------------------------------------------------------------------------
    // 5. DATE PICKER CONTROLS
    // -------------------------------------------------------------------------
    const datePicker = document.getElementById("date-picker");
    const btnDateNext = document.getElementById("btn-date-next");
    
    if (datePicker) {
        const todayStr = new Date().toISOString().split('T')[0];
        datePicker.min = todayStr;

        datePicker.addEventListener("input", () => {
            if (datePicker.value) {
                selections.date = datePicker.value;
                if (btnDateNext) btnDateNext.disabled = false;
            } else {
                if (btnDateNext) btnDateNext.disabled = true;
            }
        });
    }

    if (btnDateNext) {
        btnDateNext.addEventListener("click", () => {
            showStep(3); // Go to Location card
        });
    }

    // -------------------------------------------------------------------------
    // 6. LOCATION SELECTION LOGIC (Single Select)
    // -------------------------------------------------------------------------
    const locationOptions = document.querySelectorAll("#location-options .option-card");
    const customLocationWrapper = document.getElementById("custom-location-wrapper");
    const customLocationInput = document.getElementById("custom-location-input");
    const btnLocationNext = document.getElementById("btn-location-next");

    locationOptions.forEach(card => {
        card.addEventListener("click", () => {
            locationOptions.forEach(c => c.classList.remove("selected"));
            card.classList.add("selected");
            const val = card.dataset.value;
            selections.location = val;

            if (val === "custom") {
                if (customLocationWrapper) customLocationWrapper.classList.remove("hidden");
                if (customLocationInput) customLocationInput.focus();
                validateLocationNextButton();
            } else {
                if (customLocationWrapper) customLocationWrapper.classList.add("hidden");
                if (btnLocationNext) btnLocationNext.disabled = false;
            }
        });
    });

    if (customLocationInput) {
        customLocationInput.addEventListener("input", () => {
            selections.customLocation = customLocationInput.value;
            validateLocationNextButton();
        });
    }

    function validateLocationNextButton() {
        if (!btnLocationNext) return;
        if (selections.location === "custom") {
            btnLocationNext.disabled = !customLocationInput.value.trim();
        } else {
            btnLocationNext.disabled = !selections.location;
        }
    }

    if (btnLocationNext) {
        btnLocationNext.addEventListener("click", () => {
            showStep(4); // Go to Food card
        });
    }

    // -------------------------------------------------------------------------
    // 7. FOOD SELECTION LOGIC (Multi-Select)
    // -------------------------------------------------------------------------
    const foodOptions = document.querySelectorAll("#food-options .option-card");
    const customFoodWrapper = document.getElementById("custom-food-wrapper");
    const customFoodInput = document.getElementById("custom-food-input");
    const btnFoodNext = document.getElementById("btn-food-next");

    foodOptions.forEach(card => {
        card.addEventListener("click", () => {
            const val = card.dataset.value;
            card.classList.toggle("selected");

            if (val === "custom") {
                if (card.classList.contains("selected")) {
                    if (customFoodWrapper) customFoodWrapper.classList.remove("hidden");
                    if (customFoodInput) customFoodInput.focus();
                } else {
                    if (customFoodWrapper) customFoodWrapper.classList.add("hidden");
                    selections.customFood = "";
                    if (customFoodInput) customFoodInput.value = "";
                }
            } else {
                if (card.classList.contains("selected")) {
                    if (!selections.foods.includes(val)) {
                        selections.foods.push(val);
                    }
                } else {
                    selections.foods = selections.foods.filter(item => item !== val);
                }
            }
            validateFoodNextButton();
        });
    });

    if (customFoodInput) {
        customFoodInput.addEventListener("input", () => {
            selections.customFood = customFoodInput.value;
            validateFoodNextButton();
        });
    }

    function validateFoodNextButton() {
        if (!btnFoodNext) return;
        const hasStandardFood = selections.foods.length > 0;
        const customCard = document.querySelector('#food-options .option-card[data-value="custom"]');
        const isCustomSelected = customCard && customCard.classList.contains("selected");
        const hasCustomFood = isCustomSelected && customFoodInput.value.trim().length > 0;
        
        btnFoodNext.disabled = !(hasStandardFood || hasCustomFood);
    }

    if (btnFoodNext) {
        btnFoodNext.addEventListener("click", () => {
            populateSummary();
            showStep(5); // Go to Summary card
        });
    }

    // -------------------------------------------------------------------------
    // 8. SUMMARY RENDERER
    // -------------------------------------------------------------------------
    const summaryDate = document.getElementById("summary-date");
    const summaryLocation = document.getElementById("summary-location");
    const summaryFood = document.getElementById("summary-food");
    const loveNoteInput = document.getElementById("love-note");

    function formatDate(dateString) {
        if (!dateString) return "-";
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dateObj = new Date(dateString);
        return dateObj.toLocaleDateString("en-US", options);
    }

    function populateSummary() {
        if (summaryDate) summaryDate.textContent = formatDate(selections.date);
        
        if (summaryLocation) {
            summaryLocation.textContent = (selections.location === "custom") 
                ? selections.customLocation.trim() 
                : selections.location;
        }
        
        if (summaryFood) {
            let foodItems = [...selections.foods];
            const customCard = document.querySelector('#food-options .option-card[data-value="custom"]');
            const isCustomSelected = customCard && customCard.classList.contains("selected");
            if (isCustomSelected && selections.customFood.trim()) {
                foodItems.push(selections.customFood.trim());
            }
            summaryFood.textContent = foodItems.join(", ");
        }
    }

    // -------------------------------------------------------------------------
    // 9. SUBMISSION & DISPATCH SYSTEM (Direct Redirection to Sohail)
    // -------------------------------------------------------------------------
    const btnSubmit = document.getElementById("btn-submit");
    const btnWhatsAppFallback = document.getElementById("btn-whatsapp-fallback");

    if (btnSubmit) {
        btnSubmit.addEventListener("click", () => {
            selections.note = loveNoteInput ? loveNoteInput.value.trim() : "";

            let foodItems = [...selections.foods];
            const customCard = document.querySelector('#food-options .option-card[data-value="custom"]');
            const isCustomSelected = customCard && customCard.classList.contains("selected");
            if (isCustomSelected && selections.customFood.trim()) {
                foodItems.push(selections.customFood.trim());
            }
            const foodString = foodItems.join(", ");
            
            const locationString = (selections.location === "custom") 
                ? selections.customLocation.trim() 
                : selections.location;

            const dateStringFormatted = formatDate(selections.date);

            // Message template containing the girl's name & phone number
            // Emojis are encoded in Unicode escape characters to prevent local file-saving encoding corruptions:
            // \uD83D\uDC96 = 💖, \uD83D\uDCC5 = 📅, \uD83D\uDCCD = 📍, \uD83C\uDF54 = 🍔, \uD83D\uDC8C = 💌, \uD83D\uDC64 = 👤, \uD83D\uDCF1 = 📱
            let messageText = `Hey! \uD83D\uDC96\n\nI've accepted your date invitation! Here are my details:\n\n\uD83D\uDC64 Name: ${selections.name}\n\uD83D\uDCF1 Number: ${selections.phone}\n\n\uD83D\uDCC5 Date Selected: ${dateStringFormatted}\n\uD83D\uDCCD Location Selected: ${locationString}\n\uD83C\uDF54 Food Chosen: ${foodString}`;
            if (selections.note) {
                messageText += `\n\n\uD83D\uDC8C Message for you:\n"${selections.note}"`;
            }

            const encodedMessage = encodeURIComponent(messageText);
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            
            // Destination is hardcoded secretly to Sohail's number: 03041709829
            const recipientNumber = "923041709829"; 
            
            const whatsappUrl = isMobile 
                ? `https://api.whatsapp.com/send?phone=${recipientNumber}&text=${encodedMessage}`
                : `https://web.whatsapp.com/send?phone=${recipientNumber}&text=${encodedMessage}`;

            // Trigger Redirection
            if (isMobile) {
                window.location.href = whatsappUrl;
            } else {
                window.open(whatsappUrl, "_blank");
            }

            if (btnWhatsAppFallback) {
                btnWhatsAppFallback.href = whatsappUrl;
            }

            showStep(6); // Show success step
        });
    }

    // Initialize proposal
    showStep(0);
});
