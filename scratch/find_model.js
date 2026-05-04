const API_KEY = "AIzaSyD3Ok20vw7H0P8ZL2dLilYk2qPHaFU7_1g";
async function findModel() {
  const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
  const data = await resp.json();
  const flash15 = data.models.find(m => m.name.includes("gemini-1.5-flash") && !m.name.includes("8b"));
  console.log("Found Model Name:", flash15 ? flash15.name : "Not found");
}
findModel();
