document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('playerForm');
    const winnersList = document.getElementById('winnersList');
    const ws = new WebSocket('ws://localhost:8080');

    ws.onmessage = (event) => {
        const players = JSON.parse(event.data);
        if (winnersList) {
            winnersList.innerHTML = ''; // Clear the list
            players.forEach(player => {
                const li = document.createElement('li');
                li.textContent = `${player.name} - ${player.cardNumber}`;
                winnersList.appendChild(li);
            });
        }
    };

    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const name = document.getElementById('name').value;
            const cardNumber = document.getElementById('cardNumber').value;

            // Send player information to the server
            ws.send(JSON.stringify({ name, cardNumber }));

            // Clear form fields
            form.reset();
        });
    }
}); 