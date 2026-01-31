// --- FUNÇÕES DE MÁSCARA (Ajustadas para não travarem a validação) ---
const mascaraCPF = (value) => {
    return value
        .replace(/\D/g, '') 
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
};

const mascaraRG = (value) => {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{1})\d+?$/, '$1');
};

// --- LÓGICA DE NAVEGAÇÃO ---
function nextStep(step) {
    // Salva o que foi preenchido até agora
    saveToStorage();

    document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    
    document.getElementById(`step${step}`).classList.add('active');
    document.getElementById(`step${step}-header`).classList.add('active');
    
    window.scrollTo(0, 0);
    validateCurrentStep(); // Valida ao entrar na nova etapa
}

function prevStep(step) {
    nextStep(step);
}

// --- VALIDAÇÃO INTELIGENTE ---
function validateCurrentStep() {
    const activeStep = document.querySelector('.form-step.active');
    if (!activeStep) return;

    const nextBtn = activeStep.querySelector('.btn-next');
    const finishBtn = activeStep.querySelector('.btn-finish');
    
    const requiredInputs = [...activeStep.querySelectorAll('.req')];
    
    const allFilled = requiredInputs.every(input => {
        let isFieldValid = false;

        if (input.tagName === 'SELECT') {
            isFieldValid = input.value !== "";
        } else if (input.id.includes('cpf')) {
            isFieldValid = input.value.length === 14;
        } else if (input.id.includes('rg')) {
            isFieldValid = input.value.length >= 10; // Ajustado para a máscara 00.000.000-0
        } else {
            isFieldValid = input.value.trim().length >= 3;
        }

        // LOG DE DEBUG: Se o botão não libera, veja no console (F12) qual campo é o culpado
        if (!isFieldValid) {
            console.log("Campo inválido detectado:", input.id || input.placeholder);
        }

        return isFieldValid;
    });

    if (nextBtn) {
        nextBtn.disabled = !allFilled;
        // Estilo visual para o botão desabilitado
        nextBtn.style.opacity = allFilled ? "1" : "0.5";
        nextBtn.style.cursor = allFilled ? "pointer" : "not-allowed";
    }

    if (finishBtn) {
        const requiredFiles = [...activeStep.querySelectorAll('.req-file')];
        const allFilesUploaded = requiredFiles.every(f => f.files.length > 0);
        finishBtn.disabled = !(allFilled && allFilesUploaded);
    }
}
// --- ARMAZENAMENTO (LocalStorage) ---
function saveToStorage() {
    const formData = {};
    document.querySelectorAll('.req').forEach(input => {
        formData[input.id || input.placeholder] = input.value;
    });
    localStorage.setItem('sgas_draft', JSON.stringify(formData));
}

// --- EVENT LISTENERS (Ouvintes) ---

// Escuta inputs de texto e aplica máscaras
document.querySelectorAll('.req').forEach(input => {
    input.addEventListener('input', (e) => {
        if (e.target.id.includes('cpf')) e.target.value = mascaraCPF(e.target.value);
        if (e.target.id.includes('rg')) e.target.value = mascaraRG(e.target.value);
        
        validateCurrentStep();
    });

    // Escuta mudanças em Selects (Vínculo e Série)
    if (input.tagName === 'SELECT') {
        input.addEventListener('change', validateCurrentStep);
    }
});

// Validação de Arquivos
document.querySelectorAll('.req-file').forEach(fileInput => {
    fileInput.addEventListener('change', (e) => {
        const label = document.querySelector(`label[for="${e.target.id}"]`);
        if(e.target.files.length > 0) {
            label.innerText = "✅ " + e.target.files[0].name.substring(0, 15) + "...";
            label.style.background = "#d4edda";
            label.style.color = "#155724";
            label.style.border = "1px solid #c3e6cb";
        }
        validateCurrentStep();
    });
});

// Finalizar Formuário
document.getElementById('multiStepForm').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Análise enviada com sucesso para a Fundação!');
    localStorage.removeItem('sgas_draft'); // Limpa o rascunho
    window.location.href = "Login.html";
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    validateCurrentStep();
});