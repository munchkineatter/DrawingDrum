document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('playerForm');
    const playerInputs = document.getElementById('playerInputs');
    const addRowButton = document.querySelector('.add-row');
    const removeRowButton = document.querySelector('.remove-row');
    const headerImageInput = document.getElementById('headerImage');
    const uploadHeaderButton = document.getElementById('uploadHeader');
    const minutesInput = document.getElementById('minutes');
    const secondsInput = document.getElementById('seconds');
    const textSizeInput = document.getElementById('textSize');
    const startTimerButton = document.getElementById('startTimer');
    
    // We'll store an interval ID for countdown on the display page:
    let countdownInterval = null;

    // Updated WebSocket: "ws://" or "wss://" as needed
    const ws = new WebSocket('wss://drawingdrum.onrender.com');

    // Handle incoming messages
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'players') {
            const winnersList = document.getElementById('winnersList');
            if (winnersList) {
                winnersList.innerHTML = '';
                data.payload.forEach(player => {
                    const li = document.createElement('li');
                    li.classList.add('list-group-item', 'bg-dark', 'text-white');
                    li.textContent = player;
                    winnersList.appendChild(li);
                });
            }
        }
        else if (data.type === 'header') {
            const headerImage = document.getElementById('headerImageDisplay');
            if (headerImage) {
                headerImage.src = data.payload;
            }
        }
        else if (data.type === 'timer') {
            // Stop any previous countdown
            if (countdownInterval) {
                clearInterval(countdownInterval);
            }
            // Start a new countdown here
            let totalSec = data.payload;
            const timerDisplay = document.getElementById('timerDisplay');
            if (timerDisplay) {
                // Show initial time
                updateTimerDisplay(timerDisplay, totalSec);

                // Decrement every second
                countdownInterval = setInterval(() => {
                    totalSec--;
                    if (totalSec <= 0) {
                        clearInterval(countdownInterval);
                        timerDisplay.textContent = "Time's up!";
                    } else {
                        updateTimerDisplay(timerDisplay, totalSec);
                    }
                }, 1000);
            }
        }
        else if (data.type === 'fontSize') {
            const winnersList = document.getElementById('winnersList');
            if (winnersList) {
                winnersList.style.fontSize = data.payload + 'px';
            }
        }
    };

    // Helper function to format and display MM:SS
    function updateTimerDisplay(el, seconds) {
        const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
        const ss = String(seconds % 60).padStart(2, '0');
        el.textContent = `Time Remaining: ${mm}:${ss}`;
    }

    // If we are on the user page, we'll have a form
    if (form) {
        // Submit form => send players + font size + also sends timer
        form.addEventListener('submit', (event) => {
            event.preventDefault();

            const playerRows = document.querySelectorAll('.player-row');
            const players = Array.from(playerRows).map((row, index) => {
                const playerInfo = row.querySelector('input[name="playerInfo"]').value;
                return `${index + 1}. ${playerInfo}`;
            });

            // Send player information
            ws.send(JSON.stringify({ type: 'players', payload: players }));

            // Send text size
            const fontSize = parseInt(textSizeInput.value, 10) || 16;
            ws.send(JSON.stringify({ type: 'fontSize', payload: fontSize }));

            // Also send the timer once here if desired, but 
            // now we have a dedicated 'Start Timer' button.
            // We'll remove the auto-send from this submission if you prefer.

            form.reset();
        });

        // Listen for the plus/minus that are next to Submit
        if (addRowButton) {
            addRowButton.addEventListener('click', () => {
                const newRow = document.createElement('div');
                newRow.classList.add('form-row', 'align-items-center', 'mb-3', 'player-row');
                const rowCount = playerInputs.children.length + 1;
                newRow.innerHTML = `
                    <label class="col-auto">${rowCount}.</label>
                    <input type="text" class="form-control col" name="playerInfo" required>
                `;
                playerInputs.appendChild(newRow);
            });
        }

        if (removeRowButton) {
            removeRowButton.addEventListener('click', () => {
                // Remove the last row if there's more than 1
                if (playerInputs.children.length > 1) {
                    playerInputs.lastElementChild.remove();
                    // Update label numbers
                    Array.from(playerInputs.children).forEach((row, index) => {
                        row.querySelector('label').textContent = `${index + 1}.`;
                    });
                }
            });
        }
    }

    // "Set Header" functionality for user page
    uploadHeaderButton.addEventListener('click', () => {
        const file = headerImageInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                ws.send(JSON.stringify({ type: 'header', payload: e.target.result }));
            };
            reader.readAsDataURL(file);
        }
    });

    // Dedicated Start Timer button
    if (startTimerButton) {
        startTimerButton.addEventListener('click', () => {
            const minutes = parseInt(minutesInput.value, 10) || 0;
            const seconds = parseInt(secondsInput.value, 10) || 0;
            const totalTime = minutes * 60 + seconds;
            ws.send(JSON.stringify({ type: 'timer', payload: totalTime }));
        });
    }
}); 
