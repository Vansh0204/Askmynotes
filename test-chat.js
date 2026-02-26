
async function testChat() {
    try {
        const response = await fetch('http://localhost:5003/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                subject_name: 'Phy',
                extracted_text: 'Force is a push or pull.',
                question: 'What is force?',
                history: []
            })
        });
        const data = await response.json();
        console.log('Response Status:', response.status);
        console.log('Response Data:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Test failed:', error);
    }
}

testChat();
