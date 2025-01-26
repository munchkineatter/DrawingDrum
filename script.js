document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('playerForm');
    const playerInputs = document.getElementById('playerInputs');
    const headerImageInput = document.getElementById('headerImage');
    const uploadHeaderButton = document.getElementById('uploadHeader');
    const minutesInput = document.getElementById('minutes');
    const secondsInput = document.getElementById('seconds');
    const textSizeInput = document.getElementById('textSize');
    const startTimerButton = document.getElementById('startTimer');
    const ws = new WebSocket('https://drawingdrum.onrender.com');

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'players') {
            const players = data.payload;
            const winnersList = document.getElementById('winnersList');
            if (winnersList) {
                winnersList.innerHTML = ''; // Clear the list
                players.forEach(player => {
                    const li = document.createElement('li');
                    li.classList.add('list-group-item', 'bg-dark', 'text-white');
                    li.textContent = player;
                    winnersList.appendChild(li);
                });
            }
        } else if (data.type === 'header') {
            const headerImage = document.getElementById('headerImageDisplay');
            if (headerImage) {
                headerImage.src = data.payload;
            }
        } else if (data.type === 'timer') {
            const timerDisplay = document.getElementById('timerDisplay');
            if (timerDisplay) {
                const totalSec = data.payload; 
                const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
                const ss = String(totalSec % 60).padStart(2, '0');
                timerDisplay.textContent = `Time Remaining: ${mm}:${ss}`;
            }
        } else if (data.type === 'fontSize') {
            const winnersList = document.getElementById('winnersList');
            if (winnersList) {
                winnersList.style.fontSize = data.payload + 'px';
            }
        }
    };

    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const playerRows = document.querySelectorAll('.player-row');
            const players = Array.from(playerRows).map((row, index) => {
                const playerInfo = row.querySelector('input[name="playerInfo"]').value;
                return `${index + 1}. ${playerInfo}`;
            });

            // Send player information to the server
            ws.send(JSON.stringify({ type: 'players', payload: players }));

            // Also broadcast the new font size
            const fontSize = parseInt(textSizeInput.value, 10) || 16;
            ws.send(JSON.stringify({
                type: 'fontSize',
                payload: fontSize
            }));

            // Calculate total time in seconds
            const minutes = parseInt(minutesInput.value, 10) || 0;
            const seconds = parseInt(secondsInput.value, 10) || 0;
            const totalTime = minutes * 60 + seconds;

            // Send timer information to the server
            ws.send(JSON.stringify({ type: 'timer', payload: totalTime }));

            // Clear form fields
            form.reset();
        });

        playerInputs.addEventListener('click', (event) => {
            if (event.target.classList.contains('add-row')) {
                const newRow = document.createElement('div');
                newRow.classList.add('form-row', 'align-items-center', 'mb-3', 'player-row');
                const rowCount = playerInputs.children.length + 1;
                newRow.innerHTML = `
                    <label class="col-auto">${rowCount}.</label>
                    <input type="text" class="form-control col" name="playerInfo" required>
                    <button type="button" class="btn btn-success ml-2 add-row">+</button>
                    <button type="button" class="btn btn-danger ml-2 remove-row">-</button>
                `;
                playerInputs.appendChild(newRow);
            } else if (event.target.classList.contains('remove-row')) {
                if (playerInputs.children.length > 1) {
                    event.target.parentElement.remove();
                    // Update labels
                    Array.from(playerInputs.children).forEach((row, index) => {
                        row.querySelector('label').textContent = `${index + 1}.`;
                    });
                }
            }
        });
    }

    uploadHeaderButton.addEventListener('click', () => {
        const file = headerImageInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageData = e.target.result;
                ws.send(JSON.stringify({ type: 'header', payload: imageData }));
            };
            reader.readAsDataURL(file);
        }
    });

    if (startTimerButton) {
        startTimerButton.addEventListener('click', () => {
            const minutes = parseInt(minutesInput.value, 10) || 0;
            const seconds = parseInt(secondsInput.value, 10) || 0;
            const totalTime = minutes * 60 + seconds;

            ws.send(JSON.stringify({
                type: 'timer',
                payload: totalTime
            }));
        });
    }
}); 
