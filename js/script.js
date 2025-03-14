defaultData = { categories: [] };
let data = JSON.parse(localStorage.getItem('buttonData')) || defaultData;

function saveData() {
    localStorage.setItem('buttonData', JSON.stringify(data));
}
function renderCategories() {
    const container = document.getElementById('boton-container');
    container.innerHTML = '';

    data.categories.forEach((cat, index) => {
        container.innerHTML += `
            <div class="boton" style="background: ${cat.color}" onclick="openCategory(${index})">
                <i class="${cat.icon}" style="font-size: 40px;"></i>
                <p>${cat.name}</p>
            </div>
        `;
    });

    // Ocultar el botón "Volver" en la pantalla principal
    const volverBtn = document.getElementById("volver-btn");
    if (volverBtn) {
        volverBtn.style.display = "none";
    }
}


function openCategory(index) {
    localStorage.setItem('currentCategory', index);
    renderButtons(index);
}


function renderButtons(categoryIndex) {
    const container = document.getElementById('boton-container');
    const category = data.categories[categoryIndex];

    container.innerHTML = `
        <div class="categoria-titulo-container">
            <h2 class="categoria-titulo">${category.name}</h2>
        </div>
    `;

    category.buttons.forEach((btn, index) => {
        container.innerHTML += `
            <a href="${btn.link}" class="boton" style="background: ${btn.color}" target="_blank">
                <button class="edit-btn" onclick="editButton(${categoryIndex}, ${index}); event.preventDefault();">✏️</button>
                <button class="delete-btn" onclick="deleteButton(${categoryIndex}, ${index}); event.preventDefault(); event.stopPropagation();">&times;</button>
                <i class="${btn.icon}" style="font-size: 40px;"></i>
                <p class="boton-texto">${btn.text}</p>
            </a>
        `;
    });

    let volverBtn = document.getElementById("volver-btn");
    if (!volverBtn) {
        volverBtn = document.createElement("button");
        volverBtn.id = "volver-btn";
        volverBtn.className = "btn btn-primary volver-btn";
        volverBtn.innerText = "Volver";
        volverBtn.onclick = renderCategories;
        document.body.appendChild(volverBtn);
    }
    volverBtn.style.display = "block";
}



function openAddModal() {
    document.getElementById('editIndex').value = "";
    document.getElementById('categoryName').value = "";
    document.getElementById('categoryIcon').value = "";
    document.getElementById('categoryColor').value = "#ffffff";
    document.getElementById('buttonText').value = "";
    document.getElementById('buttonIcon').value = "";
    document.getElementById('buttonLink').value = "";
    document.getElementById('buttonColor').value = "#ffffff";

    populateCategorySelect();
    new bootstrap.Modal(document.getElementById('addModal')).show();
}

function populateCategorySelect() {
    const categorySelect = document.getElementById('categorySelect');
    categorySelect.innerHTML = '<option value="">Nueva Categoría</option>';

    data.categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.name;
        option.textContent = cat.name;
        categorySelect.appendChild(option);
    });
}

function updateCategoryFields() {
    const selectedCategory = document.getElementById('categorySelect').value;
    const categoryNameInput = document.getElementById('categoryName');
    const categoryIconInput = document.getElementById('categoryIcon');
    const categoryColorInput = document.getElementById('categoryColor');

    if (selectedCategory) {
        const category = data.categories.find(cat => cat.name === selectedCategory);
        categoryNameInput.value = category.name;
        categoryIconInput.value = category.icon;
        categoryColorInput.value = category.color;
        categoryNameInput.disabled = true;
    } else {
        categoryNameInput.value = "";
        categoryIconInput.value = "";
        categoryColorInput.value = "#ffffff";
        categoryNameInput.disabled = false;
    }
}

function saveButton() {
    const categorySelect = document.getElementById('categorySelect').value;
    const categoryName = document.getElementById('categoryName').value.trim();
    const categoryIcon = document.getElementById('categoryIcon').value.trim();
    const categoryColor = document.getElementById('categoryColor').value;
    const buttonText = document.getElementById('buttonText').value.trim();
    const buttonIcon = document.getElementById('buttonIcon').value.trim();
    const buttonLink = document.getElementById('buttonLink').value.trim();
    const buttonColor = document.getElementById('buttonColor').value;
    const editIndex = document.getElementById('editIndex').value;

    if (!categoryName || !categoryIcon || !buttonText || !buttonIcon || !buttonLink) {
        alert("Todos los campos son obligatorios");
        return;
    }

    let category = data.categories.find(cat => cat.name === categorySelect || cat.name === categoryName);
    if (!category) {
        // Si la categoría no existe, la creamos
        category = { name: categoryName, icon: categoryIcon, color: categoryColor, buttons: [] };
        data.categories.push(category);
    }

    if (editIndex) {
        // Editar botón existente en vez de crear uno nuevo
        const [catIndex, btnIndex] = editIndex.split(',').map(Number);
        data.categories[catIndex].buttons[btnIndex] = { text: buttonText, icon: buttonIcon, link: buttonLink, color: buttonColor };
    } else {
        // Crear nuevo botón
        category.buttons.push({ text: buttonText, icon: buttonIcon, link: buttonLink, color: buttonColor });
    }

    saveData();
    renderCategories();
    bootstrap.Modal.getInstance(document.getElementById('addModal')).hide();
}

function deleteButton(categoryIndex, buttonIndex) {
    data.categories[categoryIndex].buttons.splice(buttonIndex, 1);
    if (data.categories[categoryIndex].buttons.length === 0) {
        data.categories.splice(categoryIndex, 1);
    }
    saveData();
    renderCategories();
}

function editButton(categoryIndex, buttonIndex) {
    const category = data.categories[categoryIndex];
    const button = category.buttons[buttonIndex];

    document.getElementById('editIndex').value = `${categoryIndex},${buttonIndex}`;
    document.getElementById('categoryName').value = category.name;
    document.getElementById('categoryIcon').value = category.icon;
    document.getElementById('categoryColor').value = category.color;
    document.getElementById('buttonText').value = button.text;
    document.getElementById('buttonIcon').value = button.icon;
    document.getElementById('buttonLink').value = button.link;
    document.getElementById('buttonColor').value = button.color;
    new bootstrap.Modal(document.getElementById('addModal')).show();
}

// Función para abrir la selección de iconos
let targetInputId = "";

function openIconModal(target) {
    targetInputId = target;
    new bootstrap.Modal(document.getElementById('iconModal')).show();
}

// Seleccionar icono y asignarlo al input correspondiente
function selectIcon(icon) {
    document.getElementById(targetInputId).value = icon;
    bootstrap.Modal.getInstance(document.getElementById('iconModal')).hide();
}

// Cargar iconos de Bootstrap dinámicamente
async function loadIcons() {
    const response = await fetch("https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css");
    const cssText = await response.text();
    const iconMatches = cssText.match(/\.bi-([a-z0-9-]+)::before/g);
    const icons = iconMatches ? iconMatches.map(match => match.replace('.bi-', '').replace('::before', '')) : [];

    document.getElementById("iconList").innerHTML = icons.map(icon =>
        `<i class="bi bi-${icon} fs-2 p-2" onclick="selectIcon('bi bi-${icon}')" style="cursor:pointer"></i>`
    ).join('');
}

document.addEventListener("DOMContentLoaded", function () {
    renderCategories();
    loadIcons();
});

function exportButtons() {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "buttons_data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function importButtons(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (!Array.isArray(importedData.categories)) {
                alert("Error: El archivo JSON no contiene la estructura correcta.");
                return;
            }

            data = importedData;
            saveData();
            renderCategories();
            alert("Datos importados correctamente.");
        } catch (error) {
            alert("Error al leer el archivo JSON.");
            console.error(error);
        }
    };
    reader.readAsText(file);
}
