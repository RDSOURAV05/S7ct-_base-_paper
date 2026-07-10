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
        explanation: "High Risk of Scam detected. The creative matches known templates of cryptocurrency scams. Visual indicators (luxury items, cash piles) combined with deceptive keywords ('10X ROI', 'Guaranteed return') violate advertising policy regarding misleading financial claims."
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
        explanation: "Age Restriction Target Violation. The advertisement targets vaping products with sweet fruit flavors and energetic, cartoonish visual elements. The min targeted age is set to 13, which directly violates policies restricting nicotine/tobacco marketing to minors under 18/21."
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
        explanation: "Hate Speech & Gender Bias Violation. The text copy and OCR text contain derogatory gender stereotypes ('women drivers', 'stays where she belongs', 'keep her in the kitchen'). This violates community guidelines regarding misogynistic and offensive content targeting vulnerable gender groups."
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
        explanation: "Ad creative complies with all platform safety guidelines. Text and visual elements promote standard commercial products with neutral, positive sentiment and no policy violations detected."
    }
};

let activeTemplate = 'crypto';

// --- Load Template function ---
function loadTemplate(key) {
    if (!templates[key]) return;
    activeTemplate = key;
    
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
    if (templates[activeTemplate] && 
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
            deceptive = 'FLAGGED';
            reasons.push("Misleading/deceptive financial claims matching scam profiles (high ROI, guaranteed gains)");
        } else if (categoryInput === 'finance') {
            riskScore += 25;
            reasons.push("General financial targeting needing safety evaluation");
        }
    }
    
    // 2. Age Restrictions Heuristics (Nicotine/Alcohol/Dating targeting minors)
    const minorKeywords = ["vape", "vaping", "nicotine", "smoke", "fruit", "sweet", "flavor", "beer", "wine", "alcohol", "drink", "cocktail", "party", "club", "dating", "sexy", "teen", "teenager", "minor"];
    const minorVisuals = ["vape pen", "liquor bottle", "cocktail", "smoke", "cartoon", "young"];
    
    let minorWordMatches = minorKeywords.filter(w => textClean.includes(w));
    let minorVisualMatches = minorVisuals.filter(v => visualsClean.includes(v));
    
    if (minorWordMatches.length >= 1 || minorVisualMatches.length >= 1) {
        if (targetAgeInput < 18 && (categoryInput === 'beverage' || categoryInput === 'dating')) {
            riskScore += 50;
            ageCompliance = 'FLAGGED';
            reasons.push("Vaping/alcohol/dating keywords combined with underage target demographics (under 18)");
        } else if (targetAgeInput < 18) {
            riskScore += 30;
            ageCompliance = 'FLAGGED';
            reasons.push("Promoting age-restricted elements (vape/alcohol/dating terms) while targeting minors");
        } else {
            riskScore += 15;
            reasons.push("Age-restricted keywords present, target age is safe (18+)");
        }
    }
    
    // 3. Hate Speech Heuristics
    const hateWords = ["women belongs", "belongs in the kitchen", "dumb", "hate", "terrorist", "halal", "bomb", "stereotype", "misogyn", "racist"];
    let hateWordMatches = hateWords.filter(w => textClean.includes(w));
    
    if (hateWordMatches.length >= 1) {
        riskScore += 40;
        hateSpeech = 'FLAGGED';
        reasons.push("Hate speech markers/derogatory social stereotypes matching policy violations");
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
        if (deceptive === 'FLAGGED') {
            explanationText += "Visual cues match luxury trigger heuristics. ";
        }
        if (ageCompliance === 'FLAGGED') {
            explanationText += " Nicotine/alcohol target boundaries breached for underage audiences. ";
        }
        if (hateSpeech === 'FLAGGED') {
            explanationText += " Implicit stereotypes violate safety standards regarding target groups.";
        }
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
        ocrText: ocrText || "NO GRAPHIC TEXT",
        explanation: explanationText
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

function updatePolicyBadge(id, status) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = status;
    el.className = 'violation-status ' + status.toLowerCase();
}

// --- Window onload initialization ---
window.addEventListener('DOMContentLoaded', () => {
    // Load default template (crypto) on launch
    loadTemplate('crypto');
    
    // Update dashboard with default values instantly (without loader animation initially)
    updateDashboard(templates['crypto']);
});
