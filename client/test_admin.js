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
  const token = authData.access_token;
  
  const headers = {
    'apikey': anonKey,
    'Authorization': `Bearer ${token}`
  };

  console.log("Testing users...");
  const u = await fetch(`${url}/rest/v1/users?select=*`, { headers }).then(r => r.json());
  console.log("Users:", Array.isArray(u) ? `Success (${u.length})` : u);

  console.log("Testing properties...");
  const p = await fetch(`${url}/rest/v1/properties?select=*,owner:users!owner_id(name,email)`, { headers }).then(r => r.json());
  console.log("Properties:", Array.isArray(p) ? `Success (${p.length})` : p);

  console.log("Testing messages...");
  const m = await fetch(`${url}/rest/v1/contact_messages?select=*,property:properties(title)`, { headers }).then(r => r.json());
  console.log("Messages:", Array.isArray(m) ? `Success (${m.length})` : m);
}

run();
