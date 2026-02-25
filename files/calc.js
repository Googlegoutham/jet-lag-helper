// Cloudflare Pages Function for Jet Lag Calculation
export async function onRequestPost(context) {
    try {
        const body = await context.request.json();
        const { originTz, destTz, departureLocalISO, arrivalLocalISO, sleptOnFlight, age } = body;
        
        if (!originTz || !destTz || !departureLocalISO || !arrivalLocalISO || sleptOnFlight === undefined || !age) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                status: 400, headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const timezoneOffsets = {
            'America/New_York': -5, 'America/Chicago': -6, 'America/Denver': -7,
            'America/Los_Angeles': -8, 'Europe/London': 0, 'Europe/Paris': 1,
            'Asia/Dubai': 4, 'Asia/Singapore': 8, 'Asia/Tokyo': 9,
            'Asia/Shanghai': 8, 'Australia/Sydney': 11
        };
        
        const originOffset = timezoneOffsets[originTz] || 0;
        const destOffset = timezoneOffsets[destTz] || 0;
        const timeDiffHours = Math.abs(destOffset - originOffset);
        const zonesCrossed = timeDiffHours;
        
        let direction = 'West';
        if (destOffset > originOffset) direction = 'East';
        else if (destOffset === originOffset) direction = 'None';
        
        let recoveryDays = Math.ceil(zonesCrossed * 0.7);
        if (direction === 'East') recoveryDays += 1;
        if (sleptOnFlight) recoveryDays = Math.max(1, recoveryDays - 1);
        if (age === '51-65' || age === '66+') recoveryDays += 1;
        else if (age === '18-30') recoveryDays = Math.max(1, recoveryDays - 1);
        recoveryDays = Math.max(1, recoveryDays);
        
        let severity = 'Mild';
        if (recoveryDays >= 9) severity = 'Severe';
        else if (recoveryDays >= 5) severity = 'Moderate';
        
        const topTips = generateTips(zonesCrossed, direction, severity, sleptOnFlight, age);
        
        return new Response(JSON.stringify({
            timeDiffHours, zonesCrossed, direction,
            estimatedRecoveryDays: recoveryDays, severity, topTips
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Internal server error', message: error.message }), {
            status: 500, headers: { 'Content-Type': 'application/json' }
        });
    }
}

function generateTips(zones, direction, severity, slept, age) {
    const tips = [];
    if (direction === 'East') {
        tips.push('Seek bright morning light exposure for 30-45 minutes upon waking');
        tips.push('Avoid bright light in the evening, especially 2 hours before bed');
    } else if (direction === 'West') {
        tips.push('Get afternoon/evening light exposure between 4-7pm local time');
        tips.push('Wear sunglasses in the morning to delay your body clock');
    }
    if (severity === 'Severe') tips.push('Avoid caffeine after 12pm local time for the first 3 days');
    else tips.push('Limit caffeine intake after 2pm local time');
    if (zones >= 5) tips.push('Consider 0.5-1mg melatonin 30 minutes before your target bedtime');
    if (severity === 'Severe' || !slept) tips.push('Stay very well hydrated - drink at least 3 liters of water daily');
    else tips.push('Maintain good hydration - aim for 2-3 liters of water per day');
    tips.push('Do light exercise (walking, stretching) in the morning sunlight');
    tips.push('Eat meals at local times immediately upon arrival');
    if (!slept) tips.push('Take short 20-minute power naps before 3pm if extremely tired');
    if (age === '66+' || age === '51-65') tips.push('Allow extra time for adjustment and prioritize sleep quality');
    if (severity === 'Severe') tips.push('Avoid alcohol for the first 48 hours after arrival');
    return tips.slice(0, 5);
}

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
