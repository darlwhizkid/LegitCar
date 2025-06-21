// Test script to check existing admin endpoints
async function testAdminEndpoints() {
    const baseUrl = 'https://propamit-backend.vercel.app';
    const endpoints = [
        '/api/admin/login',
        '/api/admin/users',
        '/api/admin/applications',
        '/api/admin/messages'
    ];
    
    console.log('Testing admin endpoints...');
    
    for (const endpoint of endpoints) {
        try {
            const response = await fetch(`${baseUrl}${endpoint}`, {
                method: endpoint === '/api/admin/login' ? 'POST' : 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: endpoint === '/api/admin/login' ? 
                    JSON.stringify({ email: 'test@test.com', password: 'test' }) : 
                    undefined
            });
            
            console.log(`${endpoint}: ${response.status} - ${response.statusText}`);
            
            if (response.status === 404) {
                console.log(`❌ ${endpoint} - NOT FOUND`);
            } else if (response.status === 401) {
                console.log(`🔒 ${endpoint} - EXISTS but needs authentication`);
            } else if (response.status < 500) {
                console.log(`✅ ${endpoint} - EXISTS`);
            }
            
        } catch (error) {
            console.log(`❌ ${endpoint} - ERROR: ${error.message}`);
        }
    }
}

// Run the test
testAdminEndpoints();