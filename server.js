// Replace require with import for ES Modules
import express from 'express';
import fetch from 'node-fetch';
import fs from 'fs';


// Initialize the Express app
const app = express();
const PORT = 3000;

// Function to extract the user's IP address
function getClientIP(req) {
  // Check the X-Forwarded-For header (it may contain multiple IPs, pick the first one)
  const xForwardedFor = req.headers["x-forwarded-for"];
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim();
  }

  // Fallback to req.socket.remoteAddress
  return req.socket.remoteAddress;
}

// Main route for the app
app.get("/", async (req, res) => {
  const ip = getClientIP(req); // Get the user's IP address

  try {
    // Fetch geolocation data from the ip-api
    const geoData = await fetch(`http://ip-api.com/json/${ip}`).then((response) =>
      response.json()
    );

    // Log the IP and geolocation data to a file (logs.txt)
    const logEntry = `IP: ${ip}, Country: ${geoData.country}, City: ${geoData.city}, Time: ${new Date().toISOString()}\n`;
    fs.appendFileSync("logs.txt", logEntry); // Log to file

    // Log the information to the console (for debugging)
    console.log("User IP:", ip);
    console.log("Geo Info:", geoData);

    // Send response to the user (showing IP, country, and city)
    res.send(`
      <h1>MissYou - IP Tracker</h1>
      <p>Your IP address: ${ip}</p>
      <p>Country: ${geoData.country}</p>
      <p>City: ${geoData.city}</p>
    `);
  } catch (error) {
    // Handle error fetching geolocation data
    console.error("Error fetching geolocation data:", error);

    // Send an error response if the geolocation request fails
    res.status(500).send(`
      <h1>MissYou - IP Tracker</h1>
      <p>Sorry, we couldn't fetch your location details.</p>
    `);
  }
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`MissYou server is running on http://localhost:${PORT}`);
});
