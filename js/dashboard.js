// --- CONFIGURAÇÕES GERAIS ---
let familiarCount = 0;

// --- FUNÇÕES DE MÁSCARA ---
const mascaraCPF = (v) => v.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');
const mascaraRG = (v) => v.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{1})\d+?$/, '$1');

// --- GESTÃO DE MEMBROS DA FAMÍLIA ---
function adicionarFamiliar() {
    familiarCount++;
    const container = document.getElementById('lista-familiares');
    const div = document.createElement('div');
    div.className = 'familiar-item';
    div.id = `familiar-${familiarCount}`;
    div.style = "background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 10px; position: relative; border: 1px solid #ddd;";
    
    div.innerHTML = `
        <div class="grid-form" style="margin: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="input-group">
                <label>Nome do Familiar</label>
                <input type="text" class="req" placeholder="Nome completo" required>
            </div>
            <div class="input-group">
                <label>CPF</label>
                <input type="text" class="req cpf-mask-dyn" placeholder="000.000.000-00" maxlength="14" required>
            </div>
        </div>
        <button type="button" onclick="removerFamiliar(${familiarCount})" style="color: #dc3545; background: none; border: none; font-size: 0.75rem; cursor: pointer; padding-top: 10px;">
            ✖ Remover Membro
        </button>
    `;
    
    container.appendChild(div);

    // Adiciona ouvintes de evento para os novos campos
    div.querySelector('.cpf-mask-dyn').addEventListener('input', (e) => {
        e.target.value = mascaraCPF(e.target.value);
        validateCurrentStep();
    });

    div.querySelectorAll('.req').forEach(input => input.addEventListener('input', validateCurrentStep));
    validateCurrentStep();
}

function removerFamiliar(id) {
    const el = document.getElementById(`familiar-${id}`);
    if (el) el.remove();
    validateCurrentStep();
}

// --- LÓGICA DE CONDICIONAIS DE ARQUIVO ---
function toggleRequiredFiles() {
    const vinculo = document.getElementById('vinculo_aluno').value;
    const cardViuvo = document.getElementById('cardViuvo');
    const inputObito = document.getElementById('fileObito');

    if (vinculo === 'viuvo') {
        cardViuvo.style.display = 'block';
        inputObito.classList.add('req-file');
    } else {
        cardViuvo.style.display = 'none';
        inputObito.classList.remove('req-file');
    }
    validateCurrentStep();
}

// --- NAVEGAÇÃO ENTRE PASSOS ---
function nextStep(step) {
    saveToStorage();
    document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    
    document.getElementById(`step${step}`).classList.add('active');
    document.getElementById(`step${step}-header`).classList.add('active');
    
    window.scrollTo(0, 0);
    validateCurrentStep();
}

function prevStep(step) { nextStep(step); }

// --- VALIDAÇÃO INTELIGENTE ---
function validateCurrentStep() {
    const activeStep = document.querySelector('.form-step.active');
    if (!activeStep) return;

    const nextBtn = activeStep.querySelector('.btn-next');
    const finishBtn = activeStep.querySelector('.btn-finish');
    
    const requiredInputs = [...activeStep.querySelectorAll('.req')];
    
    const allFilled = requiredInputs.every(input => {
        if (input.type === 'checkbox') return input.checked;
        if (input.tagName === 'SELECT') return input.value !== "";
        if (input.id.includes('cpf') || input.classList.contains('cpf-mask-dyn')) return input.value.length === 14;
        return input.value.trim().length >= 3;
    });

    if (nextBtn) {
        nextBtn.disabled = !allFilled;
        nextBtn.style.opacity = allFilled ? "1" : "0.5";
    }

    if (finishBtn) {
        const requiredFiles = [...activeStep.querySelectorAll('.req-file')];
        const allFilesUploaded = requiredFiles.every(f => f.files.length > 0);
        finishBtn.disabled = !(allFilled && allFilesUploaded);
    }
}

// --- ARMAZENAMENTO ---
function saveToStorage() {
    const formData = {};
    document.querySelectorAll('.req').forEach(input => {
        if (input.id) formData[input.id] = input.value;
    });
    localStorage.setItem('sgas_draft', JSON.stringify(formData));
}

// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
    // Máscaras iniciais
    document.querySelectorAll('.cpf-mask').forEach(i => i.addEventListener('input', (e) => e.target.value = mascaraCPF(e.target.value)));
    document.querySelectorAll('.rg-mask').forEach(i => i.addEventListener('input', (e) => e.target.value = mascaraRG(e.target.value)));

    // Validação em tempo real para todos os campos 'req'
    document.body.addEventListener('input', (e) => {
        if (e.target.classList.contains('req')) validateCurrentStep();
    });

    // Feedback visual para uploads
    document.body.addEventListener('change', (e) => {
        if (e.target.type === 'file') {
            const label = document.querySelector(`label[for="${e.target.id}"]`);
            if (label && e.target.files.length > 0) {
                label.innerText = "✅ " + e.target.files[0].name.substring(0, 15) + "...";
                label.style.background = "#d4edda";
                label.style.color = "#155724";
            }
            validateCurrentStep();
        }
    });

    validateCurrentStep();
});

// SUBMISSÃO FINAL
document.getElementById('multiStepForm').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Análise enviada com sucesso! Conforme as orientações, a família receberá informações sobre pendências em até 15 dias úteis via e-mail[cite: 24].');
    localStorage.removeItem('sgas_draft');
    window.location.href = "../index.html";
});