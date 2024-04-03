document.addEventListener('DOMContentLoaded', function () {
    const resultsContainer = document.getElementById('results');

    // Connect to the server via Socket.IO
    const socket = io();

    // Fetch and display the initial set of results
    fetch('/results')
        .then(response => response.json())
        .then(data => {
            displayResults(data, resultsContainer);
        })
        .catch(error => console.error('Error fetching results:', error));

    // Listen for real-time updates from the server
    socket.on('update', () => {
        fetch('/results')
            .then(response => response.json())
            .then(data => {
                displayResults(data, resultsContainer);
            })
            .catch(error => console.error('Error fetching updated results:', error));
    });



    function displayResults(data, container) {
        container.innerHTML = ''; // Clear previous results

        const card = document.createElement('div');
        card.className = 'region-container';

        data.forEach(region => {
            const regionDiv = document.createElement('div');
            regionDiv.className = 'region';

            Object.entries(region.results).forEach(([category, result]) => {
                const resultText = document.createElement('p');
                resultText.classList.add(category); // Apply category as class for styling

                if (category === 'giai6') {
                    // Handling giai6 formatting
                    const resultsArray = result.split('\n');
                    resultText.innerHTML = resultsArray[0] + '<br>' + resultsArray.slice(1).join('   ');
                } else if (category === 'giai4') {
                    // Special handling for giai4 formatting
                    const resultsArray = result.split('\n');
                    resultText.innerHTML = resultsArray[0] + 
                                           '<br>' + resultsArray.slice(1, 3).join('   ') + 
                                           '<br>' + resultsArray.slice(3, 5).join('   ') + 
                                           '<br>' + resultsArray.slice(5).join('   ');
                } else {
                    // Default handling for other categories
                    resultText.innerText = result.replace(/\n/g, ' ');
                }

                regionDiv.appendChild(resultText);
            });

            card.appendChild(regionDiv);
        });

        container.appendChild(card);
    }

});
