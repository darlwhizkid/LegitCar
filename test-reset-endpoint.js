// Test script to check if reset endpoint exists
async function testResetEndpoint() {
    const baseUrl = 'https://propamit-backend.vercel.app';
    
    console.log('Testing reset endpoint...');
    
    try {
        // First, test if the endpoint exists
        const response = await fetch(`${baseUrl}/api/admin/reset-database`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', [...response.headers.entries()]);
        
        if (response.status === 404) {
            console.log('❌ Endpoint does not exist');
        } else if (response.status === 401) {
            console.log('✅ Endpoint exists but needs authentication');
        } else if (response.status === 405) {
            console.log('✅ Endpoint exists but method not allowed');
        } else {
            console.log('✅ Endpoint exists');
        }
        
        const text = await response.text();
        console.log('Response body:', text);
        
    } catch (error) {
        console.error('❌ Network error:', error.message);
    }
}

// Run the test
testResetEndpoint();