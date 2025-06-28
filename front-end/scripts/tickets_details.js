import { adminMenu, checkTokenValidity, forceLogout, startTokenChecker } from '/scripts/global.js';
 
const API_URL = 'https://ticketing-system.runasp.net/api/Ticket/';
let ticketID = '';

document.addEventListener('DOMContentLoaded', async() => {
    await adminMenu();
    const tokenCheck = await checkTokenValidity();
    if (!tokenCheck.isValid) return forceLogout();
    
    startTokenChecker();

    const urlParams = new URLSearchParams(window.location.search);
    ticketID= urlParams.get('id');
    if (!ticketID) {
        Swal.fire({
            icon: "error",
            title: "Invalid Ticket ID"
        });
    }
    await populateSelectOptions('ticket_status', 'Status');
    await populateSelectOptions('ticket_priority', 'Priority');   
    await populateSelectOptions('ticket_assignee', 'Users');
    await populateSelectOptions('ticket_requester', 'Users');
    await fetchTicketDetails(ticketID);

    document.getElementById('btnTicketSubmit').addEventListener('click', editTicket);
    document.getElementById('btnTicketDelete').addEventListener('click', deleteTicket);
    document.querySelector('.logoutLink').addEventListener('click', logoutAcc);
    document.getElementById('btnCommentSubmit').addEventListener('click', submitComment);

    await populateComments();
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

const fetchTicketDetails = async (ticketId) => {
    try {
        const ticketDetails = await apiRequest(`${API_URL}${ticketId}`, 'GET', null);
        if (!ticketDetails) {
            Toastify({
                text: "Ticket not found",
                duration: 2000,
                gravity: "top",
                position: "right",
                style: {
                    background: "linear-gradient(to right,rgb(255, 57, 57),rgb(223, 65, 34))",
                    color: "#fff",
                },
            }).showToast();
            return null;
        }else{          
            const dateObj = new Date(ticketDetails.created_at);
            const formattedDate = dateObj.toISOString().split('T')[0];

            document.getElementById('ticket_subject').value = ticketDetails.subject;
            document.getElementById('ticket_status').value = ticketDetails.status_id;
            document.getElementById('ticket_priority').value = ticketDetails.priority_id;
            document.getElementById('ticket_assignee').value = ticketDetails.agent_id;

            document.getElementById('ticket_date_created').value = formattedDate;
            document.getElementById('ticket_requester').value = ticketDetails.user_id;
            document.getElementById('ticket_description').value = ticketDetails.description;
        }
    } catch (error) {
        Toastify({
                text: "Error fetching ticket details: " + error.message,
                duration: 2000,
                gravity: "top",
                position: "right",
                style: {
                    background: "linear-gradient(to right,rgb(255, 57, 57),rgb(223, 65, 34))",
                    color: "#fff",
                },
            }).showToast();
        return null;
    }
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
    try{
        const selectElement = document.getElementById(selectId);
        const data = await apiRequest(`https://ticketing-system.runasp.net/api/${entity}`, 'GET', null);
        if (!data || data.length === 0) {
            selectElement.innerHTML = '<option value="">No options available</option>';
            return;
        }

        data.forEach(element => {
            const option = document.createElement('option');
            option.value = element.id;
            option.textContent = element.name;
            selectElement.appendChild(option);
        });

    }catch(err){
        Toastify({
            text: "Failed to populate select options: " + err.message,
            duration: 2000,
            gravity: "top",
            position: "right",
            style: {
                background: "linear-gradient(to right,rgb(242, 10, 10),rgb(155, 6, 6))",
                color: "#fff",
            },
            }).showToast();
    }
}

const editTicket = async (event) => {
    event.preventDefault();
    document.getElementById('ticket_subject').value;
    document.getElementById('ticket_status').value;
    document.getElementById('ticket_priority').value;
    document.getElementById('ticket_assignee').value;
    document.getElementById('ticket_requester').value;
    document.getElementById('ticket_description').value;

    const data = {
        subject: document.getElementById('ticket_subject').value,
        status_id: parseInt(document.getElementById('ticket_status').value),
        priority_id: parseInt(document.getElementById('ticket_priority').value),
        agent_id: parseInt(document.getElementById('ticket_assignee').value),
        user_id: parseInt(document.getElementById('ticket_requester').value),
        description: document.getElementById('ticket_description').value
    };

    await apiRequest(`${API_URL}${ticketID}`, 'PATCH', data);

    Toastify({
            text: "Ticket edited successfully!",
            duration: 2000,
            gravity: "top",
            position: "right",
            style: {
                background: "linear-gradient(to right, #00b09b, #96c93d)",
                color: "#fff",
            },
        }).showToast();
}

const deleteTicket = async (event) => {
    event.preventDefault();
    Swal.fire({
    title: `Are you sure you want to delete ticket?`,
    showCancelButton: true,
    confirmButtonText: "Save",
    confirmButtonColor: "#f10808"
    }).then(async(result) => {
        if (result.isConfirmed) {
            await apiRequest(`${API_URL}${ticketID}`, 'DELETE', null);
            Toastify({
                text: "Ticket deleted successfully!",
                duration: 2000,
                gravity: "top",
                position: "right",
                style: {
                    background: "linear-gradient(to right, #00b09b, #96c93d)",
                    color: "#fff",
                },
            }).showToast();
            window.location.href = 'my_tickets.html';
        } else if (result.isDenied) {
            Toastify({
                text: "Ticket deletion aborted!",
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
}

const populateComments = async () => {
    const data = await apiRequest(`https://ticketing-system.runasp.net/api/Comment/${ticketID}`, 'GET', null);

    const comments_wrapper = document.querySelector('.comments_cards_wrapper');
    comments_wrapper.innerHTML = ''; 

    data.forEach((comment) => {
        const comment_card = document.createElement('div');
        comment_card.className = 'comment_card';

        const comment_header = document.createElement('div');
        comment_header.className = 'comment_header';

        const comment_author = document.createElement('label');
        comment_author.className = 'comment_author';
        comment_author.textContent = comment.comment_user_name;

        const comment_date = document.createElement('label');
        comment_date.className = 'comment_date';
        comment_date.textContent = new Date(comment.comment_created_at).toLocaleDateString();

        const comment_body = document.createElement('div');
        comment_body.className = 'comment_body';

        const comment_txt = document.createElement('p');
        comment_txt.className = 'comment_text';
        comment_txt.textContent = comment.comment_content;

        comment_header.appendChild(comment_author);
        comment_header.appendChild(comment_date);
        comment_body.appendChild(comment_txt);
        comment_card.appendChild(comment_header);
        comment_card.appendChild(comment_body);
        comments_wrapper.appendChild(comment_card);
    });
}

const submitComment = async() => {
    const commentInput = document.getElementById('inputComment');
    const userId = localStorage.getItem('userID');
    const commentObj = {
        ticket_id: parseInt(ticketID),
        user_id: parseInt(userId),
        content: document.getElementById('inputComment').value
    };

    try
    {
        await apiRequest('https://ticketing-system.runasp.net/api/Comment', 'POST', commentObj);
        commentInput.value = '';
        Toastify({
                text: "Comment added successfully",
                duration: 2000,
                gravity: "top",
                position: "right",
                style: {
                    background: "linear-gradient(to right,rgb(90, 220, 14), rgb(39, 146, 0)",
                    color: "#fff",
                },
        }).showToast();
        populateComments();
    }
    catch(err)
    {
        Toastify({
                text: "Error adding comment: " + err.message,
                duration: 2000,
                gravity: "top",
                position: "right",
                style: {
                    background: "linear-gradient(to right,rgb(255, 57, 57),rgb(223, 65, 34))",
                    color: "#fff",
                },
            }).showToast();
    }

}