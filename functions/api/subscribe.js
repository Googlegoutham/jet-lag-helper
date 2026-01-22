// Cloudflare Pages Function for Email Subscription
// This file should be placed at: functions/api/subscribe.js

export async function onRequestPost(context) {
    try {
        const body = await context.request.json();
        const { email } = body;
        
        // Validate email
        if (!email) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Email is required'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Simple email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Invalid email format'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Mock successful subscription
        // In production, you would integrate with:
        // - Mailchimp: https://mailchimp.com/developer/
        // - SendGrid: https://sendgrid.com/docs/api-reference/
        // - ConvertKit: https://developers.convertkit.com/
        // - Your own database
        
        // For now, just log it (you can see this in Cloudflare dashboard logs)
        console.log('New email subscription:', email);
        
        // TODO: Add integration with email service
        // Example for future:
        /*
        const MAILCHIMP_API_KEY = context.env.MAILCHIMP_API_KEY;
        const MAILCHIMP_LIST_ID = context.env.MAILCHIMP_LIST_ID;
        
        const response = await fetch(`https://us1.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${MAILCHIMP_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email_address: email,
                status: 'subscribed'
            })
        });
        */
        
        return new Response(JSON.stringify({
            success: true,
            message: 'Subscribed successfully'
        }), {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
        
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
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
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
}