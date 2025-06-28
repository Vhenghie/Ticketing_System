import { adminMenu, checkTokenValidity, forceLogout, startTokenChecker } from '/scripts/global.js';
 
const API_URL = 'https://my-ticketing-system.tryasp.net/api/Users';
let rawData = [];

document.addEventListener('DOMContentLoaded', async() => {
    await adminMenu();
    const tokenCheck = await checkTokenValidity();
    if (!tokenCheck.isValid) return forceLogout();
    
    startTokenChecker();
     
    document.querySelector('.logoutLink').addEventListener('click', logoutAcc);
    createTable();
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

const createTable = async() => {
    const tableContainer = document.getElementById('table_container');
    tableContainer.innerHTML = '';

    rawData = await apiRequest(API_URL);

    const gridData = rawData.map(ticket => {
        return [
            ticket.id,
            ticket.name,
            ticket.email,
            ticket.role,
            ticket.department,
            new Date(ticket.ticket_created_at).toLocaleDateString(),
            ticket.ticket_id
        ];
    });

    new gridjs.Grid({
        columns: [
            "ID", 
            "Name", 
            "Email", 
            "Role", 
            "Department",
            {
                name: "Actions",
                formatter: (_, row) => {
                    const id = row.cells[0].data;
                    return gridjs.h('div', { style: 'display: flex; gap: 0.5rem;' }, [
                        gridjs.h('button', {
                            className: 'view-btn cell-button',
                            onClick: () => handleView(id)
                        }, 'View')
                    ]);
                }
            }
        ],
        data: gridData,
        pagination: {
            limit: 10
        },
        search: true,
        className: {
            td: 'grid-cell',
            th: 'grid-header'
        },
        style: {
            th: {
                textAlign: 'left'
            }
        }
    }).render(tableContainer);
}

const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}`);
    }
    return response.json();
};

const apiRequest = async (url, method = 'GET', data = null) => {
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

const handleView = (id) => {
    window.location.href = `users_details.html?id=${id}`;
};