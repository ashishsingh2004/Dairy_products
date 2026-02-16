const OpenAI = require('openai');

// Knowledge base for common cow-related questions
const cowKnowledgeBase = {
    'diseases': `**Common Cow Diseases and Symptoms:**

1. **Mastitis** (Udder Infection)
   - Symptoms: Swollen, hot, painful udder; abnormal milk (lumpy, watery, or bloody)
   - Treatment: Antibiotics, proper milking hygiene

2. **Foot Rot**
   - Symptoms: Lameness, swelling between toes, foul odor
   - Treatment: Antibiotics, foot baths, proper hoof care

3. **Bloat**
   - Symptoms: Distended left side, difficulty breathing, restlessness
   - Treatment: Immediate veterinary care, may need trocar

4. **Milk Fever** (Hypocalcemia)
   - Symptoms: Weakness, cold ears, unable to stand
   - Treatment: Calcium injection (emergency!)

5. **Pneumonia**
   - Symptoms: Coughing, nasal discharge, fever, rapid breathing
   - Treatment: Antibiotics, supportive care

⚠️ **Important:** Always consult a veterinarian for proper diagnosis and treatment.`,

    'milk production': `**How to Increase Milk Production:**

1. **Nutrition** (Most Important!)
   - High-quality fodder (green grass, legumes)
   - Balanced concentrate feed (16-18% protein)
   - Minerals: Calcium, Phosphorus supplements
   - Fresh, clean water (80-100 liters/day)

2. **Proper Milking**
   - Milk 2-3 times daily at regular intervals
   - Complete udder emptying
   - Clean, stress-free environment
   - Use oxytocin only if needed (vet guidance)

3. **Breeding**
   - Choose high-yielding breeds (HF, Jersey, Gir)
   - Proper AI with quality semen
   - Optimal calving interval (12-13 months)

4. **Health Management**
   - Regular deworming (every 3-4 months)
   - Vaccination schedule
   - Treat mastitis immediately

5. **Comfort**
   - Adequate space (40-50 sq ft per cow)
   - Shade and ventilation
   - Reduce stress

💡 **Tip:** Peak milk production occurs 40-60 days after calving.`,

    'vaccination': `**Ideal Vaccination Schedule for Cows:**

**Calves (0-6 months):**
- Birth: Colostrum within 6 hours (crucial!)
- 15 days: HS (Hemorrhagic Septicemia)
- 2 months: FMD (Foot & Mouth Disease) - 1st dose
- 3 months: BQ (Black Quarter) - 1st dose
- 4 months: FMD - 2nd dose
- 6 months: Brucellosis (heifers only - S19 vaccine)

**Adults (Annual/Biannual):**
- **FMD**: Every 6 months (twice yearly)
- **HS**: Annually (before monsoon)
- **BQ**: Annually (before monsoon)
- **Anthrax**: If endemic in area

**Pregnancy Considerations:**
- Avoid vaccinations in last month of pregnancy
- Complete before 8 months of gestation

**Deworming:**
- Every 3-4 months for adults
- Every 2-3 months for calves

🩺 **Note:** Consult local veterinary officer for region-specific schedules.`,

    'diet lactating': `**Proper Diet for Lactating Cows:**

**Daily Requirements (for 10-15 L milk/day):**

1. **Green Fodder** (35-40 kg)
   - Napier grass, Berseem, Lucerne
   - Maize, Jowar (seasonal)

2. **Dry Fodder** (5-6 kg)
   - Wheat straw, Rice straw
   - Hay (if available)

3. **Concentrate Feed** (3-5 kg)
   - Formula: 1 kg per 2.5 liters of milk
   - Ingredients:
     * Maize/Bajra: 30%
     * De-oiled Rice Bran: 25%
     * Cottonseed Cake: 20%
     * Groundnut Cake: 15%
     * Wheat Bran: 8%
     * Mineral Mixture: 2%

4. **Supplements**
   - Mineral mixture: 50g/day
   - Common salt: 30-50g/day
   - Bypass fat (if high yielder)

5. **Water**
   - Clean, fresh water: 80-100 liters/day
   - More in summer

**Feeding Schedule:**
- Morning: Concentrate + Green fodder
- Afternoon: Dry fodder
- Evening: Concentrate + Green fodder

💡 **Golden Rule:** Feed according to milk yield. Higher yield = more concentrate.`,

    'pregnancy detection': `**How to Identify if a Cow is Pregnant:**

**1. Behavioral Signs (30-60 days):**
   - No heat cycle after breeding (most reliable)
   - Reduced activity, calmer behavior
   - Increased appetite
   - Shiny, healthy coat

**2. Physical Signs (3-4 months):**
   - Enlarged abdomen (right side)
   - Udder development starts (6 months)
   - Vulva becomes loose and swollen
   - Mucus discharge from vulva

**3. Professional Methods:**
   - **Rectal Palpation** (45-60 days) - By veterinarian
   - **Ultrasound** (30-35 days) - Most accurate
   - **Blood Test** (Progesterone level)
   - **Milk Test** (Progesterone in milk)

**4. Traditional Method:**
   - Milk test: Mix 1 tsp milk in water
   - If milk settles at bottom → Pregnant
   - If milk mixes → Not pregnant
   - (70-80% accurate)

**Expected Calving Signs (9 months):**
- Udder fills up (springing)
- Tail head relaxation
- Restlessness
- Lying down frequently

⏰ **Gestation Period:** 280-285 days (9 months)

🩺 **Best Practice:** Confirm pregnancy at 2 months via vet check.`,

    'breeding': `**Best Practices for Cow Breeding:**

**1. Age for First Breeding:**
   - Heifers: 18-24 months (or 250-300 kg weight)
   - Bulls: 24-30 months

**2. Heat Detection:**
   - Signs: Restlessness, mounting others, standing to be mounted
   - Mucus discharge, swollen vulva
   - Reduced milk yield, bellowing
   - Duration: 12-18 hours

**3. Best Time for AI/Natural Service:**
   - AM-PM Rule:
     * Heat in morning → Breed in evening
     * Heat in evening → Breed next morning
   - Generally: 12-18 hours after heat starts

**4. Artificial Insemination (AI) Benefits:**
   - Choose superior genetics
   - Avoid bull maintenance costs
   - Prevent disease transmission
   - Record keeping easier

**5. Post-Breeding Care:**
   - Keep cow calm for 30 minutes
   - Avoid stress
   - Good nutrition
   - Pregnancy check at 60 days

**6. Optimal Calving Interval:**
   - 12-13 months
   - Dry period: 60 days before calving
   - Re-breeding: 60-90 days after calving

**7. Record Keeping:**
   - Heat dates
   - Breeding dates
   - Expected calving date
   - Actual calving date

📊 **Success Rate:** AI success rate is 60-70% per service.`,

    'newborn calf': `**How to Take Care of a Newborn Calf:**

**First Hours (Critical!):**
1. **Colostrum Feeding**
   - Within 6 hours of birth (MUST!)
   - 4-6 liters on day 1
   - Continue for 3-4 days
   - Benefits: Immunity, vitamins, easy digestion

2. **Navel Care**
   - Dip navel in 7% iodine/tincture
   - Prevents infection
   - Do within 1 hour of birth

3. **Check for Breathing**
   - Remove mucus from nostrils
   - Rub with dry cloth if needed

**First Week:**
- Milk feeding: 3-4 liters, 2-3 times daily
- Clean, dry bedding
- Separate from mother
- Ear tagging for identification

**1 Week - 3 Months:**
- **Milk:** Gradually reduce to 2 liters/day
- **Calf Starter:** From 10 days (50-100g)
- **Green Fodder:** From 2 weeks (small quantities)
- **Water:** Clean, fresh water always available
- **Deworming:** At 2 months
- **Vaccinations:** Follow schedule

**Housing:**
- Individual pen first 2 months
- 1.5m x 1m space
- Good ventilation
- Clean bedding (change weekly)
- No direct wind

**Health Watch:**
- **Diarrhea** (Scours) - Most common issue
  * Keep hydrated (ORS solution)
  * Vet immediately if severe
- Regular temperature checks

🍼 **Feeding Schedule:**
- 0-7 days: Colostrum/whole milk
- 7-60 days: Whole milk + starter feed
- 60-90 days: Reduced milk + fodder + concentrate

💡 **Key:** First 24 hours determine calf's lifetime immunity!`,

    'housing temperature': `**Ideal Temperature for Cow Housing:**

**Optimal Temperature Range:**
- **Ideal:** 10°C - 25°C (50°F - 77°F)
- **Comfortable:** 5°C - 30°C
- **Critical High:** Above 35°C (heat stress)
- **Critical Low:** Below 0°C (cold stress)

**Heat Stress Signs (>30°C):**
- Rapid breathing (>80 breaths/min)
- Drooling, open-mouth breathing
- Reduced milk production (up to 30%)
- Reduced feed intake
- Standing instead of lying down

**Heat Stress Management:**
1. **Shade**
   - Provide adequate shade (4-5 sq meters per cow)
   - Orient shed East-West
   - Roof height: 12-15 feet

2. **Ventilation**
   - Cross ventilation
   - Fans in hot regions
   - Open sides with curtains

3. **Cooling**
   - Sprinklers/foggers (in extreme heat)
   - Cool drinking water (change frequently)
   - Wet gunny bags on windows

4. **Feeding**
   - Feed during cooler hours (early morning/late evening)
   - High-energy diet
   - Electrolyte supplementation

**Cold Stress Management (<5°C):**
- Dry bedding (thick straw)
- Draft-free housing
- Adequate space (prevents crowding)
- Extra feed (10-15% more energy)

**Housing Design Tips:**
- **Roof:** Asbestos/metal with insulation
- **Floor:** Concrete with slope (1-2%)
- **Manger:** 60-70 cm width per cow
- **Space:** 40-50 sq ft per adult cow

🌡️ **Monitor:** Check respiration rate regularly - normal is 10-30 breaths/min.`
};

// Function to find best matching response
function findBestResponse(message) {
    const lowerMessage = message.toLowerCase();

    // Check for disease-related queries
    if (lowerMessage.includes('disease') || lowerMessage.includes('symptom') ||
        lowerMessage.includes('sick') || lowerMessage.includes('mastitis') ||
        lowerMessage.includes('bloat')) {
        return cowKnowledgeBase['diseases'];
    }

    // Check for milk production queries
    if (lowerMessage.includes('milk production') || lowerMessage.includes('increase milk') ||
        lowerMessage.includes('more milk') || lowerMessage.includes('dairy')) {
        return cowKnowledgeBase['milk production'];
    }

    // Check for vaccination queries
    if (lowerMessage.includes('vaccination') || lowerMessage.includes('vaccine') ||
        lowerMessage.includes('immunization') || lowerMessage.includes('fmd')) {
        return cowKnowledgeBase['vaccination'];
    }

    // Check for diet/feeding queries
    if (lowerMessage.includes('diet') || lowerMessage.includes('feed') ||
        lowerMessage.includes('nutrition') || lowerMessage.includes('lactating')) {
        return cowKnowledgeBase['diet lactating'];
    }

    // Check for pregnancy queries
    if (lowerMessage.includes('pregnant') || lowerMessage.includes('pregnancy') ||
        lowerMessage.includes('gestation') || lowerMessage.includes('expecting')) {
        return cowKnowledgeBase['pregnancy detection'];
    }

    // Check for breeding queries
    if (lowerMessage.includes('breeding') || lowerMessage.includes('breed') ||
        lowerMessage.includes('artificial insemination') || lowerMessage.includes('ai ')) {
        return cowKnowledgeBase['breeding'];
    }

    // Check for newborn calf queries
    if (lowerMessage.includes('calf') || lowerMessage.includes('newborn') ||
        lowerMessage.includes('colostrum') || lowerMessage.includes('baby cow')) {
        return cowKnowledgeBase['newborn calf'];
    }

    // Check for housing/temperature queries
    if (lowerMessage.includes('temperature') || lowerMessage.includes('housing') ||
        lowerMessage.includes('shed') || lowerMessage.includes('heat stress')) {
        return cowKnowledgeBase['housing temperature'];
    }

    // Generic response if no match
    return `I can help you with:

🐄 **Cow Diseases & Symptoms** - Common ailments and treatment
🥛 **Milk Production** - Tips to increase dairy yield
💉 **Vaccination Schedule** - Complete immunization guide
🌾 **Proper Diet** - Nutrition for lactating cows
🤰 **Pregnancy Detection** - How to identify if cow is pregnant
🔬 **Breeding Practices** - Best practices for cow breeding
🍼 **Newborn Calf Care** - Complete care guide for calves
🏠 **Housing & Temperature** - Ideal conditions for cows

Please ask a specific question about any of these topics!`;
}

const getChatbotResponse = async (userMessage, conversationHistory = []) => {
    try {
        // Check if OpenAI API key is configured
        if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key') {
            // Use actual OpenAI if key is configured
            const openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY,
            });

            const SYSTEM_PROMPT = `You are an expert agricultural assistant specializing in dairy farming and cattle management. 
You have extensive knowledge about:
- Cow diseases and their symptoms
- Vaccination schedules for cattle
- Feed nutrition and optimal diet for dairy cows
- Breeding cycles and reproductive health
- Milk production optimization techniques
- General cattle care and welfare

Provide helpful, practical advice to farmers. Keep responses concise, actionable, and easy to understand. 
If you're unsure about something, acknowledge it and recommend consulting a veterinarian.`;

            const messages = [
                { role: 'system', content: SYSTEM_PROMPT },
                ...conversationHistory,
                { role: 'user', content: userMessage },
            ];

            const response = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: messages,
                max_tokens: 500,
                temperature: 0.7,
            });

            return response.choices[0].message.content;
        } else {
            // Use mock knowledge base if no API key
            return findBestResponse(userMessage);
        }
    } catch (error) {
        console.error('AI Service Error:', error);
        // Fallback to mock response on error
        return findBestResponse(userMessage);
    }
};

module.exports = { getChatbotResponse };
