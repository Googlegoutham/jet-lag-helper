// Smooth scroll function
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Symptoms Checker Logic
const symptomsForm = document.getElementById('symptomsForm');
if (symptomsForm) {
    symptomsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        let score = 0;
        
        const zones = document.querySelector('input[name="zones"]:checked');
        if (zones) score += parseInt(zones.value);
        
        const direction = document.querySelector('input[name="direction"]:checked');
        if (direction) score += parseInt(direction.value);
        
        const sleep = document.querySelector('input[name="sleep"]:checked');
        if (sleep) score += parseInt(sleep.value);
        
        const symptoms = document.querySelectorAll('input[name="symptoms"]:checked');
        symptoms.forEach(symptom => {
            score += parseInt(symptom.value);
        });
        
        const arrival = document.querySelector('input[name="arrival"]:checked');
        if (arrival) score += parseInt(arrival.value);
        
        let severity, severityClass, tips;
        
        if (score <= 5) {
            severity = "Mild Jet Lag";
            severityClass = "severity-mild";
            tips = [
                "Stay hydrated - drink at least 2-3 liters of water daily",
                "Get 15-20 minutes of morning sunlight exposure",
                "Maintain regular meal times in your new timezone",
                "Avoid heavy meals and alcohol for the first day"
            ];
        } else if (score <= 10) {
            severity = "Moderate Jet Lag";
            severityClass = "severity-moderate";
            tips = [
                "Seek bright light exposure in the morning for 30-45 minutes",
                "Avoid caffeine after 2pm local time",
                "Take short 20-minute power naps if needed, before 3pm",
                "Exercise lightly in the morning to reset your circadian rhythm",
                "Consider 0.5mg melatonin 30 minutes before target bedtime"
            ];
        } else {
            severity = "Severe Jet Lag";
            severityClass = "severity-severe";
            tips = [
                "Seek morning light exposure for 45-60 minutes daily for first 3 days",
                "Strictly avoid caffeine after 12pm local time",
                "Take 0.5-1mg melatonin 30 minutes before your target bedtime",
                "Stay very well hydrated - aim for 3+ liters of water daily",
                "Do light exercise (walking) in morning sunlight",
                "Avoid all alcohol for the first 48 hours"
            ];
        }
        
        const resultsDiv = document.getElementById('symptomsResults');
        const severityBadge = document.getElementById('severityBadge');
        const tipsList = document.getElementById('symptomsTips');
        
        severityBadge.textContent = severity;
        severityBadge.className = 'severity-badge ' + severityClass;
        
        tipsList.innerHTML = '';
        tips.forEach(tip => {
            const li = document.createElement('li');
            li.textContent = tip;
            tipsList.appendChild(li);
        });
        
        resultsDiv.style.display = 'block';
        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
}

// Flight Calculator Logic
const calculatorForm = document.getElementById('calculatorForm');
if (calculatorForm) {
    calculatorForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Calculating...';
        submitBtn.disabled = true;
        
        const formData = {
            originTz: document.getElementById('originTz').value,
            destTz: document.getElementById('destTz').value,
            departureLocalISO: document.getElementById('departure').value,
            arrivalLocalISO: document.getElementById('arrival').value,
            sleptOnFlight: document.getElementById('slept').value === 'true',
            age: document.getElementById('age').value
        };
        
        try {
            const response = await fetch('/api/calc', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) throw new Error('Calculation failed');
            
            const result = await response.json();
            
            document.getElementById('timeDiff').textContent = result.timeDiffHours + ' hours';
            document.getElementById('zonesCrossed').textContent = result.zonesCrossed + ' zones';
            document.getElementById('travelDirection').textContent = result.direction;
            document.getElementById('recoveryDays').textContent = result.estimatedRecoveryDays + ' days';
            
            const calcSeverityBadge = document.getElementById('calcSeverityBadge');
            calcSeverityBadge.textContent = result.severity + ' Jet Lag';
            
            let severityClass = '';
            if (result.severity === 'Mild') severityClass = 'severity-mild';
            else if (result.severity === 'Moderate') severityClass = 'severity-moderate';
            else severityClass = 'severity-severe';
            
            calcSeverityBadge.className = 'severity-badge ' + severityClass;
            
            const calcTipsList = document.getElementById('calcTips');
            calcTipsList.innerHTML = '';
            result.topTips.forEach(tip => {
                const li = document.createElement('li');
                li.textContent = tip;
                calcTipsList.appendChild(li);
            });
            
            const resultsDiv = document.getElementById('calculatorResults');
            resultsDiv.style.display = 'block';
            resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            
        } catch (error) {
            alert('Error calculating jet lag. Please try again.');
            console.error('Calculation error:', error);
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Email Subscription Logic
const emailForm = document.getElementById('emailForm');
if (emailForm) {
    emailForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        const emailInput = document.getElementById('email');
        const messageEl = document.getElementById('emailMessage');
        
        submitBtn.textContent = 'Subscribing...';
        submitBtn.disabled = true;
        messageEl.textContent = '';
        messageEl.className = 'form-message';
        
        try {
            const response = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailInput.value })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                messageEl.textContent = '✓ Thanks! Check your email for jet lag tips.';
                messageEl.classList.add('success');
                emailInput.value = '';
            } else {
                throw new Error(result.error || 'Subscription failed');
            }
        } catch (error) {
            messageEl.textContent = '✗ Oops! Something went wrong. Please try again.';
            messageEl.classList.add('error');
            console.error('Subscription error:', error);
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}
