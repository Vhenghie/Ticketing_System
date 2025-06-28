import { adminMenu, checkTokenValidity, forceLogout, startTokenChecker } from '/scripts/global.js';
 
const API_URL = 'https://my-ticketing-system.tryasp.net/api/Ticket';
const USER_ID = localStorage.getItem('userID');

document.addEventListener('DOMContentLoaded', async() => {
    await adminMenu();
    const tokenCheck = await checkTokenValidity();
    if (!tokenCheck.isValid) return forceLogout();
    
    startTokenChecker();
    
    await populateSelectOptions('ticket_assignee', 'Users');
    await removeOptionByValue('ticket_assignee', USER_ID);

    await populateSelectOptions('ticket_priority', 'Priority');
    await populateSelectOptions('ticket_status', 'Status');
    document.getElementById('btnAddTicket').addEventListener('click', createTicket);
    document.querySelector('.logoutLink').addEventListener('click', logoutAcc);
});

const logoutAcc = () => {
    Swal.fire({
        title: `Are you sure to log out?`,
        showCancelButton: true,
        confirmButtonText: "Save",
        confirmButtonColor: "#0575e6"
    }).then((result) => {
        if (result.isConfirmed) {
            removeToken();
        }
    });
}

const removeOptionByValue = async(selectId, valueToRemove) => {
  const select = document.getElementById(selectId);
  const options = Array.from(select.options);
  
  options.forEach(option => {
    if (option.value === valueToRemove) {
      select.removeChild(option);
    }
  });
}

const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}`);
    }
    return response.json();
};

const apiRequest = async (url, method, data) => {
    const config = {
        method,
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}` 
        }
    };
    if (data) config.body = JSON.stringify(data);

    const response = await fetch(url, config);
    return handleResponse(response);
};

const populateSelectOptions = async (selectId, entity) => {
    try {
        const selectElement = document.getElementById(selectId);
        const data = await apiRequest(`https://my-ticketing-system.tryasp.net/api/${entity}`, 'GET', null);
        
        if (!data || !Array.isArray(data)) {
            throw new Error(`Invalid data for ${entity}`);
        }

        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.name || item.email || item.username || item.subject;
            selectElement.appendChild(option);
        });

    } catch (error) {
        console.error(`Error populating ${selectId}:`, error);
    }
};

const createTicket = async (event) => {
    event.preventDefault();
    const data = {
        subject: document.getElementById('ticket_subject').value,
        status_id: parseInt(document.getElementById('ticket_status').value),
        priority_id: parseInt(document.getElementById('ticket_priority').value),
        agent_id: parseInt(document.getElementById('ticket_assignee').value),
        user_id: USER_ID,
        description: document.getElementById('ticketDescription').value
    };
    try {
        await apiRequest(API_URL, 'POST', data);
        Toastify({
            text: "Ticket created successfully!",
            duration: 2000,
            gravity: "top",
            position: "right",
            style: {
                background: "linear-gradient(to right, #00b09b, #96c93d)",
                color: "#fff",
            },
        }).showToast();
    } catch (error) {
        Toastify({
            text: "Error creating ticket: " + error.message,
            duration: 2000,
            gravity: "top",
            position: "right",
            style: {
                background: "linear-gradient(to right, rgb(255, 57, 57), rgb(223, 65, 34))",
                color: "#fff",
            },
        }).showToast();
    }
}