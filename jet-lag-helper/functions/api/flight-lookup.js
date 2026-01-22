// Cloudflare Pages Function for Flight Lookup (OpenSky API)
// This file should be placed at: functions/api/flight-lookup.js
// NOTE: This is a STUB for future implementation

export async function onRequestGet(context) {
    try {
        const url = new URL(context.request.url);
        const flightNumber = url.searchParams.get('flight');
        
        if (!flightNumber) {
            return new Response(JSON.stringify({
                error: 'Flight number is required'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // FUTURE IMPLEMENTATION:
        // OpenSky Network API: https://opensky-network.org/apidoc/
        // Note: OpenSky data is ADS-B based and may be incomplete
        // Usage must be non-commercial (see: https://opensky-network.org/about/terms-of-use)
        
        /*
        // Example implementation (UNCOMMENT when ready to use):
        
        // Get credentials from environment variables
        const OPENSKY_USERNAME = context.env.OPENSKY_USERNAME;
        const OPENSKY_PASSWORD = context.env.OPENSKY_PASSWORD;
        
        // Build OpenSky API request
        const openskyUrl = `https://opensky-network.org/api/flights/all?begin=${Math.floor(Date.now()/1000) - 86400}&end=${Math.floor(Date.now()/1000)}`;
        
        const response = await fetch(openskyUrl, {
            headers: {
                'Authorization': 'Basic ' + btoa(`${OPENSKY_USERNAME}:${OPENSKY_PASSWORD}`)
            }
        });
        
        if (!response.ok) {
            throw new Error('OpenSky API request failed');
        }
        
        const data = await response.json();
        
        // Filter by flight number (callsign in OpenSky)
        const flight = data.find(f => f.callsign && f.callsign.trim() === flightNumber.toUpperCase());
        
        if (!flight) {
            return new Response(JSON.stringify({
                error: 'Flight not found',
                message: 'No data available for this flight number'
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Return flight data
        return new Response(JSON.stringify({
            flightNumber: flight.callsign.trim(),
            origin: flight.estDepartureAirport,
            destination: flight.estArrivalAirport,
            departureTime: new Date(flight.firstSeen * 1000).toISOString(),
            arrivalTime: new Date(flight.lastSeen * 1000).toISOString()
        }), {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
        */
        
        // TEMPORARY: Return mock response
        return new Response(JSON.stringify({
            error: 'Flight lookup not yet implemented',
            message: 'This feature is coming soon. Please use manual entry for now.',
            note: 'To enable: Set OPENSKY_USERNAME and OPENSKY_PASSWORD in Cloudflare environment variables'
        }), {
            status: 501, // Not Implemented
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

// Handle CORS preflight
export async function onRequestOptions() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
}

/*
INSTRUCTIONS TO ENABLE OPENSKY API:

1. Create account at https://opensky-network.org/
2. In Cloudflare dashboard, go to your Pages project
3. Go to Settings > Environment variables
4. Add these variables:
   - OPENSKY_USERNAME: your-username
   - OPENSKY_PASSWORD: your-password
5. Uncomment the code section above
6. Redeploy your site

IMPORTANT NOTES:
- OpenSky data is ADS-B based and may be incomplete
- Not all flights are tracked
- Data may have delays
- Usage must be non-commercial
- Rate limits apply (see OpenSky docs)
- Free tier has limitations

For production use with commercial flights, consider:
- FlightAware API (paid)
- AviationStack API (paid)
- Aviation Edge API (paid)
*/