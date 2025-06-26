import { checkTokenValidity } from '/scripts/global.js';
import { removeToken } from '/scripts/global.js';
import { adminMenu } from '/scripts/global.js';

const API_URL = 'https://localhost:7160/api/Ticket';
let rawData = [];
let gridInstance = null;

document.addEventListener('DOMContentLoaded', async() => {
    await adminMenu();
    
    const tokenValidation = await checkTokenValidity();

    if (tokenValidation.isValid === false) {
        Swal.fire({
            title: 'Session expired',
            text: tokenValidation.message,
            icon: 'warning',
            confirmButtonText: 'Login Again',
            confirmButtonColor: "#0575e6"
        }).then(() => {
            removeToken();
        });
    }
    
    await populateSelectOptions('filterStatus', 'Status');
    await populateSelectOptions('filterPriority', 'Priority');
    await populateSelectOptions('filterAssignee', 'Users');
    await populateSelectOptions('filterRequester', 'Users');
    await createTable();
    
    document.getElementById('btnApplyFilter').addEventListener('click', applyFilters);
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

const createTable = async() => {
    const tableContainer = document.getElementById('table_container');
    tableContainer.innerHTML = '';

    rawData = await apiRequest(API_URL);

    const gridData = rawData.map(ticket => {
        return [
            ticket.ticket_subject,
            ticket.ticket_priority_name,
            ticket.ticket_status_name,
            ticket.ticket_agent_name,
            ticket.ticket_user_name,
            new Date(ticket.ticket_created_at).toLocaleDateString(),
            ticket.ticket_id
        ];
    });

    gridInstance = new gridjs.Grid({
        columns: [
            "Subject", 
            {
                name: "Priority",
                formatter: (cell) => {
                const style = `
                    background-color: ${
                        cell === 'High' ? '#e74c3c' : 
                        cell === 'Medium' ? '#f39c12' :
                        cell === 'Low' ? '#2ed077' : '#ff0000'
                    };
                    color: white;
                    padding: 4px 8px;
                    border-radius: 4px;
                    display: inline-block;
                    font-size: 0.85rem;
                `;
                return gridjs.h('div', { style }, cell);
                }
            },
            "Status", 
            "Assignee", 
            "Created By", 
            "Date Created", 
            {
            name: "Actions",
                formatter: (_, row) => {
                    const id = row.cells[6].data;
                    return gridjs.h('button', {
                    className: 'view-btn',
                    onClick: () => handleView(id)
                    }, 'VIEW');
                }
            }
        ],
        data: gridData,
        pagination: {
            limit: 10
        },
        sort: true,
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
    window.location.href = `tickets_details.html?id=${id}`;
};

const populateSelectOptions = async (selectId, entity) => {
    try {
        const selectElement = document.getElementById(selectId);
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'All';
        selectElement.appendChild(defaultOption);
        
        const data = await apiRequest(`https://localhost:7160/api/${entity}`, 'GET', null);
        
        if (!data || !Array.isArray(data)) {
            throw new Error(`Invalid data for ${entity}`);
        }

        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item.name || item.email || item.username || item.subject;
            option.textContent = item.name || item.email || item.username || item.subject;
            selectElement.appendChild(option);
        });

    } catch (error) {
        console.error(`Error populating ${selectId}:`, error);
    }
};

const applyFilters = () => {
    const priority = document.getElementById('filterPriority').value;
    const status = document.getElementById('filterStatus').value;
    const assignee = document.getElementById('filterAssignee').value;
    const requester = document.getElementById('filterRequester').value;
    const search = document.getElementById('filterSearch').value.toLowerCase();
    const dateFrom = document.getElementById('filterDateFrom').value;
    const dateTo = document.getElementById('filterDateTo').value;

    const filtered = rawData.filter(ticket => {
        const matchPriority = priority ? ticket.ticket_priority_name === priority : true;
        const matchStatus = status ? ticket.ticket_status_name === status : true;
        const matchAssignee = assignee ? ticket.ticket_agent_name === assignee : true;
        const matchRequester = requester ? ticket.ticket_user_name === requester : true;

        const ticketDate = new Date(ticket.ticket_created_at);
        const matchDateFrom = dateFrom ? ticketDate >= new Date(dateFrom + 'T00:00:00') : true;
        const matchDateTo = dateTo ? ticketDate <= new Date(dateTo + 'T23:59:59') : true;

        const matchSearch = search ? (
            ticket.ticket_subject.toLowerCase().includes(search)
        ) : true;

        return matchPriority && matchStatus && matchAssignee && matchRequester && matchDateFrom && matchDateTo && matchSearch;
    });

    const filteredGridData = filtered.map(ticket => {
        return [
            ticket.ticket_subject,
            ticket.ticket_priority_name,
            ticket.ticket_status_name,
            ticket.ticket_agent_name,
            ticket.ticket_user_name,
            new Date(ticket.ticket_created_at).toLocaleDateString(),
            ticket.ticket_id
        ];
    });

    gridInstance.updateConfig({
        data: filteredGridData
    }).forceRender();
};