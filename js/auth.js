document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Impede a página de recarregar

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const button = document.querySelector('.btn-login');

    button.innerText = "Autenticando...";
    button.style.opacity = "0.7";
    button.disabled = true;

    // Simulando uma requisição de API (Back-end)
    setTimeout(() => {
        if(email === "adm@fahz.com.br" && senha === "123456") {
            window.location.href = "cadastro.html";
        } else {
            alert("Usuário ou senha inválidos. Tente novamente.");
            button.innerText = "Entrar";
            button.style.opacity = "1";
            button.disabled = false;
        }
    }, 1500);
});