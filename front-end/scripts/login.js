const baseURL = 'https://ticketing-system.runasp.net/api/';
let isValidForm = false;

document.addEventListener('DOMContentLoaded', function(e){
    e.preventDefault();
    document.getElementById('btnLogin').addEventListener('click', fnLogin);
});

const fnLogin = () => {
    fetch(`${baseURL}Authentication/login`, {
        method: 'POST',
        mode: 'cors', 
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            email: document.getElementById('inputEmail').value,
            password: document.getElementById('inputPassword').value
        })
    })
    .then(async res => {
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Login failed');
        }
        return res.json();
    })
    .then(data => {
        localStorage.setItem('jwtToken', data.token);
        localStorage.setItem('userID', data.user_id);
        localStorage.setItem('userType', data.user_type);
        window.location.href = 'dashboard.html';
    })
    .catch(err => {
        Toastify({
            text: `Error: ${err.message}`,
            duration: 2000,
            gravity: "top",
            position: "right",
            style: {
                background: "linear-gradient(to right,rgb(255, 57, 57),rgb(223, 65, 34))",
                color: "#fff",
            },
        }).showToast();
    });
};