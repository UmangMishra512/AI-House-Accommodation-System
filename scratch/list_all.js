const API_KEY = "AIzaSyD3Ok20vw7H0P8ZL2dLilYk2qPHaFU7_1g";
async function listAll() {
  const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
  const data = await resp.json();
  data.models.forEach(m => console.log(m.name));
}
listAll();
