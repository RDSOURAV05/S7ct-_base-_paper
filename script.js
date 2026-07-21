// SafeAd AI Webpage Interactive Script

// --- Sticky Navigation Scroll Effect ---
window.addEventListener('scroll', () => {
    const header = document.getElementById('main-header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    
    // Highlight Active Link on Scroll
    highlightNavLink();
});

// --- Active Link Highlighting ---
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-links a');

function highlightNavLink() {
    let scrollPosition = window.scrollY + 100;
    
    sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');
        
        if (scrollPosition >= top && scrollPosition < top + height) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${id}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// --- Mobile Navigation Menu Toggle ---
const menuToggle = document.getElementById('menu-toggle');
const navMenu = document.getElementById('nav-menu');

if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        // Animate Hamburger
        const spans = menuToggle.querySelectorAll('span');
        spans[0].style.transform = navMenu.classList.contains('active') ? 'rotate(45deg) translate(6px, 6px)' : 'none';
        spans[1].style.opacity = navMenu.classList.contains('active') ? '0' : '1';
        spans[2].style.transform = navMenu.classList.contains('active') ? 'rotate(-45deg) translate(6px, -6px)' : 'none';
    });
    
    // Close mobile nav when link is clicked
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            const spans = menuToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        });
    });
}

// --- Dataset Cards Accordion Expand/Collapse ---
function toggleDataset(cardElement) {
    // Check if clicked card is already expanded
    const isExpanded = cardElement.classList.contains('expanded');
    
    // Close all cards first
    document.querySelectorAll('.dataset-card').forEach(card => {
        card.classList.remove('expanded');
        const details = card.querySelector('.dataset-expanded-details');
        if (details) details.style.maxHeight = '0px';
    });
    
    // If it wasn't expanded, expand it now
    if (!isExpanded) {
        cardElement.classList.add('expanded');
        const details = cardElement.querySelector('.dataset-expanded-details');
        if (details) {
            // Set max-height to scrollHeight to animate smoothly
            details.style.maxHeight = details.scrollHeight + 'px';
        }
    }
}

// --- BibTeX Block Toggle ---
function toggleBibtex() {
    const block = document.getElementById('bibtex-block');
    if (block) {
        block.style.display = block.style.display === 'block' ? 'none' : 'block';
    }
}

// --- Dashboard Tab Switcher ---
function switchDashboardTab(tabName) {
    const summaryView = document.getElementById('summary-view');
    const flowView = document.getElementById('flow-view');
    const summaryBtn = document.getElementById('tab-summary-btn');
    const flowBtn = document.getElementById('tab-flow-btn');

    if (tabName === 'summary') {
        if (summaryView) summaryView.style.display = 'block';
        if (flowView) flowView.style.display = 'none';
        if (summaryBtn) summaryBtn.classList.add('active');
        if (flowBtn) flowBtn.classList.remove('active');
    } else {
        if (summaryView) summaryView.style.display = 'none';
        if (flowView) flowView.style.display = 'block';
        if (summaryBtn) summaryBtn.classList.remove('active');
        if (flowBtn) flowBtn.classList.add('active');
    }
}

// --- Global Image Upload State ---
let uploadedImageDataUrl = null;
let uploadedOcrText = null;
let uploadedFlowData = null;

// --- Drag & Drop Event Listeners ---
window.addEventListener('DOMContentLoaded', () => {
    const dropzone = document.getElementById('dropzone');
    if (dropzone) {
        ['dragenter', 'dragover'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.classList.add('drag-over');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.classList.remove('drag-over');
            }, false);
        });

        dropzone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files && files.length > 0) {
                const fileInput = document.getElementById('image-upload');
                fileInput.files = files;
                handleImageUpload({ target: fileInput });
            }
        });
    }

    // Load default template (crypto) on launch
    loadTemplate('crypto');
    updateDashboard(templates['crypto']);
});

// --- Handle Image Upload & Tesseract.js OCR ---
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        uploadedImageDataUrl = e.target.result;
        
        // Show preview in form
        document.getElementById('image-preview').src = uploadedImageDataUrl;
        document.getElementById('preview-filename').textContent = file.name;
        document.getElementById('preview-container').style.display = 'flex';
        document.getElementById('dropzone-prompt').style.display = 'none';
        
        // Update Dashboard Meme Preview immediately
        const dashImg = document.getElementById('dashboard-meme-img');
        const dashTag = document.getElementById('meme-overlay-tag');
        if (dashImg) dashImg.src = uploadedImageDataUrl;
        if (dashTag) dashTag.textContent = 'USER MEME UPLOADED';

        // Trigger Client-Side Tesseract.js OCR
        runTesseractOcr(uploadedImageDataUrl);
    };
    reader.readAsDataURL(file);
}

// --- Run Client-Side OCR with Tesseract.js ---
function runTesseractOcr(imageSrc) {
    const ocrBadge = document.getElementById('ocr-badge');
    const ocrTextEl = document.getElementById('ocr-status-text');
    
    if (ocrBadge) ocrBadge.style.display = 'flex';
    if (ocrTextEl) ocrTextEl.textContent = 'Extracting embedded text via Tesseract.js...';

    if (typeof Tesseract !== 'undefined') {
        Tesseract.recognize(imageSrc, 'eng', {
            logger: m => {
                if (m.status === 'recognizing text' && ocrTextEl) {
                    const pct = Math.round(m.progress * 100);
                    ocrTextEl.textContent = `Extracting embedded text via Tesseract.js (${pct}%)...`;
                }
            }
        }).then(({ data: { text } }) => {
            const cleanText = text.trim();
            if (ocrBadge) ocrBadge.style.display = 'none';
            
            if (cleanText) {
                uploadedOcrText = cleanText;
                
                // Run AI prediction based on OCR text
                uploadedFlowData = predictAdMetadataFromOCR(cleanText, file ? file.name : 'meme.png');
            }
        }).catch(err => {
            console.error('Tesseract OCR error:', err);
            if (ocrBadge) ocrBadge.style.display = 'none';
        });
    } else {
        setTimeout(() => {
            if (ocrBadge) ocrBadge.style.display = 'none';
        }, 1000);
    }
}

// --- AI Auto-Generator Predictor (Simulating Multimodal ML parsing from OCR) ---
function predictAdMetadataFromOCR(ocrText, fileName) {
    const textClean = ocrText.toLowerCase();
    let category = "commercial";
    let targetAge = 13;
    let visuals = "commercial product design, text overlay";
    let blipCaption = "An advertisement layout featuring graphic text overlay.";
    let nerEntities = ["Ad Creative", "Visual Frame"];
    let yoloObjects = ["text label", "creative graphic"];
    let sckContext = "Socio-Cultural Knowledge (K): The creative is parsed for cultural, political, or restricted brand metaphors.";
    let relevanceScores = [];
    let representativeCases = [];
    let cotTrace = "";

    // Heuristics mapping to Fig. 3 levels
    if (textClean.includes("roi") || textClean.includes("guaranteed") || textClean.includes("return") || textClean.includes("invest") || textClean.includes("crypto") || textClean.includes("coin") || textClean.includes("wealth") || textClean.includes("rich")) {
        category = "finance";
        targetAge = 18;
        visuals = "gold coins, stock trend chart, financial indicators, luxury elements";
        blipCaption = "A digital advertisement containing high-yield investment triggers and currency tokens.";
        nerEntities = ["ROI Guarantee", "Crypto Token", "Telegram Link"];
        yoloObjects = ["gold coins", "trend chart", "wealth symbols"];
        sckContext = "Socio-Cultural Knowledge (K): Promising guaranteed, risk-free returns or overnight wealth is a standard socio-cultural metaphor structure used in financial fraud schemes to bypass retail investor caution.";
        relevanceScores = [
            { entity: "Guaranteed ROI", score: "2 (High)" },
            { entity: "Crypto Token", score: "2 (High)" },
            { entity: "Wealth Symbols", score: "1 (Medium)" }
        ];
        representativeCases = [
            { id: "RC1 (FHM-Scam #402)", knowledge: "Deceptive Ponzi scheme targeting retail investors.", reason: "Associates luxury indicators with instant wealth." },
            { id: "RC2 (HatReD-Scam #119)", knowledge: "Unlicensed crypto token presale.", reason: "Promotes fake returns and FOMO." }
        ];
        cotTrace = "1. SCGen Search: Extracted visual objects (coins, chart) and OCR 'Guaranteed Return'.\n2. SCRA-MTI Assessment: Entity 'Guaranteed ROI' scored 2 (High Relevance).\n3. RCR Search: Matched RC1 Ponzi template.\n4. MLLM Decision: REJECT due to Deceptive Financial Claims.";
    } else if (textClean.includes("vape") || textClean.includes("puff") || textClean.includes("smoke") || textClean.includes("vibe") || textClean.includes("nicotine") || textClean.includes("mint") || textClean.includes("flavor")) {
        category = "beverage";
        targetAge = 21;
        visuals = "e-cigarette vape pen, sweet fruit characters, vapor clouds, youthful group";
        blipCaption = "A flavored nicotine vape pen advertisement surrounded by vapor and colorful graphics.";
        nerEntities = ["Flavored Vape", "Nicotine Product", "Youth Vibe"];
        yoloObjects = ["vape pen", "vapor cloud", "cartoon graphics"];
        sckContext = "Socio-Cultural Knowledge (K): Flavored e-cigarette branding with cartoon styling or bright colors is culturally recognized as appealing directly to minors, which is restricted under safety policies.";
        relevanceScores = [
            { entity: "Flavored Vape", score: "2 (High)" },
            { entity: "Target Age Group", score: "2 (High)" },
            { entity: "Vapor Cloud", score: "1 (Medium)" }
        ];
        representativeCases = [
            { id: "RC1 (AdSafety-Minor #89)", knowledge: "Nicotine branding targeting minor audiences.", reason: "Uses cartoon elements to appeal to teens." }
        ];
        cotTrace = "1. SCGen Search: Detected vape pen and vapor tags.\n2. SCRA-MTI Assessment: Flagged age group mismatch (13/18 vs 21 nicotine boundary).\n3. RCR Search: Matched RC1 youth targeting case.\n4. MLLM Decision: REJECT due to Minor Protection Policy violation.";
    } else if (textClean.includes("woman") || textClean.includes("driver") || textClean.includes("kitchen") || textClean.includes("wife") || textClean.includes("driving") || textClean.includes("belongs")) {
        category = "dating";
        targetAge = 18;
        visuals = "domestic kitchen layout, clean counter, pointing hand stereotype representation";
        blipCaption = "A social media post with a text graphic depicting female domestic roles.";
        nerEntities = ["Gender stereotype", "Domestic kitchen", "Misogynistic trope"];
        yoloObjects = ["woman", "kitchen tools", "pointing hand"];
        sckContext = "Socio-Cultural Knowledge (K): Memes or slogans enforcing traditional subordinating gender roles (e.g. 'keep her in the kitchen') violate community policies regarding harassment and hate speech.";
        relevanceScores = [
            { entity: "stays where she belongs", score: "2 (High)" },
            { entity: "women driving", score: "2 (High)" },
            { entity: "Kitchen stereotype", score: "1 (Medium)" }
        ];
        representativeCases = [
            { id: "RC1 (MAMI-Misogyny #214)", knowledge: "Gender stereotype meme enforcing domestic subordination.", reason: "Satirizes female competence to promote gender discrimination." }
        ];
        cotTrace = "1. SCGen Search: Detected gender roles in text 'stays where she belongs'.\n2. SCRA-MTI Assessment: Evaluated metaphorical tenor (domestic subordination comparison).\n3. RCR Search: Matched MAMI case RC1.\n4. MLLM Decision: REJECT due to Hate Speech Policy violation.";
    } else {
        category = "commercial";
        targetAge = 13;
        visuals = "commercial retail graphic, neutral background, product packaging";
        blipCaption = "A standard commercial banner showcasing consumer products.";
        nerEntities = ["Brand Logo", "Product Name"];
        yoloObjects = ["package box", "clean layout"];
        sckContext = "Socio-Cultural Knowledge (K): The creative represents standard benign consumer product promotion without implicit metaphors or offensive socio-cultural references.";
        relevanceScores = [
            { entity: "Product Package", score: "1 (Medium)" },
            { entity: "Brand Logo", score: "1 (Medium)" }
        ];
        representativeCases = [
            { id: "RC1 (Commercial #12)", knowledge: "Standard beverage retail advertising.", reason: "Promotes product with neutral claims." }
        ];
        cotTrace = "1. SCGen Search: Extracted product creative tag.\n2. SCRA-MTI Assessment: No high-risk policy matches.\n3. RCR Search: Matched safe retail benchmarks.\n4. MLLM Decision: APPROVED.";
    }

    // Auto-fill inputs dynamically
    const textEl = document.getElementById('ad-text');
    const visualsEl = document.getElementById('ad-visuals');
    const ageEl = document.getElementById('ad-target-age');
    const catEl = document.getElementById('ad-category');

    if (textEl) textEl.value = ocrText;
    if (visualsEl) visualsEl.value = visuals;
    if (ageEl) ageEl.value = targetAge;
    if (catEl) catEl.value = category;

    // Show indicator on the upload dropzone that inputs are autocompleted
    const ocrStatusText = document.getElementById('ocr-status-text');
    const ocrBadge = document.getElementById('ocr-badge');
    if (ocrBadge) {
        ocrBadge.style.display = 'flex';
        ocrBadge.style.background = 'rgba(16, 185, 129, 0.15)';
        ocrBadge.style.borderColor = 'rgba(16, 185, 129, 0.3)';
        ocrBadge.style.color = '#10b981';
    }
    if (ocrStatusText) ocrStatusText.innerHTML = '<i class="fa-solid fa-circle-check"></i> AI Auto-generated all metadata. Ready to check image!';

    return {
        blipCaption: blipCaption,
        nerEntities: nerEntities,
        yoloObjects: yoloObjects,
        sckContext: sckContext,
        relevanceScores: relevanceScores,
        representativeCases: representativeCases,
        cotTrace: cotTrace
    };
}

// --- Remove Uploaded Image ---
function removeUploadedImage(event) {
    if (event) event.stopPropagation();
    
    uploadedImageDataUrl = null;
    uploadedOcrText = null;
    uploadedFlowData = null;
    
    document.getElementById('image-upload').value = '';
    document.getElementById('image-preview').src = '';
    document.getElementById('preview-container').style.display = 'none';
    document.getElementById('dropzone-prompt').style.display = 'flex';
    document.getElementById('ocr-badge').style.display = 'none';
    
    // Reset Dashboard Meme Preview to active template image
    loadTemplate(activeTemplate);
}

// --- Playground Threat Templates Definition ---
const templates = {
    crypto: {
        text: "🚀 GUARANTEED 10x ROI IN 24 HOURS! 🚀 Don't let your hard-earned money sit idle. Invest in SafeAdCoin now and watch your wealth skyrocket overnight! No risk, 100% high returns, invite-only opportunity! Join our Telegram group now. #Crypto #Invest #Rich #ROI",
        visuals: "stack of gold coins, luxury sports car, private jet cockpit, green upward trend chart",
        targetAge: 18,
        category: "finance",
        riskScore: 92,
        decision: "REJECTED",
        deceptive: "FLAGGED",
        ageCompliance: "CLEAN",
        hateSpeech: "CLEAN",
        ocrText: "INVEST NOW - 100% GUARANTEED RETURN",
        explanation: "High Risk of Scam detected. The creative matches known templates of cryptocurrency scams. Visual indicators (luxury items, cash piles) combined with deceptive keywords ('10X ROI', 'Guaranteed return') violate advertising policy regarding misleading financial claims.",
        // Fig. 3 Architecture Nodes
        blipCaption: "A stack of gold coins beside a luxury sports car and a private jet on a runway.",
        nerEntities: ["SafeAdCoin", "Telegram", "Crypto", "ROI"],
        yoloObjects: ["gold coins", "sports car", "jet cockpit", "trend chart"],
        sckContext: "Socio-Cultural Knowledge (K): Visual displays of extravagant wealth (jets, cars) combined with urgent high-yield financial promises ('10x ROI', 'guaranteed') constitute a recognized template of deceptive investment fraud.",
        relevanceScores: [
            { entity: "Guaranteed ROI", score: "2 (High)" },
            { entity: "SafeAdCoin", score: "2 (High)" },
            { entity: "Gold Coins", score: "1 (Medium)" },
            { entity: "Sports Car", score: "1 (Medium)" }
        ],
        representativeCases: [
            { id: "RC1 (FHM-Scam #402)", knowledge: "Deceptive Ponzi scheme targeting retail investors.", reason: "Associates luxury cars with instant overnight wealth." },
            { id: "RC2 (HatReD-Scam #119)", knowledge: "Unlicensed crypto token presale.", reason: "Promotes artificial FOMO and fake return guarantees." }
        ],
        cotTrace: "1. SCGen Search: Extracted visual objects (sports car, jet) and headline '10X GUARANTEED ROI'.\n2. SCRA-MTI Assessment: Entity 'Guaranteed ROI' scored 2 (High Relevance).\n3. RCR Search: Matched RC1 (Deceptive Ponzi template) via FAISS vector embeddings.\n4. MLLM Decision: Violation of Deceptive Marketing Policy."
    },
    vape: {
        text: "💨 UNLEASH THE VIBE! 💨 Discover the smoothest puff with our new Ice-Mint Vape. Fits perfectly in your pocket, looks ultra-cool, and tastes amazing. Try all 12 sweet fruit flavors today! #VapeLife #SmoothPuff #Vibe",
        visuals: "sleek colored vape pen, vapor clouds, cartoon fruit characters, energetic young group dancing",
        targetAge: 13,
        category: "beverage",
        riskScore: 88,
        decision: "REJECTED",
        deceptive: "CLEAN",
        ageCompliance: "FLAGGED",
        hateSpeech: "CLEAN",
        ocrText: "COOL PUFF - SWEET WATERMELON",
        explanation: "Age Restriction Target Violation. The advertisement targets vaping products with sweet fruit flavors and energetic, cartoonish visual elements. The min targeted age is set to 13, which directly violates policies restricting nicotine/tobacco marketing to minors under 18/21.",
        blipCaption: "A colorful vape pen surrounded by vapor clouds and cartoon fruit characters.",
        nerEntities: ["Ice-Mint Vape", "VapeLife", "SmoothPuff"],
        yoloObjects: ["vape pen", "vapor cloud", "cartoon fruit", "dancing group"],
        sckContext: "Socio-Cultural Knowledge (K): Bright neon styling and sweet fruit flavor branding combined with youth imagery appeal directly to underage demographics, violating tobacco/e-cigarette targeting regulations.",
        relevanceScores: [
            { entity: "Ice-Mint Vape", score: "2 (High)" },
            { entity: "Target Age (13)", score: "2 (High)" },
            { entity: "Fruit Flavors", score: "1 (Medium)" },
            { entity: "Vapor Cloud", score: "1 (Medium)" }
        ],
        representativeCases: [
            { id: "RC1 (AdSafety-Minor #89)", knowledge: "Flavored nicotine e-cigarette promotion targeting youth.", reason: "Uses cartoon characters to market restricted products to teens." }
        ],
        cotTrace: "1. SCGen Search: Detected vape pen and cartoon fruit visual tags.\n2. SCRA-MTI Assessment: Cross-referenced target age (13) with restricted nicotine category.\n3. RCR Search: Matched RC1 (Youth nicotine targeting violation).\n4. MLLM Decision: Rejection due to Minor Protection Policy violation."
    },
    misogyny: {
        text: "Tired of women driving? 🚗 Make sure she stays where she belongs. Get our automatic kitchen cooking helper and get your peace of mind back. Order now for your wife! #MenRule #KitchenHelper #Peace",
        visuals: "frustrated woman struggling with a steering wheel, modern clean kitchen, cartoon pointing hand",
        targetAge: 18,
        category: "dating",
        riskScore: 76,
        decision: "REJECTED",
        deceptive: "CLEAN",
        ageCompliance: "CLEAN",
        hateSpeech: "FLAGGED",
        ocrText: "KEEP HER IN THE KITCHEN",
        explanation: "Hate Speech & Gender Bias Violation. The text copy and OCR text contain derogatory gender stereotypes ('women drivers', 'stays where she belongs', 'keep her in the kitchen'). This violates community guidelines regarding misogynistic and offensive content targeting vulnerable gender groups.",
        blipCaption: "A woman behind a steering wheel beside a kitchen counter.",
        nerEntities: ["Women Drivers", "Kitchen Helper", "MenRule"],
        yoloObjects: ["woman", "steering wheel", "kitchen", "pointing hand"],
        sckContext: "Socio-Cultural Knowledge (K): Tropes suggesting women belong exclusively in domestic roles or cannot drive represent derogatory misogynistic stereotypes.",
        relevanceScores: [
            { entity: "stays where she belongs", score: "2 (High)" },
            { entity: "women driving", score: "2 (High)" },
            { entity: "Kitchen", score: "1 (Medium)" }
        ],
        representativeCases: [
            { id: "RC1 (MAMI-Misogyny #214)", knowledge: "Gender stereotype meme enforcing domestic subordination.", reason: "Satirizes female competence to promote gender discrimination." }
        ],
        cotTrace: "1. SCGen Search: Extracted gender stereotypes in text and OCR.\n2. SCRA-MTI Assessment: Evaluated metaphorical tenor (comparing women drivers to domestic tools).\n3. RCR Search: Matched MAMI dataset case RC1.\n4. MLLM Decision: Rejection under Misogyny & Hate Speech Policy."
    },
    safe: {
        text: "☕ Good Morning starts with Organic Coffee! ☕ Sourced directly from sustainable local farms, our dark roast coffee is rich, bold, and fair-trade certified. Visit our cafe or order beans online today. #CoffeeTime #Organic #Sustainable",
        visuals: "steaming white coffee mug, roasted brown coffee beans, green leaves, wood table texture",
        targetAge: 13,
        category: "commercial",
        riskScore: 8,
        decision: "APPROVED",
        deceptive: "CLEAN",
        ageCompliance: "CLEAN",
        hateSpeech: "CLEAN",
        ocrText: "ORGANIC & FRESH CAFE",
        explanation: "Ad creative complies with all platform safety guidelines. Text and visual elements promote standard commercial products with neutral, positive sentiment and no policy violations detected.",
        blipCaption: "A white coffee mug on a wooden table with roasted coffee beans.",
        nerEntities: ["Organic Coffee", "Fair-Trade", "CoffeeTime"],
        yoloObjects: ["coffee mug", "coffee beans", "leaves", "table"],
        sckContext: "Socio-Cultural Knowledge (K): Organic coffee and fair-trade farming represent standard, benign commercial beverage marketing.",
        relevanceScores: [
            { entity: "Organic Coffee", score: "1 (Medium)" },
            { entity: "Fair-Trade", score: "1 (Medium)" }
        ],
        representativeCases: [
            { id: "RC1 (Commercial #12)", knowledge: "Standard beverage retail advertising.", reason: "Promotes coffee beans with neutral product claims." }
        ],
        cotTrace: "1. SCGen Search: Extracted coffee beans and mug visual tags.\n2. SCRA-MTI Assessment: No high-risk policy flags found.\n3. RCR Search: Matched safe commercial retail cases.\n4. MLLM Decision: Approved for publication."
    }
};

let activeTemplate = 'crypto';

// --- Load Template function ---
function loadTemplate(key) {
    if (!templates[key]) return;
    activeTemplate = key;
    
    // Clear custom uploaded image if switching templates
    if (uploadedImageDataUrl) {
        uploadedImageDataUrl = null;
        uploadedOcrText = null;
        uploadedFlowData = null;
        document.getElementById('image-upload').value = '';
        document.getElementById('image-preview').src = '';
        document.getElementById('preview-container').style.display = 'none';
        document.getElementById('dropzone-prompt').style.display = 'flex';
        document.getElementById('ocr-badge').style.display = 'none';
    }

    // Update chip styling
    document.querySelectorAll('.template-chip').forEach(chip => {
        chip.classList.remove('active');
        if (chip.getAttribute('onclick').includes(key)) {
            chip.classList.add('active');
        }
    });
    
    // Set inputs
    document.getElementById('ad-text').value = templates[key].text;
    document.getElementById('ad-visuals').value = templates[key].visuals;
    document.getElementById('ad-target-age').value = templates[key].targetAge;
    document.getElementById('ad-category').value = templates[key].category;
    
    // Set dashboard image
    const dashImg = document.getElementById('dashboard-meme-img');
    const dashTag = document.getElementById('meme-overlay-tag');
    if (dashImg) dashImg.src = 'assets/hero_bg.png';
    if (dashTag) dashTag.textContent = key.toUpperCase() + ' TEMPLATE';
}

// --- Run Ad Analysis Pipeline Simulation ---
function runAdAnalysis(event) {
    if (event) event.preventDefault();
    
    // Show loader
    const loader = document.getElementById('loader');
    loader.classList.add('active');
    
    // Reset loader item statuses
    const statusItems = ['status-ocr', 'status-cv', 'status-age', 'status-xai'];
    statusItems.forEach(id => {
        const el = document.getElementById(id);
        el.className = 'loader-status-item';
    });
    
    // Step 1: Running OCR (0.6s)
    document.getElementById('status-ocr').classList.add('active');
    
    setTimeout(() => {
        document.getElementById('status-ocr').className = 'loader-status-item done';
        document.getElementById('status-cv').classList.add('active');
    }, 600);
    
    // Step 2: Computer Vision (1.2s)
    setTimeout(() => {
        document.getElementById('status-cv').className = 'loader-status-item done';
        document.getElementById('status-age').classList.add('active');
    }, 1200);
    
    // Step 3: Age Confidence Check (1.8s)
    setTimeout(() => {
        document.getElementById('status-age').className = 'loader-status-item done';
        document.getElementById('status-xai').classList.add('active');
    }, 1800);
    
    // Step 4: XAI Report & Update Dashboard (2.4s)
    setTimeout(() => {
        document.getElementById('status-xai').className = 'loader-status-item done';
        
        // Compute Results (either from template or custom analyzed inputs)
        const results = analyzeInputs();
        
        // Update Dashboard GUI
        updateDashboard(results);
        
        // Switch to the Flow Inspector tab automatically so they see the 4 levels!
        switchDashboardTab('flow');
        
        // Hide loader
        loader.classList.remove('active');
    }, 2400);
}

// --- Analyze Inputs (Dynamic Logic) ---
function analyzeInputs() {
    const textInput = document.getElementById('ad-text').value;
    const visualsInput = document.getElementById('ad-visuals').value;
    const targetAgeInput = parseInt(document.getElementById('ad-target-age').value) || 13;
    const categoryInput = document.getElementById('ad-category').value;
    
    // If the inputs match our templates exactly, return the static template data
    if (!uploadedImageDataUrl && templates[activeTemplate] && 
        textInput === templates[activeTemplate].text && 
        visualsInput === templates[activeTemplate].visuals &&
        targetAgeInput === templates[activeTemplate].targetAge &&
        categoryInput === templates[activeTemplate].category) {
        return templates[activeTemplate];
    }
    
    // Otherwise, perform heuristic-based dynamic analysis!
    const textClean = textInput.toLowerCase();
    const visualsClean = visualsInput.toLowerCase();
    
    let riskScore = 5; // Base safe score
    let deceptive = 'CLEAN';
    let ageCompliance = 'CLEAN';
    let hateSpeech = 'CLEAN';
    let reasons = [];
    
    // 1. Deceptive / Scam Heuristics
    const scamWords = ["roi", "guaranteed", "investment", "overnight", "skyrocket", "scam", "telegram", "invest", "rich", "bitcoin", "crypto", "10x", "earn"];
    const scamVisuals = ["money", "cash", "gold", "luxury", "jet", "car", "trend", "coins"];
    
    let scamWordMatches = scamWords.filter(w => textClean.includes(w));
    let scamVisualMatches = scamVisuals.filter(v => visualsClean.includes(v));
    
    if (scamWordMatches.length >= 2 || (scamWordMatches.length >= 1 && scamVisualMatches.length >= 1) || categoryInput === 'finance') {
        if (scamWordMatches.some(w => ["roi", "guaranteed", "10x"].includes(w))) {
            riskScore += 45;
        } else {
            riskScore += 30;
        }
        riskScore += Math.min(40, (scamWordMatches.length + scamVisualMatches.length) * 8);
        deceptive = 'FLAGGED';
        reasons.push("Deceptive ROI claims & high-scam signals");
    }
    
    // 2. Minor Audience Compliance
    const minorKeywords = ["vape", "puff", "smoke", "nicotine", "flavor", "sweet", "ice-mint"];
    const minorVisuals = ["vape", "vapor", "fruit", "cartoon"];
    
    let minorWordMatches = minorKeywords.filter(w => textClean.includes(w));
    let minorVisualMatches = minorVisuals.filter(v => visualsClean.includes(v));
    
    if ((minorWordMatches.length >= 1 && targetAgeInput < 18) || (categoryInput === 'beverage' && targetAgeInput < 18)) {
        riskScore += 50;
        ageCompliance = 'FLAGGED';
        reasons.push("Targeting nicotine/flavors to underage audiences");
    } else if (minorWordMatches.length >= 1) {
        riskScore += 25;
        ageCompliance = 'FLAGGED';
        reasons.push("Age-restricted items advertised without verification");
    }
    
    // 3. Hate Speech / Stereotypes
    const hateWords = ["women driving", "stays where she belongs", "kitchen helper", "menrule", "keep her in the kitchen"];
    let hateWordMatches = hateWords.filter(w => textClean.includes(w));
    if (hateWordMatches.length >= 1) {
        riskScore += 60;
        hateSpeech = 'FLAGGED';
        reasons.push("Derogatory gender stereotypes / misogyny flag");
    }
    
    // Caps
    riskScore = Math.min(riskScore, 98);
    
    // Determine overall decision
    let decision = 'APPROVED';
    if (riskScore >= 75) {
        decision = 'REJECTED';
    } else if (riskScore >= 40) {
        decision = 'FLAGGED'; // human review
    }
    
    // Mock graphic OCR text
    let ocrText = textInput.split(' ').slice(0, 5).join(' ').toUpperCase();
    if (ocrText.length > 30) ocrText = ocrText.substring(0, 30);
    
    // Custom explanation builder (HatReD XAI style)
    let explanationText = "";
    if (decision === 'APPROVED') {
        explanationText = "Ad creative complies with all safety check heuristics. Visually and textually safe; no matching policy violation patterns detected.";
    } else {
        explanationText = `Policy Decision: ${decision}. Safety index flagged at ${riskScore}%. Analysis reveals: ` + reasons.join(", ") + ". ";
    }
    
    return {
        text: textInput,
        visuals: visualsInput,
        targetAge: targetAgeInput,
        category: categoryInput,
        riskScore: riskScore,
        decision: decision,
        deceptive: deceptive,
        ageCompliance: ageCompliance,
        hateSpeech: hateSpeech,
        ocrText: uploadedOcrText || ocrText || "NO GRAPHIC TEXT",
        explanation: explanationText,
        imageSrc: uploadedImageDataUrl || 'assets/hero_bg.png',
        imageTag: uploadedImageDataUrl ? 'USER MEME ANALYZED' : activeTemplate.toUpperCase() + ' TEMPLATE',
        flowData: uploadedFlowData
    };
}

// --- Update Dashboard GUI ---
function updateDashboard(results) {
    // 1. Update Decision Badge
    const decisionEl = document.getElementById('result-decision');
    decisionEl.textContent = results.decision;
    decisionEl.className = 'decision-badge ' + results.decision.toLowerCase();
    if (results.decision === 'FLAGGED') {
        decisionEl.textContent = 'HUMAN REVIEW';
    }
    
    // 2. Update Risk Value text
    document.getElementById('result-score').textContent = results.riskScore + '%';
    
    // 3. Update circular SVG gauge
    const gaugeFill = document.getElementById('result-gauge');
    // Stroke dashoffset: max is 408 (0% risk). 0 is 100% risk.
    const offset = 408 - (408 * results.riskScore) / 100;
    gaugeFill.style.strokeDashoffset = offset;
    
    // Gauge Color based on risk
    if (results.riskScore >= 75) {
        gaugeFill.style.stroke = '#ef4444'; // Red
    } else if (results.riskScore >= 40) {
        gaugeFill.style.stroke = '#f59e0b'; // Amber
    } else {
        gaugeFill.style.stroke = '#10b981'; // Green
    }
    
    // 4. Update Policy Badges
    updatePolicyBadge('v-deceptive', results.deceptive);
    updatePolicyBadge('v-age', results.ageCompliance);
    updatePolicyBadge('v-hate', results.hateSpeech);
    
    // 5. Update OCR Text block
    document.getElementById('result-ocr').textContent = results.ocrText;
    
    // 6. Update Target age text
    document.getElementById('result-target-age').textContent = results.targetAge + ' Yrs';
    
    // 7. Update Age Appropriateness Score
    const ageComplianceEl = document.getElementById('result-age-compliance');
    if (results.ageCompliance === 'FLAGGED') {
        ageComplianceEl.textContent = 'Violated (Low)';
        ageComplianceEl.style.color = '#ef4444';
    } else {
        const appScore = 100 - Math.min(20, Math.max(0, 18 - results.targetAge) * 3);
        ageComplianceEl.textContent = `${appScore}% (Safe)`;
        ageComplianceEl.style.color = '#10b981';
    }
    
    // 8. Update Explanation Text
    document.getElementById('result-explanation').textContent = results.explanation;
    
    // 9. Update HITL routing alert box
    const hitlBox = document.getElementById('result-hitl-box');
    if (results.decision === 'FLAGGED') {
        hitlBox.style.display = 'flex';
    } else {
        hitlBox.style.display = 'none';
    }
}

    // 10. Update Meme Image in Dashboard
    const dashImg = document.getElementById('dashboard-meme-img');
    const dashTag = document.getElementById('meme-overlay-tag');
    if (dashImg && results.imageSrc) dashImg.src = results.imageSrc;
    if (dashTag && results.imageTag) dashTag.textContent = results.imageTag;

    // 11. Update Architecture Flow Inspector Nodes (Fig. 3 Trace)
    const activeData = results.flowData || templates[activeTemplate] || templates.crypto;
    
    // Block A: SCGen Search Nodes
    const blipEl = document.getElementById('flow-blip-caption');
    const nerEl = document.getElementById('flow-ner-tags');
    const yoloEl = document.getElementById('flow-yolo-tags');
    const sckEl = document.getElementById('flow-sck-context');
    
    if (blipEl) blipEl.textContent = activeData.blipCaption || `"${results.text.substring(0, 60)}..."`;
    if (nerEl) {
        const tags = activeData.nerEntities || [results.category.toUpperCase(), "Metadata Tag"];
        nerEl.innerHTML = tags.map(t => `<span>${t}</span>`).join('');
    }
    if (yoloEl) {
        const tags = activeData.yoloObjects || results.visuals.split(',').map(s => s.trim());
        yoloEl.innerHTML = tags.map(t => `<span>${t}</span>`).join('');
    }
    if (sckEl) sckEl.textContent = activeData.sckContext || "Socio-Cultural Knowledge (K): Extracted visual and textual context parsed for policy compliance.";
    
    // Block B: SCRA-MTI Nodes
    const flowOcrEl = document.getElementById('flow-ocr-text');
    const flowRowsEl = document.getElementById('flow-relevance-rows');
    if (flowOcrEl) flowOcrEl.textContent = results.ocrText || "NO GRAPHIC TEXT DETECTED";
    if (flowRowsEl) {
        const rels = activeData.relevanceScores || [{ entity: results.category, score: "2 (High)" }, { entity: "Visual Layout", score: "1 (Medium)" }];
        flowRowsEl.innerHTML = rels.map(r => `<tr><td>${r.entity}</td><td>${r.score}</td></tr>`).join('');
    }
    
    // Block C: RCR Nodes
    const rcEl = document.getElementById('flow-rc-cases');
    if (rcEl) {
        const cases = activeData.representativeCases || [{ id: "RC1 (General Trust & Safety)", knowledge: "Historical violation database query.", reason: results.explanation }];
        rcEl.innerHTML = cases.map(c => `
            <div class="rc-case-card">
                <div class="rc-case-header">${c.id}</div>
                <p><strong>Knowledge:</strong> ${c.knowledge}</p>
                <p class="rc-reason"><strong>Reason Metaphor:</strong> ${c.reason}</p>
            </div>
        `).join('');
    }
    
    // Block D: MLLM Output Nodes
    const cotEl = document.getElementById('flow-cot-trace');
    const finalDecEl = document.getElementById('flow-final-decision');
    const finalScoreEl = document.getElementById('flow-final-score');
    const finalReasonEl = document.getElementById('flow-final-reason');
    if (cotEl) cotEl.textContent = activeData.cotTrace || `1. SCGen Search: Extracted creative features.\n2. SCRA-MTI: Calculated risk score ${results.riskScore}%.\n3. Decision: ${results.decision}.`;
    if (finalDecEl) {
        finalDecEl.textContent = results.decision;
        finalDecEl.className = 'flow-final-decision-badge ' + results.decision.toLowerCase();
    }
    if (finalScoreEl) finalScoreEl.textContent = results.riskScore + '%';
    if (finalReasonEl) finalReasonEl.textContent = results.explanation;
}

function updatePolicyBadge(id, status) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = status;
    el.className = 'violation-status ' + status.toLowerCase();
}
