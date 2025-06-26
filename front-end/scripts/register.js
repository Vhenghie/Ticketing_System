const baseURL = 'https://localhost:7160/api/';
let isValidForm = false;

document.addEventListener('DOMContentLoaded', function(e){
    const emailInput = document.getElementById('inputEmail');
    const passwordInput = document.getElementById('inputPassword');
    const confirmPasswordInput = document.getElementById('inputConfirmPassword');

    emailInput.addEventListener('input', () => {
        setTimeout(() => {
            if(emailInput.value.trim() == ''){
                emailInput.classList.remove("invalidData");
                emailInput.classList.remove("validData");
                isValidForm = false;
            }
            else if (isValidEmail(emailInput.value.trim())) {
                emailInput.classList.add("validData");
                emailInput.classList.remove("invalidData");
                isValidForm = true;
            } else {
                emailInput.classList.add("invalidData");
                emailInput.classList.remove("validData");
                isValidForm = false;
            }
        }, 500);
    });

    confirmPasswordInput.addEventListener('input', () => {
        setTimeout(() => {
            if(passwordInput.value == '' || confirmPasswordInput.value == ''){
                passwordInput.classList.remove("invalidData");
                passwordInput.classList.remove("validData");
                confirmPasswordInput.classList.remove("invalidData");
                confirmPasswordInput.classList.remove("validData");
                isValidForm = false;
            }
            else if (passwordInput.value == confirmPasswordInput.value) {
                passwordInput.classList.add("validData");
                passwordInput.classList.remove("invalidData");
                confirmPasswordInput.classList.add("validData");
                confirmPasswordInput.classList.remove("invalidData");
                isValidForm = true;
            } else {
                passwordInput.classList.add("invalidData");
                passwordInput.classList.remove("validData");
                confirmPasswordInput.classList.add("invalidData");
                confirmPasswordInput.classList.remove("validData");
                isValidForm = false;
            }
        }, 500);
    });

    document.getElementById('btnSignUp').addEventListener('click', fnRegister);
});

const fnRegister = () => {
    if(!isValidForm){
        Toastify({
                    text: `Invalid email/password.`,
                    duration: 2000,
                    gravity: "top",
                    position: "right",
                    style: {
                        background: "linear-gradient(to right,rgb(255, 57, 57),rgb(223, 65, 34))",
                        color: "#fff",
                    },
                }).showToast();
    }else{
        fetch(`${baseURL}Users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: document.getElementById('inputEmail').value,
                email: document.getElementById('inputEmail').value,
                password: document.getElementById('inputConfirmPassword').value
            })
        })
        .then(res => res.json())
        .then(data => {
            Toastify({
                text: `Successfully Created Account.`,
                duration: 2000,
                gravity: "top",
                position: "center",
                style: {
                    background: "linear-gradient(to right,rgb(75, 153, 15),rgb(6, 255, 18))",
                    color: "#fff",
                },
            }).showToast();
            window.location.href = 'login.html';
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
    }
}

const isValidEmail = (email) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
}