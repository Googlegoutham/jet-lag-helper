// Cloudflare Pages Function for Jet Lag Calculation
// This file should be placed at: functions/api/calc.js

export async function onRequestPost(context) {
    try {
        const body = await context.request.json();
        
        // Validate required fields
        const { originTz, destTz, departureLocalISO, arrivalLocalISO, sleptOnFlight, age } = body;
        
        if (!originTz || !destTz || !departureLocalISO || !arrivalLocalISO || sleptOnFlight === undefined || !age) {
            return new Response(JSON.stringify({
                error: 'Missing required fields'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Calculate time difference using timezone offsets
        const timezoneOffsets = {
            'America/New_York': -5,
            'America/Chicago': -6,
            'America/Denver': -7,
            'America/Los_Angeles': -8,
            'Europe/London': 0,
            'Europe/Paris': 1,
            'Asia/Dubai': 4,
            'Asia/Singapore': 8,
            'Asia/Tokyo': 9,
            'Asia/Shanghai': 8,
            'Australia/Sydney': 11
        };
        
        const originOffset = timezoneOffsets[originTz] || 0;
        const destOffset = timezoneOffsets[destTz] || 0;
        const timeDiffHours = Math.abs(destOffset - originOffset);
        const zonesCrossed = timeDiffHours;
        
        // Determine direction
        let direction = 'West';
        if (destOffset > originOffset) {
            direction = 'East';
        } else if (destOffset === originOffset) {
            direction = 'None';
        }
        
        // Calculate estimated recovery days
        // Base formula: 0.7 days per zone crossed
        let recoveryDays = Math.ceil(zonesCrossed * 0.7);
        
        // Adjust for direction (East is harder)
        if (direction === 'East') {
            recoveryDays += 1;
        }
        
        // Adjust for sleep
        if (sleptOnFlight) {
            recoveryDays = Math.max(1, recoveryDays - 1);
        }
        
        // Adjust for age
        if (age === '51-65' || age === '66+') {
            recoveryDays += 1;
        } else if (age === '18-30') {
            recoveryDays = Math.max(1, recoveryDays - 1);
        }
        
        // Ensure minimum of 1 day
        recoveryDays = Math.max(1, recoveryDays);
        
        // Determine severity
        let severity = 'Mild';
        if (recoveryDays >= 9) {
            severity = 'Severe';
        } else if (recoveryDays >= 5) {
            severity = 'Moderate';
        }
        
        // Generate personalized tips
        const topTips = generateTips(zonesCrossed, direction, severity, sleptOnFlight, age);
        
        // Return response
        return new Response(JSON.stringify({
            timeDiffHours,
            zonesCrossed,
            direction,
            estimatedRecoveryDays: recoveryDays,
            severity,
            topTips
        }), {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
        
    } catch (error) {
        return new Response(JSON.stringify({
            error: 'Internal server error',
            message: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

function generateTips(zones, direction, severity, slept, age) {
    const tips = [];
    
    // Light exposure tips based on direction
    if (direction === 'East') {
        tips.push('Seek bright morning light exposure for 30-45 minutes upon waking');
        tips.push('Avoid bright light in the evening, especially 2 hours before bed');
    } else if (direction === 'West') {
        tips.push('Get afternoon/evening light exposure between 4-7pm local time');
        tips.push('Wear sunglasses in the morning to delay your body clock');
    }
    
    // Caffeine management
    if (severity === 'Severe') {
        tips.push('Avoid caffeine after 12pm local time for the first 3 days');
    } else {
        tips.push('Limit caffeine intake after 2pm local time');
    }
    
    // Melatonin recommendation
    if (zones >= 5) {
        tips.push('Consider 0.5-1mg melatonin 30 minutes before your target bedtime');
    }
    
    // Hydration
    if (severity === 'Severe' || !slept) {
        tips.push('Stay very well hydrated - drink at least 3 liters of water daily');
    } else {
        tips.push('Maintain good hydration - aim for 2-3 liters of water per day');
    }
    
    // Exercise
    tips.push('Do light exercise (walking, stretching) in the morning sunlight');
    
    // Meal timing
    tips.push('Eat meals at local times immediately upon arrival');
    
    // Napping
    if (!slept) {
        tips.push('Take short 20-minute power naps before 3pm if extremely tired');
    }
    
    // Age-specific
    if (age === '66+' || age === '51-65') {
        tips.push('Allow extra time for adjustment and prioritize sleep quality');
    }
    
    // Alcohol
    if (severity === 'Severe') {
        tips.push('Avoid alcohol for the first 48 hours after arrival');
    }
    
    // Return top 4-5 most relevant tips
    return tips.slice(0, 5);
}

// Handle CORS preflight
export async function onRequestOptions() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
}