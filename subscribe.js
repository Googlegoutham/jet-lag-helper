export async function onRequestPost(context) {
    try {
        const body = await context.request.json();
        const { email } = body;
        
        if (!email) {
            return new Response(JSON.stringify({ success: false, error: 'Email is required' }), {
                status: 400, headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return new Response(JSON.stringify({ success: false, error: 'Invalid email format' }), {
                status: 400, headers: { 'Content-Type': 'application/json' }
            });
        }
        
        console.log('New email subscription:', email);
        
        return new Response(JSON.stringify({ success: true, message: 'Subscribed successfully' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
            status: 500, headers: { 'Content-Type': 'application/json' }
        });
    }
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
