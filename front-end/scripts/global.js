const baseURL = 'https://ticketing-system.runasp.net/api/';

document.addEventListener('DOMContentLoaded', function(e){
    e.preventDefault();
});

export const removeToken = async() => {
    localStorage.removeItem('jwtToken');    
    localStorage.removeItem('userID');
    localStorage.removeItem('userType');
    window.location.href = 'login.html';
}

export const adminMenu = () => {
    try{
        const user_type = localStorage.getItem('userType');
        if(user_type !== 'Admin') {
            document.querySelector('.admin_menu').style.display = 'none';
        }else{
            document.querySelector('.admin_menu').style.display = 'flex';
        }
    }catch(err) {
        console.error('Error verifying token:', err);
    }
}

export const checkTokenValidity = async () => {
    try {
        const token = localStorage.getItem('jwtToken');
        if (!token) {
            return { isValid: false, message: 'No token found' };
        }

        const response = await fetch(`${baseURL}Authentication/verifyToken`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return {
                isValid: false,
                message: errorData.message || 'Token verification failed'
            };
        }

        const data = await response.json();
        return data;

    } catch (err) {
        console.error('Error verifying token:', err);
        return { isValid: false, message: 'Network error during token verification' };
    }
}
