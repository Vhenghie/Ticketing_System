import { adminMenu, checkTokenValidity, forceLogout, startTokenChecker } from '/scripts/global.js';
 
const API_URL = 'https://my-ticketing-system.tryasp.net/api/Users/';
let id = 0;

document.addEventListener('DOMContentLoaded', async() => {
    await adminMenu();
    const tokenCheck = await checkTokenValidity();
    if (!tokenCheck.isValid) return forceLogout();
    
    startTokenChecker();

    const urlParams = new URLSearchParams(window.location.search);
    id = urlParams.get('id');
    if (!id) {
        Swal.fire({
            icon: "error",
            title: "Invalid User ID"
        });
    }
    await populateSelectOptions('user_role', 'Role');
    await populateSelectOptions('user_department', 'Department');   
    await fetchUserDetails(id);

    document.getElementById('btnUpdateUser').addEventListener('click', updateUser);
    document.getElementById('btnUpdatePassword').addEventListener('click', updatePassword);

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

const fetchUserDetails = async (userId) => {
    try {
        const userDetails = await apiRequest(`${API_URL}${userId}`, 'GET', null);
        if (!userDetails) {
            Toastify({
                text: "User not found",
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
            document.getElementById('user_name').value = userDetails.name;
            document.getElementById('user_email').value = userDetails.email;
            document.getElementById('user_role').value = userDetails.role_id;
            document.getElementById('user_department').value = userDetails.department_id;
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
        const data = await apiRequest(`https://my-ticketing-system.tryasp.net/api/${entity}`, 'GET', null);
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


const updateUser = async () => {
    try{
        const name = document.getElementById('user_name').value;
        const email = document.getElementById('user_email').value;
        const role = document.getElementById('user_role').value;
        const department = document.getElementById('user_department').value;

        const userDetails = {
            name: name,
            email: email,
            role_id: role,
            department_id: department
        }
        const res = apiRequest(`${API_URL}${parseInt(id)}`, 'PATCH', userDetails);
        if (res)
            Toastify({
            text: "User Updated Successfully",
            duration: 2000,
            gravity: "top",
            position: "right",
            style: {
                background: "linear-gradient(to right,rgb(93, 244, 51),rgb(17, 116, 15))",
                color: "#fff",
            },
            }).showToast();
        
        fetchUserDetails(id);

    }catch(err){
        Swal.fire({
            icon: "error",
            title: `Error updating user: ${err.message}`,
            confirmButtonText: 'OK',
            confirmButtonColor: "#0575e6"
        });
    }
}

const updatePassword = async () => {
    try{
        const currentpassword = document.getElementById('user_cur_password').value;
        const password = document.getElementById('user_password').value;
        const confirmpassword = document.getElementById('user_confirm_password').value;

        
        const isPasswordValid = await apiRequest(`https://my-ticketing-system.tryasp.net/api/Authentication/verifyPassword/${localStorage.getItem("userID")}/${currentpassword}`, 'GET', null);

        if(isPasswordValid.isPasswordValid === false){
            Swal.fire({
                icon: "error",
                title: `Current password is incorrect`,
                confirmButtonText: 'OK',
                confirmButtonColor: "#0575e6"
            });
            return;
        }

        if(password !== confirmpassword){
            Swal.fire({
                icon: "error",
                title: `Passwords do not match`,
                confirmButtonText: 'OK',
                confirmButtonColor: "#0575e6"
            });
            return;
        }

        const passData = {
            password: password
        }

        const res = await apiRequest(`https://my-ticketing-system.tryasp.net/api/Authentication/updatePassword/${id}`, 'PATCH', passData);

        if (res)
            Toastify({
                text: "User Password Updated Successfully",
                duration: 2000,
                gravity: "top",
                position: "right",
                style: {
                    background: "linear-gradient(to right,rgb(93, 244, 51),rgb(17, 116, 15))",
                    color: "#fff",
                },
            }).showToast();

    }catch(err){
        Swal.fire({
            icon: "error",
            title: `Error updating password: ${err.message}`,
            confirmButtonText: 'OK',
            confirmButtonColor: "#0575e6"
        });
    }
}