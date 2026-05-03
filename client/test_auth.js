async function run() {
  const url = process.argv[2];
  const anonKey = process.argv[3];
  
  console.log("Signing in...");
  const authRes = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'apikey': anonKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email: 'vedantnarayan13@gmail.com', password: 'password123' })
  });
  
  const authData = await authRes.json();
  if (!authRes.ok) {
    console.error("Login Error:", authData);
    return;
  }
  
  const token = authData.access_token;
  const uid = authData.user.id;
  console.log("Logged in! UID:", uid);
  
  console.log("Fetching role from public.users...");
  const roleRes = await fetch(`${url}/rest/v1/users?id=eq.${uid}&select=role`, {
    method: 'GET',
    headers: {
      'apikey': anonKey,
      'Authorization': `Bearer ${token}`
    }
  });
  
  const roleData = await roleRes.json();
  console.log("Role Result:", roleData);
}

run();
