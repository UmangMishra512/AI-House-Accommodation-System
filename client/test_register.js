async function run() {
  const url = process.argv[2];
  const anonKey = process.argv[3];
  
  const res = await fetch(`${url}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      'apikey': anonKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email: `test_${Date.now()}@example.com`, password: 'password123', data: { name: 'Test' } })
  });
  
  const data = await res.json();
  console.log("Session present:", !!data.session);
  console.log("User email confirmed at:", data.user?.email_confirmed_at);
}

run();
