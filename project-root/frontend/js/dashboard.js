// 1. Check if the user is actually logged in
const token = localStorage.getItem('token');
const userRole = localStorage.getItem('role');

if (!token) {
    alert('Please login first!');
    window.location.href = 'login.html';
}

// 2. Show the "Create Ticket" form ONLY if the user is a customer
if (userRole === 'customer') {
    document.getElementById('createTicketSection').style.display = 'block';
}

// We'll track the current view to automatically filter what is shown.
window.currentView = 'Dashboard';

// 3. Fetch Dashboard Data (Tickets & Stats)
async function loadDashboard() {
    // If settings view is active, don't refresh tickets grid to prevent UI glitches
    if (window.currentView === 'Settings') return;

    try {
        const res = await fetch('http://localhost:5000/api/tickets', {
            method: 'GET',
            headers: { 'x-auth-token': token }
        });
        
        const data = await res.json();
        
        // Update Stats
        document.getElementById('total-count').innerText = data.stats.total;
        document.getElementById('open-count').innerText = data.stats.open;
        document.getElementById('in-progress-count').innerText = data.stats.inProgress || 0;
        document.getElementById('closed-count').innerText = data.stats.closed;

        // Ensure the ticket list matches the active layout
        const ticketList = document.getElementById('ticketList');
        if (window.currentView === 'All Tickets') {
            ticketList.classList.add('grid-view'); // Our custom horizontal grid class
        } else {
            ticketList.classList.remove('grid-view');
        }

        ticketList.innerHTML = ''; // Clear loading text

        // Filter tickets based on active view:
        // Dashboard = Active (Open/In Progress)
        // All Tickets = History (Closed tickets included)
        let displayTickets = data.tickets;
        
        if (window.currentView === 'Dashboard') {
            displayTickets = data.tickets.filter(t => t.status !== 'closed');
        }

        if (displayTickets.length === 0) {
            ticketList.innerHTML = `<p class="text-muted">No ${window.currentView === 'Dashboard' ? 'active' : ''} tickets found.</p>`;
            return;
        }

        displayTickets.forEach(ticket => {
            let solveButtons = '';
            // Show action buttons: Agents can update progress, anyone (including Customer) can close an open/in-progress ticket
            if (ticket.status !== 'closed') {
                if (userRole !== 'customer' && ticket.status === 'open') {
                    solveButtons += `<button class="btn-action btn-warning" onclick="updateTicketStatus('${ticket._id}', 'in-progress')">Mark In-Progress ⏳</button> `;
                }
                solveButtons += `<button class="btn-action btn-success" onclick="updateTicketStatus('${ticket._id}', 'closed')">Mark as Solved ✓</button>`;
            }

            let deleteButton = '';
            // If the ticket is closed, add a big red cross button to delete it
            if (ticket.status === 'closed') {
                deleteButton = `<button style="background:none; border:none; color:var(--primary); font-size:18px; cursor:pointer;" onclick="deleteTicket('${ticket._id}')" title="Delete Ticket">✖</button>`;
            }

            let solutionText = '';
            let badgeText = ticket.status; // Default badge text
            
            if (ticket.solution) {
                // If it's still in-progress but has a solution, change the badge text to indicate it's answered!
                if (ticket.status === 'in-progress') {
                    badgeText = 'AI Replied / Pending Close';
                }
                
                solutionText = `<div style="background: #F8F5F6; border-left: 3px solid var(--primary); padding: 15px 20px; border-radius: 0 8px 8px 0; margin-top: 15px; font-size: 14px; color: var(--text-main);">
                    <strong style="color: var(--primary); font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 5px;">🤖 Automated Solution</strong> 
                    ${ticket.solution}
                </div>`;
            }

            ticketList.innerHTML += `
                <div class="ticket-card glass-card">
                    <div class="ticket-header">
                        <h4>${ticket.title}</h4>
                        <div style="display:flex; align-items:center; gap:10px;">
                            <span class="badge ${ticket.status}">${badgeText}</span>
                            ${deleteButton}
                        </div>
                    </div>
                    <p class="ticket-desc">${ticket.description}</p>
                    ${solutionText}
                    <small class="ticket-date">Created: ${new Date(ticket.createdAt).toLocaleString()}</small>
                    ${solveButtons ? `<div class="ticket-actions">${solveButtons}</div>` : ''}
                </div>
            `;
        });
    } catch (err) {
        console.error('Error loading dashboard:', err);
    }
}

// 4. Handle Creating a New Ticket
document.getElementById('ticketForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('ticketTitle').value;
    const description = document.getElementById('ticketDesc').value;

    try {
        const res = await fetch('http://localhost:5000/api/tickets', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-auth-token': token 
            },
            body: JSON.stringify({ title, description })
        });

        if (res.status === 201) {
            alert('Ticket created successfully!');
            document.getElementById('ticketTitle').value = '';
            document.getElementById('ticketDesc').value = '';
            loadDashboard(); // Reload the list to show the new ticket
        } else {
            alert('Error creating ticket');
        }
    } catch (err) {
        console.error(err);
    }
});

// 5. Logout Functionality
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = 'login.html';
});

// Load the dashboard data as soon as the page opens
loadDashboard();

// 6. Admin / Agent: Update Ticket Status (In-Progress or Closed)
window.updateTicketStatus = async function(ticketId, newStatus) {
    if (!confirm(`Are you sure you want to mark this ticket as ${newStatus}?`)) return;
    
    try {
        const res = await fetch(`http://localhost:5000/api/tickets/${ticketId}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'x-auth-token': token 
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (res.ok) {
            alert(`Ticket marked as ${newStatus}!`);
            loadDashboard(); // Reload the dashboard
        } else {
            alert('Error updating ticket');
        }
    } catch (err) {
        console.error('Error:', err);
    }
};

// 7. Delete Ticket Function
window.deleteTicket = async function(ticketId) {
    if (!confirm("Are you sure you want to permanently delete this closed ticket?")) return;
    
    try {
        const res = await fetch(`http://localhost:5000/api/tickets/${ticketId}`, {
            method: 'DELETE',
            headers: { 
                'x-auth-token': token 
            }
        });

        if (res.ok) {
            loadDashboard(); // Auto refresh after deletion
        } else {
            alert('Error deleting ticket');
        }
    } catch (err) {
        console.error('Error:', err);
    }
};

// 8. Magic Auto-Refresh! Every 2 seconds fetch data again to show Kafka Bot updates in Real-time!
setInterval(loadDashboard, 2000);

// 8. Navigation & Navigation Views
document.querySelectorAll('.nav-item').forEach(nav => {
    nav.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active class from all
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        // Add active to clicked
        e.currentTarget.classList.add('active');

        const navText = e.currentTarget.innerText.trim();
        window.currentView = navText; // globally track for auto-refresh
        
        const settingsSection = document.getElementById('settingsSection');
        const formSection = document.getElementById('createTicketSection');
        const ticketList = document.getElementById('ticketList');

        if (navText === 'Dashboard') {
            document.querySelector('.top-bar h2').innerText = 'Dashboard Overview';
            document.querySelector('.top-bar p').innerText = 'Welcome to TicketBloom! Track and manage all your tasks.';
            if (userRole === 'customer') formSection.style.display = 'block';
            ticketList.style.display = 'flex';
            document.querySelector('.stats').style.display = 'grid'; // Show stats
            if(settingsSection) settingsSection.style.display = 'none';
            loadDashboard(); // instantly fetch and render partial list
        } else if (navText === 'All Tickets') {
            document.querySelector('.top-bar h2').innerText = 'History & All Tickets';
            document.querySelector('.top-bar p').innerText = 'A complete track record of all tickets raised in the past.';
            formSection.style.display = 'none';
            document.querySelector('.stats').style.display = 'grid'; // Show stats
            ticketList.style.display = 'grid'; // Enable CSS grid rendering
            if(settingsSection) settingsSection.style.display = 'none';
            loadDashboard(); // instantly fetch and render full list
        } else if (navText === 'Settings') {
            document.querySelector('.top-bar h2').innerText = 'Customer Profile';
            document.querySelector('.top-bar p').innerText = 'Manage your personal account details.';
            formSection.style.display = 'none';
            ticketList.style.display = 'none';
            document.querySelector('.stats').style.display = 'none'; // Hide stats as requested
            if(!settingsSection) renderSettings();
            else settingsSection.style.display = 'block';
        }
    });
});

function renderSettings() {
    const layout = document.querySelector('.dashboard-layout');
    
    // Decode JWT payload to get user info if we don't have an API route right now
    let userEmail = localStorage.getItem('email') || 'customer@example.com';
    let userName = localStorage.getItem('name') || 'Arpita'; // Added fallback to Arpita here
    
    // Decoding token to get user info if needed
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
    } catch(e){}

    layout.innerHTML += `
        <div class="glass-card" id="settingsSection" style="padding: 40px; grid-column: span 2; display: flex; flex-direction: column; align-items: center; text-align: center;">
            
            <!-- Aesthetic Profile Picture matching the Pinterest reference -->
            <div style="position: relative; width: 150px; height: 150px; margin-bottom: 20px;">
                <div style="width: 100%; height: 100%; border-radius: 50%; background: #FDE8F1; box-shadow: var(--shadow);"></div>
                <div style="position: absolute; top: -5px; right: 0px; font-size: 50px; filter: drop-shadow(2px 4px 6px rgba(255,102,153,0.2));">🌺</div>
            </div>

            <h3 style="margin: 0; font-size: 28px; color: var(--text-dark);">${userName}</h3>
            <p style="margin: 5px 0 25px 0; color: var(--primary); font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">${userRole}</p>
            
            <div style="width: 100%; max-width: 500px; background: rgba(255,255,255,0.6); border-radius: 15px; padding: 25px; text-align: left; box-shadow: 0 4px 15px rgba(0,0,0,0.02);">
                <div style="display: flex; justify-content: space-between; margin-bottom: 18px; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 12px;">
                    <span style="color: var(--text-muted); font-weight: 500;">Email Details</span>
                    <span style="color: var(--text-dark); font-weight: 600;">${userEmail}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 18px; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 12px;">
                    <span style="color: var(--text-muted); font-weight: 500;">Age</span>
                    <span style="color: var(--text-dark); font-weight: 600;">22</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 18px; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 12px;">
                    <span style="color: var(--text-muted); font-weight: 500;">Gender</span>
                    <span style="color: var(--text-dark); font-weight: 600;">Female</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--text-muted); font-weight: 500;">Status</span>
                    <span style="color: #1DD1A1; font-weight: 600; display:flex; align-items:center; gap:6px;">
                        <span style="width:8px; height:8px; background:#1DD1A1; border-radius:50%; display:inline-block; box-shadow: 0 0 8px rgba(29, 209, 161, 0.6);"></span> Active Account
                    </span>
                </div>
            </div>
            
            <button class="btn-submit" style="width: 250px; margin-top: 35px;" onclick="alert('Profile modifications are saved!')">Edit Profile</button>
        </div>
    `;
}