document.addEventListener('DOMContentLoaded', () => {
    const socket = io(); // Initialize Socket.IO client

    fetchAndDisplayResults();

    // Listen for real-time updates from the server
    socket.on('update', () => {
        console.log('Received update notification from server.');
        fetchAndDisplayResults();
    });
});

async function fetchAndDisplayResults() {
    try {
        const response = await fetch('/results');
        if (!response.ok) throw new Error('Failed to fetch results');
        const results = await response.json();

        // Update channels with data from results
        updateChannels(results);
    } catch (error) {
        console.error('Error loading or processing results:', error);
    }
}

function updateChannels(results) {
    const today = new Date().getDay();
    const hoChannelDaysSecondRegion = [1, 2, 6, 0];
    const hoChannelDaysThirdRegion = [3, 4];
    let hoChannelRegion = results[0] || {}; // Default to first region data

    if (hoChannelDaysSecondRegion.includes(today)) {
        hoChannelRegion = results[1] || {};
    } else if (hoChannelDaysThirdRegion.includes(today)) {
        hoChannelRegion = results[2] || {};
    }

    const firstRegion = results[0] || {};

    updateChannel('.ho-channel', hoChannelRegion);
    updateChannel('.a-channel', firstRegion);
    updateChannel('.b-channel', firstRegion, true, false, false);
    updateChannel('.c-channel', firstRegion, false, true, false);
    updateChannel('.d-channel', firstRegion, false, false, true);
}


function updateChannel(channelSelector, regionData, isBChannel = false, isCChannel = false, isDChannel = false) {
    // Define the path to your loading.gif
    const loadingGifPath = 'loading5.gif'; // Ensure this points to the correct location of your loading GIF

    const twoDigitsContainer = document.querySelector(`${channelSelector} #two-digits`);
    const threeDigitsContainer = document.querySelector(`${channelSelector} #three-digits`);
    let twoDigits, threeDigits;

    // Handling for special channels based on the provided region data
    if (isBChannel) {
        const giaidbValue = regionData.results?.giaidb?.toString() || "00";
        twoDigits = giaidbValue.substring(1, 3); // The second and third characters
        threeDigits = giaidbValue.slice(-3); // The last three characters
    } else if (isCChannel) {
        const giaidbValue = regionData.results?.giaidb?.toString() || "00";
        twoDigits = giaidbValue.substring(4, 6); // The fourth and fifth characters
        threeDigits = giaidbValue.substring(1, 4); // From second to fourth characters
    } else if (isDChannel) {
        const giaidbValue = regionData.results?.giaidb?.toString() || "00";
        twoDigits = giaidbValue.substring(1, 2) + giaidbValue.slice(-1); // The second and last characters
        threeDigits = giaidbValue.substring(2, 5); // From third to fifth characters
    } else {
        // Default handling for other channels
        const giai8Value = regionData.results?.giai8?.toString() || "00";
        const giai7Value = regionData.results?.giai7?.toString() || "00";
        twoDigits = giai8Value.slice(-2);
        threeDigits = giai7Value;
    }

    // Update the channel's display based on the twoDigits and threeDigits values
    if (!twoDigits || twoDigits === "00") { // Check if twoDigits is considered empty
        twoDigitsContainer.innerHTML = `<img src="${loadingGifPath}" alt="Loading..." style="width: 100px; height: auto;">`;
    } else {
        twoDigitsContainer.innerHTML = twoDigits; // Display twoDigits
    }

    // Update the channel's display based on the twoDigits and threeDigits values
    if (!threeDigits|| threeDigits === "00") { // Check if twoDigits is considered empty
        threeDigitsContainer.innerHTML = `<img src="${loadingGifPath}" alt="Loading..." style="width: 100px; height: auto;">`;
    } else {
        threeDigitsContainer.textContent = threeDigits; // display threeDigits
    }

    
}
