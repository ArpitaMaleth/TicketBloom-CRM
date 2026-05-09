document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const res = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.status === 200) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            localStorage.setItem('email', email); // Saving email for settings page
            if(data.name) localStorage.setItem('name', data.name); // Saving name for settings page

            showBloomEffect(); // 🌸 NEW PART

        } else {
            alert(data.msg || 'Login failed');
        }
    } catch (err) {
        console.error(err);
        alert('Server error connecting to backend');
    }
});

/* 🌸 BLOOM EFFECT FUNCTION */
function showBloomEffect() {
    document.body.innerHTML = `
        <div style="text-align:center; margin-top:40vh; color:white;">
            <h1>🌸 Welcome to TicketBloom 🌸</h1>
            <p>Loading your dashboard...</p>
        </div>
    `;

    startFlowers();

    // After 3 sec → go to dashboard
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 3000);
}

/* 🌸 FLOWER ANIMATION */
function startFlowers() {
    setInterval(() => {
        let flower = document.createElement("div");
        flower.classList.add("flower");
        flower.innerHTML = "🌸";

        flower.style.left = Math.random() * 100 + "vw";
        flower.style.top = "100vh";

        document.body.appendChild(flower);

        setTimeout(() => flower.remove(), 5000);
    }, 300);
}