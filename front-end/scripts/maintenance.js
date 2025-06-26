
import { checkTokenValidity } from '/scripts/global.js';
import { removeToken } from '/scripts/global.js';
import { adminMenu } from '/scripts/global.js';
 
const API_URL = 'https://localhost:7160/api/';
const MODAL = document.querySelector('.modal');
const MODAL_ID = document.getElementById('modalIDInput');
const MODAL_NAME = document.getElementById('modalNameInput');
let MODAL_METHOD = '';

const rawDataStore = {
    Priority: [],
    Status: [],
    Role: [],
    Department: []
};

const gridInstances = {
    Priority: null,
    Status: null,
    Role: null,
    Department: null
};

document.addEventListener('DOMContentLoaded', async () => {
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
            return;
        });
    }

    document.querySelector('.logoutLink').addEventListener('click', logoutAcc);
    createTables();

    document.getElementById('btnModalClose').addEventListener('click', () => {
        closeModal();
    });

    document.getElementById('addPriority').addEventListener('click', () => { maintenanceAddClicked('Priority'); });
    document.getElementById('addRole').addEventListener('click', () => { maintenanceAddClicked('Role'); });
    document.getElementById('addStatus').addEventListener('click', () => { maintenanceAddClicked('Status'); });
    document.getElementById('addDepartment').addEventListener('click', () => { maintenanceAddClicked('Department'); });

    document.getElementById('btnModalSubmit').addEventListener('click', async (e) => {
        e.preventDefault();
        modalSubmit();
    });
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

const createTables = async () => {
    await createTable('table_priority', 'Priority');
    await createTable('table_status', 'Status');
    await createTable('table_role', 'Role');
    await createTable('table_department', 'Department');
};

const createTable = async (table_div, table_entity) => {
    const tableContainer = document.getElementById(table_div);
    tableContainer.innerHTML = '';

    rawDataStore[table_entity] = await apiRequest(`${API_URL}${table_entity}`, 'GET', null);

    const gridData = rawDataStore[table_entity].map(item => {
        return [
            item.id,
            item.name,
            item.id
        ];
    });

    gridInstances[table_entity] = new gridjs.Grid({
        columns: [
            "ID",
            "Name",
            {
                name: "Actions",
                formatter: (_, row) => {
                    const id = row.cells[2].data;
                    const name = row.cells[1].data;
                    return gridjs.h('div', { style: 'display: flex; gap: 0.5rem;' }, [
                        gridjs.h('button', {
                            className: 'edit-btn cell-button',
                            onClick: () => handleEdit(id, name, table_entity)
                        }, 'Edit'),
                        gridjs.h('button', {
                            className: 'delete-btn cell-button',
                            onClick: () => handleDelete(id, name, table_entity)
                        }, 'Delete')
                    ]);
                }
            }
        ],
        data: gridData,
        pagination: {
            limit: 5
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
    });

    gridInstances[table_entity].render(tableContainer);
};

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

const closeModal = () => {
    MODAL_ID.value = '';
    MODAL_NAME.value = '';
    MODAL.classList.remove('active');
};

const handleEdit = (id, name, ent) => {
    MODAL_METHOD = 'PATCH';
    MODAL.classList.toggle('active');

    document.querySelector('.modal_id_wrapper').style.display = 'flex';
    document.getElementById('modalTitle').textContent = ent;

    MODAL_ID.disabled = true;
    MODAL_ID.value = id;
    MODAL_NAME.value = name;
};

const handleDelete = (id, name, ent) => {
    MODAL_METHOD = 'DELETE';
    Swal.fire({
        title: `Are you sure in deleting ${ent} ${name}?`,
        showCancelButton: true,
        confirmButtonText: "Save",
        confirmButtonColor: "#0575e6"
    }).then((result) => {
        if (result.isConfirmed) {
            apiRequest(`${API_URL}${ent}/${id}`, 'DELETE', null)
                .then(async () => {
                    rawDataStore[ent] = await apiRequest(`${API_URL}${ent}`, 'GET', null);
                    const gridData = rawDataStore[ent].map(item => [item.id, item.name, item.id]);

                    gridInstances[ent].updateConfig({ data: gridData }).forceRender();
                });
        } else {
            Toastify({
                text: "Deletion cancelled",
                duration: 2000,
                gravity: "top",
                position: "right",
                style: {
                    background: "linear-gradient(to right, #00b09b, #96c93d)",
                    color: "#fff",
                },
            }).showToast();
        }
    });
};

const maintenanceAddClicked = (entity) => {
    MODAL.classList.toggle('active');
    MODAL_METHOD = 'POST';
    document.querySelector('.modal_id_wrapper').style.display = 'none';
    document.getElementById('modalTitle').textContent = entity;
};

const modalSubmit = async () => {
    try {
        const id = MODAL_ID.value;
        const name = MODAL_NAME.value;
        const entity = document.getElementById('modalTitle').textContent;

        if (MODAL_METHOD === 'PATCH' || MODAL_METHOD === 'DELETE') {
            if (!id) return;
        }

        let dataObj = {
            id: MODAL_METHOD === 'POST' ? 0 : id,
            name: name
        };

        await apiRequest(`${API_URL}${entity}/${id}`, MODAL_METHOD, dataObj);

        // ✅ Reload only this table using updateConfig + forceRender
        rawDataStore[entity] = await apiRequest(`${API_URL}${entity}`, 'GET', null);
        const gridData = rawDataStore[entity].map(item => [item.id, item.name, item.id]);

        gridInstances[entity].updateConfig({ data: gridData }).forceRender();

        closeModal();

        Toastify({
            text: "Successfully submitted data",
            duration: 3000,
            gravity: "top",
            position: "right",
            style: {
                background: "linear-gradient(to right, #00b09b, #96c93d)",
                color: "#fff",
            },
        }).showToast();

    } catch (error) {
        console.error('Error submitting data:', error);
        alert(`Error: ${error.message}`);
    }

    MODAL_METHOD = '';
    MODAL_ID.value = '';
    MODAL_NAME.value = '';
};
