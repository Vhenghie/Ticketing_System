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
    const token = localStorage.getItem('jwtToken');
    if (!token) return { isValid: false, code: "NO_TOKEN" };

    try {
        const validationRes = await fetch(`${baseURL}Authentication/verifyToken`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (validationRes.ok) {
            return await validationRes.json();
        }

        const errorData = await validationRes.json();
        if (errorData.code === "EXPIRED_TOKEN") {
            return await attemptTokenRefresh(token);
        }

        return { isValid: false, ...errorData };
    } catch (err) {
        return { isValid: false, code: "NETWORK_ERROR" };
    }
};

const attemptTokenRefresh = async (oldToken) => {
    try {
        const refreshRes = await fetch(`${baseURL}Authentication/refreshToken`, {
            method: "POST",
            headers: { 'Authorization': `Bearer ${oldToken}` }
        });

        if (refreshRes.ok) {
            const { token: newToken } = await refreshRes.json();
            localStorage.setItem('jwtToken', newToken);
            return { isValid: true, token: newToken };
        } else {
            return { isValid: false, code: "REFRESH_FAILED" };
        }
    } catch (error) {
        return { isValid: false, code: "REFRESH_NETWORK_ERROR" };
    }
};

export const forceLogout = (message = "Session expired", showAlert = true) => {
    localStorage.removeItem('jwtToken');

    if (showAlert) {
        Swal.fire({
            title: 'Session Ended',
            text: message,
            icon: 'warning'
        }).then(() => window.location.href = 'login.html');
    } else {
        window.location.href = 'login.html';
    }
};

export const startTokenChecker = () => {
    setInterval(async () => {
        const { isValid, code } = await checkTokenValidity();
        if (!isValid) {
            forceLogout(
                code === "REFRESH_FAILED" ? 
                    "Session expired (could not renew)" : 
                    "You've been logged out",
                code !== "REFRESH_NETWORK_ERROR"
            );
        }
    }, 300000);
};