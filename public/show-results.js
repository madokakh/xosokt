
var giaidbValue ='';
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
    const currentTime = new Date();
    const formattedTime = currentTime.getHours() * 100 + currentTime.getMinutes();

    let hoChannelRegionIndex = 0; // Mặc định lấy region đầu tiên

    // Đặt điều kiện thời gian < 15:00 để lấy region thứ 2
    if (formattedTime < 1500) {
        hoChannelRegionIndex = 1; // Lấy region thứ 2 nếu thời gian < 15 giờ
    } else {
        // Điều chỉnh region dựa trên ngày trong tuần nếu thời gian >= 15 giờ
        if ([1, 2, 6, 0].includes(today)) { // Thứ 2, 3, 7, Chủ Nhật
            hoChannelRegionIndex = 1; // Lấy region thứ 2
        } else if ([3, 4].includes(today)) { // Thứ 4, 5
            hoChannelRegionIndex = 2; // Lấy region thứ 3
        } // Ngày thứ 6 không cần thiết lập vì đã xử lý ở điều kiện thời gian
    }

    const hoChannelRegion = results[hoChannelRegionIndex] || {};
    const firstRegion = results[0] || {}; // Luôn lấy region đầu tiên cho các kênh khác

    updateChannel('.ho-channel', hoChannelRegion);
    updateChannel('.a-channel', firstRegion);
    updateChannel('.b-channel', firstRegion, true, false, false);
    updateChannel('.c-channel', firstRegion, false, true, false);
    updateChannel('.d-channel', firstRegion, false, false, true);
}

/* function updateChannel(channelSelector, regionData, isBChannel = false, isCChannel = false, isDChannel = false) {
    const loadingGifPath = 'loading5.gif'; // Adjust this path as needed

    const twoDigitsContainer = document.querySelector(`${channelSelector} #two-digits`);
    const threeDigitsContainer = document.querySelector(`${channelSelector} #three-digits`);

    let twoDigits, threeDigits;

    if (isBChannel) {
        const giaidbValue = regionData.results?.giaidb?.toString();
        twoDigits = giaidbValue.substring(0, 2);
        threeDigits = giaidbValue.slice(-3);
    } else if (isCChannel) {
        const giaidbValue = regionData.results?.giaidb?.toString();
        twoDigits = giaidbValue.slice(-2);
        threeDigits = giaidbValue.substring(0, 3);
    } else if (isDChannel) {
        const giaidbValue = regionData.results?.giaidb?.toString();
        twoDigits = giaidbValue.substring(0, 1) + giaidbValue.slice(-1);
        threeDigits = giaidbValue.substring(1, 4);
    } else {
        const giai8Value = regionData.results?.giai8?.toString();
        const giai7Value = regionData.results?.giai7?.toString();
        twoDigits = giai8Value.slice(-2);
        threeDigits = giai7Value;
    }

    twoDigitsContainer.innerHTML = twoDigits ? twoDigits : `<img src="${loadingGifPath}" alt="Loading..." style="width: 100px; height: auto;">`;
    threeDigitsContainer.innerHTML = threeDigits ? threeDigits : `<img src="${loadingGifPath}" alt="Loading..." style="width: 100px; height: auto;">`;
} */
function updateChannel(channelSelector, regionData, isBChannel = false, isCChannel = false, isDChannel = false) {
    const loadingGifPath = 'loading5.gif'; // loading gif image

    const twoDigitsContainer = document.querySelector(`${channelSelector} #two-digits`);
    const threeDigitsContainer = document.querySelector(`${channelSelector} #three-digits`);

    let twoDigits, threeDigits;



   /*  // Apply new loading logic based on channel
    if (channelSelector === '.ho-channel' || channelSelector === '.a-channel') {
        // For ho-channel and a-channel, show loading gif in two-digits until three-digits is not empty
        if (threeDigits === "") {
            twoDigitsContainer.innerHTML = `<img src="${loadingGifPath}" alt="Loading..." style="width: 100px; height: auto;">`;
        } else {
            twoDigitsContainer.textContent = twoDigits;
        }
        // three-digits always shows loading gif until giaidb is not empty
        threeDigitsContainer.innerHTML = regionData.results?.giaidb ? threeDigits : `<img src="${loadingGifPath}" alt="Loading..." style="width: 100px; height: auto;">`;
    } else {
        // Other channels follow original logic
        twoDigitsContainer.innerHTML = twoDigits ? twoDigits : `<img src="${loadingGifPath}" alt="Loading..." style="width: 100px; height: auto;">`;
        threeDigitsContainer.innerHTML = threeDigits ? threeDigits : `<img src="${loadingGifPath}" alt="Loading..." style="width: 100px; height: auto;">`;
    }
 */
    //  test  logic fi ho-channel or a-channel
    if (!isBChannel && !isCChannel && !isCChannel && !isDChannel) {
        const giai8Value = regionData.results?.giai8?.toString();
        const giai7Value = regionData.results?.giai7?.toString();
        twoDigits = giai8Value.slice(-2);
        threeDigits = giai7Value;
        const giai6Value = regionData.results?.giai6?.toString();
        if (threeDigits != "") {
            twoDigitsContainer.textContent = twoDigits;
        } else {
            twoDigitsContainer.innerHTML = `<img src="${loadingGifPath}" alt="Loading..." style="width: 100px; height: auto;">`;
        }
        if (giai6Value === "") {
            threeDigitsContainer.innerHTML = `<img src="${loadingGifPath}" alt="Loading..." style="width: 100px; height: auto;">`;
        } else {
            threeDigitsContainer.innerHTML = threeDigits;
        }
    } else {
        // Logic to extract twoDigits and threeDigits based on the channel type
        if (isBChannel) {
            const giaidbValue = regionData.results?.giaidb?.toString();
            twoDigits = giaidbValue.substring(1, 3);
            threeDigits = giaidbValue.slice(-3);
        } else if (isCChannel) {
            const giaidbValue = regionData.results?.giaidb?.toString();
            twoDigits = giaidbValue.substring(4, 6);
            threeDigits = giaidbValue.substring(1, 4);
        } else if (isDChannel) {
            const giaidbValue = regionData.results?.giaidb?.toString();
            twoDigits = giaidbValue.substring(1, 2) + giaidbValue.slice(-1);
            threeDigits = giaidbValue.substring(2, 5);
        } else {
            const giai8Value = regionData.results?.giai8?.toString();
            const giai7Value = regionData.results?.giai7?.toString();
            twoDigits = giai8Value.slice(-2);
            threeDigits = giai7Value;
        }

        twoDigitsContainer.innerHTML = twoDigits ? twoDigits : `<img src="${loadingGifPath}" alt="Loading..." style="width: 100px; height: auto;">`;
        threeDigitsContainer.innerHTML = threeDigits ? threeDigits : `<img src="${loadingGifPath}" alt="Loading..." style="width: 100px; height: auto;">`;
    }

}
