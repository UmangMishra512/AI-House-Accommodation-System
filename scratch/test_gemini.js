const API_KEY = "AIzaSyD3Ok20vw7H0P8ZL2dLilYk2qPHaFU7_1g";

async function testKey() {
  try {
    console.log("Listing models...");
    const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
    const data = await resp.json();
    
    if (data.error) {
      console.error("API Error:", JSON.stringify(data.error, null, 2));
      return;
    }

    console.log("Available Models (first 10):");
    data.models.slice(0, 10).forEach(m => {
      console.log(`- ${m.name} (Methods: ${m.supportedGenerationMethods.join(", ")})`);
    });

    console.log("\nTesting Gemini 2.0 Flash...");
    const testResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "hi" }] }]
      })
    });
    
    const testData = await testResp.json();
    if (testData.error) {
      console.error("Gemini 2.0 Flash Test Error:", JSON.stringify(testData.error, null, 2));
    } else {
      console.log("Gemini 2.0 Flash Test Success!");
    }

  } catch (err) {
    console.error("Script Error:", err);
  }
}

testKey();
