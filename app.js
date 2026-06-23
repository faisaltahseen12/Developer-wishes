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
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    class Heart {
        constructor() {
            this.reset();
            // Stagger initial Y position to avoid all hearts starting from bottom
            this.y = Math.random() * canvas.height;
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = canvas.height + 20;
            this.size = Math.random() * 15 + 10; // width/height
            this.speedY = Math.random() * 0.8 + 0.4;
            this.speedX = Math.sin(Math.random() * Math.PI) * 0.3;
            this.opacity = Math.random() * 0.5 + 0.3;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotSpeed = (Math.random() - 0.5) * 0.01;
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = "rgba(255, 23, 68, 0.4)";
            
            // Draw heart shape
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
            this.opacity -= 0.0005; // Fade out slowly as they float up

            if (this.y < -30 || this.opacity <= 0) {
                this.reset();
            }
        }
    }

    // Initialize hearts
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

    // -------------------------------------------------------------------------
    // 2. EVASIVE "NO" BUTTON LOGIC
    // -------------------------------------------------------------------------
    const btnDecline = document.getElementById("btn-decline");
    
    function evade() {
        // Toggle the button style to absolute so it jumps
        if (!btnDecline.classList.contains("evading")) {
            btnDecline.classList.add("evading");
        }
        
        const padding = 30;
        // Button dimensions
        const btnWidth = btnDecline.offsetWidth;
        const btnHeight = btnDecline.offsetHeight;
        
        // Window dimensions
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // Calculate maximum bounds keeping it completely on screen
        const maxX = windowWidth - btnWidth - padding;
        const maxY = windowHeight - btnHeight - padding;
        
        // Generate random coordinates
        let randomX = Math.random() * (maxX - padding) + padding;
        let randomY = Math.random() * (maxY - padding) + padding;
        
        // Make sure it doesn't overlap exactly with the cursor's location
        // Just general safety positioning
        btnDecline.style.left = `${randomX}px`;
        btnDecline.style.top = `${randomY}px`;
    }

    // Bind events for both desktop (hover) and mobile (touchstart)
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

    // -------------------------------------------------------------------------
    // 3. WIZARD STEP NAVIGATION
    // -------------------------------------------------------------------------
    const steps = [
        "card-proposal",
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
    
    // Form selections state
    const selections = {
        date: "",
        location: "",
        customLocation: "",
        foods: [], // Array for multi-select
        customFood: "",
        note: ""
    };

    function showStep(index) {
        // Hide all cards
        steps.forEach(stepId => {
            const card = document.getElementById(stepId);
            if (card) card.classList.remove("active");
        });
        
        // Show current card
        const currentCard = document.getElementById(steps[index]);
        if (currentCard) {
            currentCard.classList.add("active");
        }
        
        currentStepIndex = index;
        
        // Update progress bar
        if (index > 0 && index < steps.length - 1) {
            progressWrapper.classList.remove("hidden");
            updateProgressBar(index);
        } else {
            progressWrapper.classList.add("hidden");
        }
    }

    function updateProgressBar(wizardIndex) {
        // wizardIndex corresponds to date (1), location (2), food (3), summary (4)
        const activeStep = wizardIndex; // 1-based indicator index
        
        stepIndicators.forEach((indicator, idx) => {
            const indicatorStep = parseInt(indicator.dataset.step);
            indicator.classList.remove("active", "completed");
            
            if (indicatorStep === activeStep) {
                indicator.classList.add("active");
            } else if (indicatorStep < activeStep) {
                indicator.classList.add("completed");
            }
        });
        
        // Set the data-progress on container to fill the connecting line
        progressSteps.setAttribute("data-progress", activeStep - 1);
    }

    // Accept proposal triggers wizard flow
    document.getElementById("btn-accept").addEventListener("click", () => {
        showStep(1); // Go to Date picker card
    });

    // Handle back button on all views
    const backButtons = document.querySelectorAll(".btn-back");
    backButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            if (currentStepIndex > 0) {
                showStep(currentStepIndex - 1);
            }
        });
    });

    // -------------------------------------------------------------------------
    // 4. DATE PICKER CONTROLS
    // -------------------------------------------------------------------------
    const datePicker = document.getElementById("date-picker");
    const btnDateNext = document.getElementById("btn-date-next");
    
    // Restrict date selector to today and onwards
    const todayStr = new Date().toISOString().split('T')[0];
    datePicker.min = todayStr;

    datePicker.addEventListener("input", () => {
        if (datePicker.value) {
            selections.date = datePicker.value;
            btnDateNext.disabled = false;
        } else {
            btnDateNext.disabled = true;
        }
    });

    btnDateNext.addEventListener("click", () => {
        showStep(2); // Go to Location Selection
    });

    // -------------------------------------------------------------------------
    // 5. LOCATION SELECTION LOGIC (Single Select)
    // -------------------------------------------------------------------------
    const locationOptions = document.querySelectorAll("#location-options .option-card");
    const customLocationWrapper = document.getElementById("custom-location-wrapper");
    const customLocationInput = document.getElementById("custom-location-input");
    const btnLocationNext = document.getElementById("btn-location-next");

    locationOptions.forEach(card => {
        card.addEventListener("click", () => {
            // Remove selection styling from all cards
            locationOptions.forEach(c => c.classList.remove("selected"));
            
            card.classList.add("selected");
            const val = card.dataset.value;
            selections.location = val;

            if (val === "custom") {
                customLocationWrapper.classList.remove("hidden");
                customLocationInput.focus();
                validateLocationNextButton();
            } else {
                customLocationWrapper.classList.add("hidden");
                btnLocationNext.disabled = false;
            }
        });
    });

    customLocationInput.addEventListener("input", () => {
        selections.customLocation = customLocationInput.value;
        validateLocationNextButton();
    });

    function validateLocationNextButton() {
        if (selections.location === "custom") {
            btnLocationNext.disabled = !customLocationInput.value.trim();
        } else {
            btnLocationNext.disabled = !selections.location;
        }
    }

    btnLocationNext.addEventListener("click", () => {
        showStep(3); // Go to Food Selection
    });

    // -------------------------------------------------------------------------
    // 6. FOOD SELECTION LOGIC (Multi-Select)
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
                    customFoodWrapper.classList.remove("hidden");
                    customFoodInput.focus();
                } else {
                    customFoodWrapper.classList.add("hidden");
                    selections.customFood = "";
                    customFoodInput.value = "";
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

    customFoodInput.addEventListener("input", () => {
        selections.customFood = customFoodInput.value;
        validateFoodNextButton();
    });

    function validateFoodNextButton() {
        const hasStandardFood = selections.foods.length > 0;
        const isCustomSelected = document.querySelector('#food-options .option-card[data-value="custom"]').classList.contains("selected");
        const hasCustomFood = isCustomSelected && customFoodInput.value.trim().length > 0;
        
        if (hasStandardFood || hasCustomFood) {
            btnFoodNext.disabled = false;
        } else {
            btnFoodNext.disabled = true;
        }
    }

    btnFoodNext.addEventListener("click", () => {
        populateSummary();
        showStep(4); // Go to Summary Card
    });

    // -------------------------------------------------------------------------
    // 7. SUMMARY & CONFIRMATION
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
        // Date
        summaryDate.textContent = formatDate(selections.date);
        
        // Location
        if (selections.location === "custom") {
            summaryLocation.textContent = selections.customLocation.trim();
        } else {
            summaryLocation.textContent = selections.location;
        }
        
        // Food list compilation
        let foodItems = [...selections.foods];
        const isCustomSelected = document.querySelector('#food-options .option-card[data-value="custom"]').classList.contains("selected");
        if (isCustomSelected && selections.customFood.trim()) {
            foodItems.push(selections.customFood.trim());
        }
        summaryFood.textContent = foodItems.join(", ");
    }

    // -------------------------------------------------------------------------
    // 8. FINAL SUBMIT & WHATSAPP REDIRECTION
    // -------------------------------------------------------------------------
    const btnSubmit = document.getElementById("btn-submit");
    const btnWhatsAppFallback = document.getElementById("btn-whatsapp-fallback");

    btnSubmit.addEventListener("click", () => {
        selections.note = loveNoteInput.value.trim();

        // Format selected foods
        let foodItems = [...selections.foods];
        const isCustomSelected = document.querySelector('#food-options .option-card[data-value="custom"]').classList.contains("selected");
        if (isCustomSelected && selections.customFood.trim()) {
            foodItems.push(selections.customFood.trim());
        }
        const foodString = foodItems.join(", ");
        
        // Format Location
        const locationString = (selections.location === "custom") 
            ? selections.customLocation.trim() 
            : selections.location;

        const dateStringFormatted = formatDate(selections.date);

        // Build sweet message text for Sohail (03041709829)
        // Emojis are encoded in Unicode escape characters to prevent local file-saving encoding corruptions:
        // \uD83D\uDC96 = 💖, \uD83D\uDCC5 = 📅, \uD83D\uDCCD = 📍, \uD83C\uDF54 = 🍔, \uD83D\uDC8C = 💌
        const recipientNumber = "923041709829"; // International format for Pakistan
        let messageText = `Hey! \uD83D\uDC96\n\nI've accepted your date invitation! Here is what I selected for our perfect date:\n\n\uD83D\uDCC5 Date: ${dateStringFormatted}\n\uD83D\uDCCD Location: ${locationString}\n\uD83C\uDF54 Food Chosen: ${foodString}`;
        
        if (selections.note) {
            messageText += `\n\n\uD83D\uDC8C Message for you:\n"${selections.note}"`;
        }

        const encodedMessage = encodeURIComponent(messageText);
        
        // Detect if mobile device to choose the most direct WhatsApp API
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const whatsappUrl = isMobile 
            ? `https://api.whatsapp.com/send?phone=${recipientNumber}&text=${encodedMessage}`
            : `https://web.whatsapp.com/send?phone=${recipientNumber}&text=${encodedMessage}`;

        // Trigger WhatsApp Redirect (direct redirection for mobile, new tab for desktop)
        if (isMobile) {
            window.location.href = whatsappUrl;
        } else {
            window.open(whatsappUrl, "_blank");
        }

        // Set fallback link inside success page in case popup gets blocked by browser
        btnWhatsAppFallback.href = whatsappUrl;

        // Transition to success card
        showStep(5); // Go to final Success Page
    });
});
