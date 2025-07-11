let currentTemplate = null;

async function loadTemplate(templateFile) {
    try {
        const preview = document.getElementById('resumePreview');
        preview.innerHTML = '';
        
        
        const response = await fetch(templateFile);
        if (!response.ok) throw new Error(`Failed to load template: ${response.status}`);
        const html = await response.text();

       
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = html;

        const templateContent = tempContainer.querySelector('.resume-template').outerHTML;
        preview.innerHTML = templateContent;

        const cssLinks = Array.from(tempContainer.querySelectorAll('link[rel="stylesheet"]'));
        for (const link of cssLinks) {
            const cssResponse = await fetch(link.href);
            const cssText = await cssResponse.text();
            const styleTag = document.createElement('style');
            styleTag.textContent = cssText;
            preview.appendChild(styleTag);
        }

        
        updatePreview();
        currentTemplate = preview;

    } catch (error) {
        console.error("Template error:", error);
        alert(`Error loading template: ${error.message}`);
    }
}

function updatePreview() {
    if (!currentTemplate) return;

    const fields = {
        '.name': { id: 'nameInput', default: 'Your Name' },
        '.email': { id: 'emailInput', default: 'your.email@example.com' },
        '.phone': { id: 'phoneInput', default: '+123 456 7890' },
        '.education-content': { id: 'educationInput', default: 'Add your education' },
        '.experience-content': { id: 'experienceInput', default: 'Add your work experience' },
        '.skills-content': { id: 'skillsInput', default: 'Add your skills' },
        '.summary-content': { id: 'summaryInput', default: 'Add your summary' },
        '.projects-content': { id: 'projectsInput', default: 'Add your projects' }
    };

    Object.entries(fields).forEach(([selector, { id, default: defaultValue }]) => {
        const element = currentTemplate.querySelector(selector);
        const value = document.getElementById(id).value || defaultValue;
        if (element) {
            if (element.tagName === 'UL') {
                element.innerHTML = value.split('\n').map(line => `<li>${line}</li>`).join('');
            } else {
                element.textContent = value;
            }
        }
    });
}


const inputFields = document.querySelectorAll('.form-container input, .form-container textarea');
inputFields.forEach(input => {
    input.addEventListener('input', updatePreview);
});


function validateForm() {
    let isValid = true;
    const inputs = [
        { id: 'nameInput', errorId: 'nameError' },
        { id: 'emailInput', errorId: 'emailError' },
        { id: 'phoneInput', errorId: 'phoneError' },
        { id: 'educationInput', errorId: 'educationError' },
        { id: 'experienceInput', errorId: 'experienceError' },
        { id: 'skillsInput', errorId: 'skillsError' },
        { id: 'summaryInput', errorId: 'summaryError' },
        { id: 'projectsInput', errorId: 'projectsError' }
    ];

    inputs.forEach(({ id, errorId }) => {
        const input = document.getElementById(id);
        const error = document.getElementById(errorId);
        if (!input.value.trim()) {
            error.style.display = 'block';
            isValid = false;
        } else {
            error.style.display = 'none';
        }
    });

    return isValid;
}

document.getElementById('downloadButton').addEventListener('click', () => {
    if (!currentTemplate) {
        alert('Please select a template first!');
        return;
    }

    if (!validateForm()) {
        alert('Please fill out all required fields.');
        return;
    }

    const options = {
        margin: [15, 15],
        filename: 'resume.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { 
            scale: 2,
            logging: true,
            useCORS: true,
            scrollY: 0 
        },
        jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait',
            hotfixes: ["px_scaling"] 
        }
    };

    html2pdf()
        .set(options)
        .from(currentTemplate)
        .save();
});


loadTemplate('Templates/template1.html');