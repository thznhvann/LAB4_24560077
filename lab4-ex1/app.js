const API_URL = 'http://localhost:5001/api/v1/products';

const tableBody = document.getElementById('productTableBody');
const addForm = document.getElementById('addForm');
const categoryFilter = document.getElementById('categoryFilter');
const errorBox = document.getElementById('errorBox');

let editingId = null;

function showError(message) {
    errorBox.textContent = message;
    errorBox.style.display = 'block';
}

function clearError() {
    errorBox.textContent = '';
    errorBox.style.display = 'none';
}

async function loadCategories() {
    try {
        const res = await fetch(API_URL);
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || `HTTP ${res.status}`);

        const currentVal = categoryFilter.value;
        const categories = [...new Set(result.data.map(p => p.category))];

        categoryFilter.innerHTML = '<option value="">All Categories</option>';
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categoryFilter.appendChild(option);
        });
        categoryFilter.value = categories.includes(currentVal) ? currentVal : '';
    } catch (error) {
        showError(`Error fetching categories: ${error.message}`);
    }
}

async function fetchProducts() {
    clearError();
    const selectedCategory = categoryFilter.value;
    const url = selectedCategory ? `${API_URL}?category=${encodeURIComponent(selectedCategory)}` : API_URL;

    try {
        const res = await fetch(url);
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || `HTTP ${res.status}`);
        renderTable(result.data);
    } catch (error) {
        tableBody.innerHTML = '';
        showError(`Error fetching products: ${error.message}`);
    }
}

function renderTable(products) {
    tableBody.innerHTML = '';
    products.forEach(product => {
        const tr = document.createElement('tr');
        if (editingId === product.id) {
            tr.innerHTML = `
                <td>${product.id}</td>
                <td><input type="text" id="edit-name-${product.id}" class="edit-input" value="${product.name}"></td>
                <td><input type="number" id="edit-price-${product.id}" class="edit-input" value="${product.price}"></td>
                <td><input type="text" id="edit-category-${product.id}" class="edit-input" value="${product.category}"></td>
                <td>
                    <button class="btn-save" onclick="saveProduct(${product.id})">Save</button>
                    <button class="btn-cancel" onclick="cancelEdit()">Cancel</button>
                </td>
            `;
        } else {
            tr.innerHTML = `
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${Number(product.price).toLocaleString('en-US')} VND</td>
                <td>${product.category}</td>
                <td>
                    <button class="btn-edit" onclick="startEdit(${product.id})">Edit</button>
                    <button class="btn-delete" onclick="deleteProduct(${product.id})">Delete</button>
                </td>
            `;
        }
        tableBody.appendChild(tr);
    });
}

function startEdit(id) {
    editingId = id;
    fetchProducts();
}

function cancelEdit() {
    editingId = null;
    fetchProducts();
}

async function saveProduct(id) {
    clearError();
    const name = document.getElementById(`edit-name-${id}`).value.trim();
    const price = document.getElementById(`edit-price-${id}`).value;
    const category = document.getElementById(`edit-category-${id}`).value.trim();

    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, price: Number(price), category })
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || `HTTP ${res.status}`);

        editingId = null;
        await loadCategories();
        await fetchProducts();
    } catch (error) {
        showError(`Error updating product: ${error.message}`);
    }
}

async function deleteProduct(id) {
    clearError();
    try {
        const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || `HTTP ${res.status}`);

        await loadCategories();
        await fetchProducts();
    } catch (error) {
        showError(`Error deleting product: ${error.message}`);
    }
}

addForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError();

    const name = document.getElementById('nameInput').value.trim();
    const price = document.getElementById('priceInput').value;
    const category = document.getElementById('categoryInput').value.trim();

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, price: Number(price), category })
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || `HTTP ${res.status}`);

        addForm.reset();
        await loadCategories();
        await fetchProducts();
    } catch (error) {
        showError(`Error adding product: ${error.message}`);
    }
});

categoryFilter.addEventListener('change', fetchProducts);

loadCategories();
fetchProducts();