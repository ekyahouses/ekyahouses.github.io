document.addEventListener('DOMContentLoaded', () => {
    const scoreboardContainer = document.querySelector('.scoreboard-container');
    const houseElements = scoreboardContainer.querySelectorAll('.house');

    const modal = document.getElementById('myModal');
    const modalHouseName = document.getElementById('modalHouseName');
    const modalEventsTable = document.getElementById('modalEventsTable').getElementsByTagName('tbody')[0];
    var pointsData;
    var totalPointsByHouse = {};

    const csvUrl = 'Data/points.csv';

    // Fetch the points CSV file
    fetch(csvUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            pointsData = parseCSV(data);
            const totalPointsByHouse = calculateTotalPoints(pointsData);
            populateScoreboard(totalPointsByHouse);
        })
        .catch(error => console.error('Error fetching points data:', error));


    function parseCSV(data) {
        const rows = data.split('\n');
        const pointsData = [];

        for (let i = 1; i < rows.length; i++) {
            const columns = rows[i].split(',');
            const houseName = columns[0].trim();
            const date = columns[1].trim();
            const event = columns[2].trim();
            const points = parseInt(columns[3].trim());
            pointsData.push({ houseName, date, event, points });
        }

        return pointsData;
    }

    function calculateTotalPoints(pointsData) {
        pointsData.forEach(data => {
            const { houseName, points } = data;
            if (!totalPointsByHouse[houseName]) {
                totalPointsByHouse[houseName] = 0;
            }
            totalPointsByHouse[houseName] += points;
        });

        return totalPointsByHouse;
    }

    function populateScoreboard(totalPointsByHouse) {
        // Get all house elements and update their content with the total points
        houseElements.forEach(houseElement => {
            const houseName = houseElement.getAttribute('data-house');
            if (totalPointsByHouse.hasOwnProperty(houseName)) {
                const totalPoints = totalPointsByHouse[houseName];
                houseElement.querySelector('.pointsValue').textContent = `${totalPoints}`;
            } else {
                houseElement.querySelector('.pointsValue').textContent = '0';
            }
        });
    }

    houseElements.forEach(houseElement => {
        houseElement.addEventListener('click', () => {
            const houseName = houseElement.getAttribute('data-house');
            const houseEvents = getEventsByHouse(houseName, pointsData);
            showEventsPopup(houseName, houseEvents);
        });
    });

    function showEventsPopup(houseName, houseEvents) {
        modalHouseName.textContent = houseName.toUpperCase() + ": " + totalPointsByHouse[houseName] + " points";
        modalEventsTable.innerHTML = '';

        houseEvents.forEach(eventData => {
            const { event, date, points } = eventData;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${event}</td>
                <td>${date}</td>
                <td>${points}</td>
            `;
            modalEventsTable.appendChild(row);
        });

        modal.style.display = 'block';
    }

    // Close the modal when the user clicks on the 'x' button or outside the modal
    const modalCloseBtn = document.querySelector('.close');
    window.addEventListener('click', event => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    modalCloseBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    function getEventsByHouse(houseName, pointsData) {
        return pointsData.filter(data => data.houseName === houseName);
    }
});
