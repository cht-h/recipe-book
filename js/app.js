class DataStore {
    constructor() {
        this.products = [];
        this.dishes = [];
        this.loadData();
    }

    loadData() {
        const savedProducts = localStorage.getItem('cookbook_products');
        const savedDishes = localStorage.getItem('cookbook_dishes');

        if (savedProducts) {
            try { this.products = JSON.parse(savedProducts); }
            catch(e) { this.products = JSON.parse(JSON.stringify(INITIAL_PRODUCTS)); }
        } else {
            this.products = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
            this.saveProducts();
        }

        if (savedDishes) {
            try { this.dishes = JSON.parse(savedDishes); }
            catch(e) { this.dishes = []; }
        } else {
            this.dishes = [];
            this.saveDishes();
        }
    }

    saveProducts() { localStorage.setItem('cookbook_products', JSON.stringify(this.products)); }
    saveDishes() { localStorage.setItem('cookbook_dishes', JSON.stringify(this.dishes)); }

    addProduct(product) {
        product.id = Date.now().toString();
        product.createdAt = new Date().toISOString();
        product.updatedAt = null;
        this.products.push(product);
        this.saveProducts();
        return product;
    }

    updateProduct(id, updatedProduct) {
        const index = this.products.findIndex(p => p.id === id);
        if (index !== -1) {
            updatedProduct.updatedAt = new Date().toISOString();
            updatedProduct.createdAt = this.products[index].createdAt;
            updatedProduct.id = id;
            this.products[index] = updatedProduct;
            this.saveProducts();
            return true;
        }
        return false;
    }

    deleteProduct(id) {
        const usedInDishes = this.dishes.filter(d => d.ingredients && d.ingredients.some(i => i.productId === id));
        if (usedInDishes.length > 0) return { success: false, dishes: usedInDishes };
        this.products = this.products.filter(p => p.id !== id);
        this.saveProducts();
        return { success: true, dishes: [] };
    }

    getProductById(id) { return this.products.find(p => p.id === id); }

    addDish(dish) {
        dish.id = Date.now().toString();
        dish.createdAt = new Date().toISOString();
        dish.updatedAt = null;
        this.dishes.push(dish);
        this.saveDishes();
        return dish;
    }

    updateDish(id, updatedDish) {
        const index = this.dishes.findIndex(d => d.id === id);
        if (index !== -1) {
            updatedDish.updatedAt = new Date().toISOString();
            updatedDish.createdAt = this.dishes[index].createdAt;
            updatedDish.id = id;
            this.dishes[index] = updatedDish;
            this.saveDishes();
            return true;
        }
        return false;
    }

    deleteDish(id) {
        this.dishes = this.dishes.filter(d => d.id !== id);
        this.saveDishes();
        return true;
    }

    getDishById(id) { return this.dishes.find(d => d.id === id); }

    getAvailableFlagsForDish(ingredients) {
        if (!ingredients || ingredients.length === 0) return { vegan: false, glutenFree: false, sugarFree: false };
        const flags = { vegan: true, glutenFree: true, sugarFree: true };
        for (const ing of ingredients) {
            const product = this.getProductById(ing.productId);
            if (!product) continue;
            if (!product.flags.vegan) flags.vegan = false;
            if (!product.flags.glutenFree) flags.glutenFree = false;
            if (!product.flags.sugarFree) flags.sugarFree = false;
        }
        return flags;
    }

    calculateNutrition(ingredients) {
        const productsMap = {};
        for (const p of this.products) {
            productsMap[p.id] = p;
        }
        return calculateNutrition(ingredients, productsMap);
    }
}

const store = new DataStore();

function formatDate(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => toast.classList.add('hidden'), 3500);
}

function showModal(title, content) {
    const overlay = document.getElementById('modal-overlay');
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-content').innerHTML = content;
    overlay.classList.remove('hidden');
    setTimeout(() => {
        document.querySelectorAll('.modal-carousel').forEach(c => initCarousel(c));
    }, 10);
}

function hideModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
}

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(String(str)));
    return div.innerHTML;
}

function escapeAttr(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function initCarousel(container) {
    if (!container || container.dataset.carouselInited) return;
    container.dataset.carouselInited = 'true';

    const imagesWrap = container.querySelector('.card-carousel-images, .modal-carousel-images');
    const dotsContainer = container.querySelector('.carousel-dots');
    const prevBtn = container.querySelector('.carousel-btn.prev');
    const nextBtn = container.querySelector('.carousel-btn.next');
    const slides = imagesWrap ? imagesWrap.children : [];

    if (!imagesWrap || slides.length <= 1) {
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
        if (dotsContainer) dotsContainer.style.display = 'none';
        return;
    }

    let currentIndex = 0;

    function goTo(index) {
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;
        currentIndex = index;
        imagesWrap.style.transform = `translateX(-${currentIndex * 100}%)`;
        if (dotsContainer) {
            dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === currentIndex);
            });
        }
    }

    if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); goTo(currentIndex - 1); });
    if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); goTo(currentIndex + 1); });

    if (dotsContainer) {
        dotsContainer.innerHTML = '';
        for (let i = 0; i < slides.length; i++) {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
            dot.addEventListener('click', (e) => { e.stopPropagation(); goTo(i); });
            dotsContainer.appendChild(dot);
        }
    }
}

function buildCarouselHtml(images, noImageContent, carouselClass = 'card-carousel', imagesClass = 'card-carousel-images') {
    if (!images || images.length === 0) {
        return `<div class="${carouselClass}"><div class="${imagesClass}"><div class="card-carousel-no-image">${noImageContent}</div></div></div>`;
    }
    if (images.length === 1) {
        return `<div class="${carouselClass}"><div class="${imagesClass}"><img src="${escapeAttr(images[0])}" alt="" onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\\'card-carousel-no-image\\'>${noImageContent}</div>';"></div></div>`;
    }
    let html = `<div class="${carouselClass}">`;
    html += `<button class="carousel-btn prev">‹</button>`;
    html += `<button class="carousel-btn next">›</button>`;
    html += `<div class="carousel-dots"></div>`;
    html += `<div class="${imagesClass}">`;
    images.forEach(img => {
        html += `<img src="${escapeAttr(img)}" alt="" onerror="this.style.display='none'; this.innerHTML='${noImageContent}';">`;
    });
    html += `</div></div>`;
    return html;
}

const sortState = { field: 'name', direction: 'asc' };

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.view + '-view').classList.add('active');
        });
    });

    document.querySelector('.modal-overlay').addEventListener('click', e => { if (e.target.classList.contains('modal-overlay')) hideModal(); });
    document.querySelector('.modal-close').addEventListener('click', hideModal);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') hideModal(); });

    document.getElementById('add-product-btn').addEventListener('click', () => showProductForm());
    document.getElementById('add-dish-btn').addEventListener('click', () => showDishForm());

    document.getElementById('product-search').addEventListener('input', renderProducts);
    document.getElementById('dish-search').addEventListener('input', renderDishes);
    document.getElementById('product-category-filter').addEventListener('change', renderProducts);
    document.getElementById('product-cooking-filter').addEventListener('change', renderProducts);
    document.querySelectorAll('#products-view .flag-filter').forEach(cb => cb.addEventListener('change', renderProducts));
    document.getElementById('dish-category-filter').addEventListener('change', renderDishes);
    document.querySelectorAll('#dishes-view .dish-flag-filter').forEach(cb => cb.addEventListener('change', renderDishes));

    document.getElementById('product-sort').addEventListener('change', e => {
        sortState.field = e.target.value;
        sortState.direction = 'asc';
        updateSortButtons();
        renderProducts();
    });
    document.getElementById('sort-asc').addEventListener('click', () => { sortState.direction = 'asc'; updateSortButtons(); renderProducts(); });
    document.getElementById('sort-desc').addEventListener('click', () => { sortState.direction = 'desc'; updateSortButtons(); renderProducts(); });

    populateFilters();
    renderProducts();
    renderDishes();
});

function updateSortButtons() {
    document.getElementById('sort-asc').classList.toggle('active', sortState.direction === 'asc');
    document.getElementById('sort-desc').classList.toggle('active', sortState.direction === 'desc');
}

function populateFilters() {
    const pcf = document.getElementById('product-category-filter');
    PRODUCT_CATEGORIES.forEach(c => { const o = document.createElement('option'); o.value = c; o.textContent = c; pcf.appendChild(o); });
    const cf = document.getElementById('product-cooking-filter');
    COOKING_REQUIRED.forEach(c => { const o = document.createElement('option'); o.value = c; o.textContent = c; cf.appendChild(o); });
    const dcf = document.getElementById('dish-category-filter');
    DISH_CATEGORIES.forEach(c => { const o = document.createElement('option'); o.value = c; o.textContent = c; dcf.appendChild(o); });
}

function renderProducts() {
    const container = document.getElementById('products-list');
    if (!container) return;
    const searchTerm = (document.getElementById('product-search')?.value || '').toLowerCase();
    const catFilter = document.getElementById('product-category-filter')?.value || '';
    const cookFilter = document.getElementById('product-cooking-filter')?.value || '';
    const flagFilters = [];
    document.querySelectorAll('#products-view .flag-filter:checked').forEach(cb => flagFilters.push(cb.value));

    let filtered = store.products.filter(p => {
        if (searchTerm && !p.name.toLowerCase().includes(searchTerm)) return false;
        if (catFilter && p.category !== catFilter) return false;
        if (cookFilter && p.cookingRequired !== cookFilter) return false;
        if (flagFilters.includes('vegan') && !p.flags.vegan) return false;
        if (flagFilters.includes('glutenFree') && !p.flags.glutenFree) return false;
        if (flagFilters.includes('sugarFree') && !p.flags.sugarFree) return false;
        return true;
    });

    const dir = sortState.direction === 'asc' ? 1 : -1;
    filtered.sort((a, b) => {
        switch (sortState.field) {
            case 'name': return a.name.localeCompare(b.name, 'ru') * dir;
            case 'calories': return ((a.calories || 0) - (b.calories || 0)) * dir;
            case 'protein': return ((a.protein || 0) - (b.protein || 0)) * dir;
            case 'fat': return ((a.fat || 0) - (b.fat || 0)) * dir;
            case 'carbs': return ((a.carbs || 0) - (b.carbs || 0)) * dir;
            default: return 0;
        }
    });

    if (filtered.length === 0) {
        container.innerHTML = '<p style="color:#999;text-align:center;padding:40px;grid-column:1/-1;">Продукты не найдены</p>';
        return;
    }

    container.innerHTML = filtered.map(p => {
        const tags = [];
        if (p.flags?.vegan) tags.push('<span class="tag tag-vegan">Веган</span>');
        if (p.flags?.glutenFree) tags.push('<span class="tag tag-gluten-free">Без глютена</span>');
        if (p.flags?.sugarFree) tags.push('<span class="tag tag-sugar-free">Без сахара</span>');

        const carouselHtml = buildCarouselHtml(p.images, '📷');

        return `
            <div class="card" onclick="showProductDetail('${p.id}')">
                ${carouselHtml}
                <div class="card-body" onclick="event.stopPropagation(); showProductDetail('${p.id}')">
                    <h3 class="card-title">${escapeHtml(p.name)}</h3>
                    <div class="card-tags">${tags.join('')}</div>
                    <div class="card-info">
                        <span class="card-info-item">${p.calories} ккал</span>
                        <span class="card-info-item">Б: ${p.protein}</span>
                        <span class="card-info-item">Ж: ${p.fat}</span>
                        <span class="card-info-item">У: ${p.carbs}</span>
                        <span class="card-info-item tag-category">${p.category}</span>
                    </div>
                    <div class="card-time">Создан: ${formatDate(p.createdAt)}${p.updatedAt ? '<br>Изменён: '+formatDate(p.updatedAt) : ''}</div>
                    <div class="card-actions" onclick="event.stopPropagation();">
                        <button class="btn btn-secondary btn-sm" onclick="editProduct('${p.id}')">✏️ Ред.</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteProduct('${p.id}')">🗑️ Удалить</button>
                    </div>
                </div>
            </div>`;
    }).join('');

    document.querySelectorAll('#products-list .card-carousel').forEach(c => initCarousel(c));
}

function renderDishes() {
    const container = document.getElementById('dishes-list');
    if (!container) return;
    const searchTerm = (document.getElementById('dish-search')?.value || '').toLowerCase();
    const catFilter = document.getElementById('dish-category-filter')?.value || '';
    const flagFilters = [];
    document.querySelectorAll('#dishes-view .dish-flag-filter:checked').forEach(cb => flagFilters.push(cb.value));

    let filtered = store.dishes.filter(d => {
        if (searchTerm && !d.name.toLowerCase().includes(searchTerm)) return false;
        if (catFilter && d.category !== catFilter) return false;
        if (flagFilters.includes('vegan') && !d.flags.vegan) return false;
        if (flagFilters.includes('glutenFree') && !d.flags.glutenFree) return false;
        if (flagFilters.includes('sugarFree') && !d.flags.sugarFree) return false;
        return true;
    });

    if (filtered.length === 0) {
        container.innerHTML = '<p style="color:#999;text-align:center;padding:40px;grid-column:1/-1;">Блюда не найдены</p>';
        return;
    }

    container.innerHTML = filtered.map(d => {
        const tags = [];
        if (d.flags?.vegan) tags.push('<span class="tag tag-vegan">Веган</span>');
        if (d.flags?.glutenFree) tags.push('<span class="tag tag-gluten-free">Без глютена</span>');
        if (d.flags?.sugarFree) tags.push('<span class="tag tag-sugar-free">Без сахара</span>');

        const carouselHtml = buildCarouselHtml(d.images, '🍽️');

        return `
            <div class="card" onclick="showDishDetail('${d.id}')">
                ${carouselHtml}
                <div class="card-body" onclick="event.stopPropagation(); showDishDetail('${d.id}')">
                    <h3 class="card-title">${escapeHtml(d.name)}</h3>
                    <div class="card-tags">${tags.join('')}</div>
                    <div class="card-info">
                        <span class="card-info-item">${d.calories} ккал/порц</span>
                        <span class="card-info-item">Б: ${d.protein}</span>
                        <span class="card-info-item">Ж: ${d.fat}</span>
                        <span class="card-info-item">У: ${d.carbs}</span>
                        <span class="card-info-item tag-category">${d.category}</span>
                        <span class="card-info-item">${d.portionSize} г</span>
                    </div>
                    <div class="card-time">Создан: ${formatDate(d.createdAt)}${d.updatedAt ? '<br>Изменён: '+formatDate(d.updatedAt) : ''}</div>
                    <div class="card-actions" onclick="event.stopPropagation();">
                        <button class="btn btn-secondary btn-sm" onclick="editDish('${d.id}')">✏️ Ред.</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteDish('${d.id}')">🗑️ Удалить</button>
                    </div>
                </div>
            </div>`;
    }).join('');

    document.querySelectorAll('#dishes-list .card-carousel').forEach(c => initCarousel(c));
}

function showProductDetail(id) {
    const p = store.getProductById(id);
    if (!p) { showToast('Продукт не найден', 'error'); return; }

    const carouselHtml = buildCarouselHtml(p.images, '📷', 'modal-carousel', 'modal-carousel-images');

    const flags = [];
    if (p.flags?.vegan) flags.push('Веган');
    if (p.flags?.glutenFree) flags.push('Без глютена');
    if (p.flags?.sugarFree) flags.push('Без сахара');

    const content = `
        ${carouselHtml}
        <div class="modal-detail"><strong>Калорийность:</strong> <span>${p.calories} ккал / 100 г</span></div>
        <div class="modal-detail"><strong>Белки:</strong> <span>${p.protein} г / 100 г</span></div>
        <div class="modal-detail"><strong>Жиры:</strong> <span>${p.fat} г / 100 г</span></div>
        <div class="modal-detail"><strong>Углеводы:</strong> <span>${p.carbs} г / 100 г</span></div>
        <div class="modal-detail"><strong>Состав:</strong> <span>${escapeHtml(p.composition || 'Не указан')}</span></div>
        <div class="modal-detail"><strong>Категория:</strong> <span>${p.category}</span></div>
        <div class="modal-detail"><strong>Готовность:</strong> <span>${p.cookingRequired}</span></div>
        <div class="modal-detail"><strong>Флаги:</strong> <span>${flags.length ? flags.join(', ') : 'Нет'}</span></div>
        <div style="margin-top:16px;padding-top:16px;border-top:1px solid #e0e0e0;">
            <div class="modal-detail"><strong>Создан:</strong> <span>${formatDate(p.createdAt)}</span></div>
            ${p.updatedAt ? `<div class="modal-detail"><strong>Изменён:</strong> <span>${formatDate(p.updatedAt)}</span></div>` : ''}
        </div>`;
    showModal(p.name, content);
}

function showDishDetail(id) {
    const d = store.getDishById(id);
    if (!d) { showToast('Блюдо не найдено', 'error'); return; }

    const carouselHtml = buildCarouselHtml(d.images, '🍽️', 'modal-carousel', 'modal-carousel-images');

    const flags = [];
    if (d.flags?.vegan) flags.push('Веган');
    if (d.flags?.glutenFree) flags.push('Без глютена');
    if (d.flags?.sugarFree) flags.push('Без сахара');

    const ingredientsHtml = (d.ingredients && d.ingredients.length > 0)
        ? d.ingredients.map(ing => {
            const product = store.getProductById(ing.productId);
            return `<div class="modal-detail">• ${escapeHtml(product ? product.name : '(продукт удалён)')} — ${ing.quantity} г</div>`;
        }).join('')
        : '<div class="modal-detail">Состав не указан</div>';

    const content = `
        ${carouselHtml}
        <div class="modal-detail"><strong>Калорийность:</strong> <span>${d.calories} ккал / порция</span></div>
        <div class="modal-detail"><strong>Белки:</strong> <span>${d.protein} г / порция</span></div>
        <div class="modal-detail"><strong>Жиры:</strong> <span>${d.fat} г / порция</span></div>
        <div class="modal-detail"><strong>Углеводы:</strong> <span>${d.carbs} г / порция</span></div>
        <div class="modal-detail"><strong>Размер порции:</strong> <span>${d.portionSize} г</span></div>
        <div class="modal-detail"><strong>Категория:</strong> <span>${d.category}</span></div>
        <div class="modal-detail"><strong>Флаги:</strong> <span>${flags.length ? flags.join(', ') : 'Нет'}</span></div>
        <div class="modal-section-title">Состав:</div>${ingredientsHtml}
        <div style="margin-top:16px;padding-top:16px;border-top:1px solid #e0e0e0;">
            <div class="modal-detail"><strong>Создан:</strong> <span>${formatDate(d.createdAt)}</span></div>
            ${d.updatedAt ? `<div class="modal-detail"><strong>Изменён:</strong> <span>${formatDate(d.updatedAt)}</span></div>` : ''}
        </div>`;
    showModal(d.name, content);
}

function showProductForm(productId = null) {
    const container = document.getElementById('product-form-container');
    const isEdit = productId !== null && productId !== undefined && productId !== '';
    const product = isEdit ? store.getProductById(productId) : null;
    const title = isEdit ? 'Редактировать продукт' : 'Новый продукт';

    const nameVal = escapeAttr(product?.name || '');
    const caloriesVal = product ? product.calories : '';
    const proteinVal = product ? product.protein : '';
    const fatVal = product ? product.fat : '';
    const carbsVal = product ? product.carbs : '';
    const compositionVal = product ? (product.composition || '') : '';
    const imagesVal = product?.images ? product.images.join(', ') : '';
    const categoryVal = product?.category || '';
    const cookingVal = product?.cookingRequired || '';

    container.innerHTML = `
        <h3>${title}</h3>
        <form id="product-form" onsubmit="saveProduct(event, '${isEdit ? productId : ''}')">
            <div class="form-row">
                <div class="form-group"><label>Название * (мин. 2 символа)</label><input type="text" id="prod-name" value="${nameVal}" required minlength="2"></div>
                <div class="form-group"><label>Категория *</label>
                    <select id="prod-category" required>
                        <option value="">-- Выберите --</option>
                        ${PRODUCT_CATEGORIES.map(c => `<option value="${c}" ${categoryVal === c ? 'selected' : ''}>${c}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group"><label>Калорийность * (ккал / 100 г, мин. 0)</label><input type="number" id="prod-calories" value="${caloriesVal}" required min="0" step="any"></div>
                <div class="form-group"><label>Белки * (г / 100 г, 0–100)</label><input type="number" id="prod-protein" value="${proteinVal}" required min="0" max="100" step="any"></div>
                <div class="form-group"><label>Жиры * (г / 100 г, 0–100)</label><input type="number" id="prod-fat" value="${fatVal}" required min="0" max="100" step="any"></div>
                <div class="form-group"><label>Углеводы * (г / 100 г, 0–100)</label><input type="number" id="prod-carbs" value="${carbsVal}" required min="0" max="100" step="any"></div>
            </div>
            <div class="form-row"><div class="form-group"><label>Состав (опционально)</label><textarea id="prod-composition">${escapeHtml(compositionVal)}</textarea></div></div>
            <div class="form-row">
                <div class="form-group"><label>Необходимость готовки *</label>
                    <select id="prod-cooking" required>
                        <option value="">-- Выберите --</option>
                        ${COOKING_REQUIRED.map(c => `<option value="${c}" ${cookingVal === c ? 'selected' : ''}>${c}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="form-row"><div class="form-group"><label>Изображения (пути через запятую, макс. 5)</label><input type="text" id="prod-images" value="${escapeAttr(imagesVal)}" placeholder="images/photo1.png, images/photo2.png"></div></div>
            <div class="form-row">
                <div class="form-group">
                    <label>Флаги:</label>
                    <div class="flags-group">
                        <label class="flag-option"><input type="checkbox" id="prod-flag-vegan"> Веган</label>
                        <label class="flag-option"><input type="checkbox" id="prod-flag-gluten"> Без глютена</label>
                        <label class="flag-option"><input type="checkbox" id="prod-flag-sugar"> Без сахара</label>
                    </div>
                </div>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn btn-primary">${isEdit ? '💾 Сохранить' : '➕ Создать'}</button>
                <button type="button" class="btn btn-secondary" onclick="hideProductForm()">Отмена</button>
            </div>
        </form>`;

    setTimeout(() => {
        const veganCheckbox = document.getElementById('prod-flag-vegan');
        const glutenCheckbox = document.getElementById('prod-flag-gluten');
        const sugarCheckbox = document.getElementById('prod-flag-sugar');
        
        if (product) {
            if (veganCheckbox) veganCheckbox.checked = product.flags?.vegan || false;
            if (glutenCheckbox) glutenCheckbox.checked = product.flags?.glutenFree || false;
            if (sugarCheckbox) sugarCheckbox.checked = product.flags?.sugarFree || false;
        }
    }, 0);

    container.classList.remove('hidden');
    container.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function hideProductForm() {
    const c = document.getElementById('product-form-container');
    c.classList.add('hidden');
    c.innerHTML = '';
}
function editProduct(id) { showProductForm(id); }

function saveProduct(event, productId) {
    event.preventDefault();
    const protein = parseFloat(document.getElementById('prod-protein').value) || 0;
    const fat = parseFloat(document.getElementById('prod-fat').value) || 0;
    const carbs = parseFloat(document.getElementById('prod-carbs').value) || 0;
    if (protein + fat + carbs > 100.001) { showToast('❌ Сумма БЖУ на 100 г не может превышать 100 г!', 'error'); return; }
    const imagesStr = document.getElementById('prod-images').value.trim();
    const images = imagesStr ? imagesStr.split(',').map(s => s.trim()).filter(s => s.length > 0).slice(0, 5) : [];
    const data = {
        name: document.getElementById('prod-name').value.trim(),
        images,
        calories: parseFloat(document.getElementById('prod-calories').value) || 0,
        protein, fat, carbs,
        composition: document.getElementById('prod-composition').value.trim() || null,
        category: document.getElementById('prod-category').value,
        cookingRequired: document.getElementById('prod-cooking').value,
        flags: {
            vegan: document.getElementById('prod-flag-vegan').checked,
            glutenFree: document.getElementById('prod-flag-gluten').checked,
            sugarFree: document.getElementById('prod-flag-sugar').checked
        }
    };
    if (productId) { store.updateProduct(productId, data); showToast('Продукт обновлён ✅', 'success'); }
    else { store.addProduct(data); showToast('Продукт создан ✅', 'success'); }
    hideProductForm();
    renderProducts();
}

function deleteProduct(id) {
    const r = store.deleteProduct(id);
    if (!r.success) { showToast(`❌ Продукт используется в: ${r.dishes.map(d => `«${d.name}»`).join(', ')}`, 'error'); return; }
    showToast('Продукт удалён 🗑️', 'success');
    renderProducts();
    renderDishes();
}

function showDishForm(dishId = null) {
    const container = document.getElementById('dish-form-container');
    const isEdit = dishId !== null && dishId !== undefined && dishId !== '';
    const dish = isEdit ? store.getDishById(dishId) : null;
    const title = isEdit ? 'Редактировать блюдо' : 'Новое блюдо';

    let ingHtml = '<div id="ingredients-container">';
    const existing = (dish?.ingredients?.length) ? dish.ingredients : [{ productId: '', quantity: '' }];
    existing.forEach(ing => {
        ingHtml += `<div class="ingredient-row">
            <div class="form-group"><label>Продукт *</label><select class="ingredient-product" required><option value="">-- Выберите --</option>${store.products.map(p => `<option value="${p.id}" ${ing.productId===p.id?'selected':''}>${escapeHtml(p.name)}</option>`).join('')}</select></div>
            <div class="form-group"><label>Кол-во (г) *</label><input type="number" class="ingredient-quantity" value="${ing.quantity||''}" required min="0.01" step="any"></div>
            <button type="button" class="btn btn-danger btn-sm" onclick="removeIngredientRow(this)" ${existing.length<=1?'style="display:none"':''}>×</button>
        </div>`;
    });
    ingHtml += '</div><button type="button" class="btn btn-secondary btn-sm" onclick="addIngredientRow()" style="margin-top:8px;">+ Добавить продукт</button>';

    container.innerHTML = `
        <h3>${title}</h3>
        <form id="dish-form" onsubmit="saveDish(event, '${isEdit ? dishId : ''}')">
            <div class="form-row">
                <div class="form-group"><label>Название * (макросы: !десерт, !первое, !второе, !напиток, !салат, !суп, !перекус)</label><input type="text" id="dish-name" value="${escapeAttr(dish?.name||'')}" required minlength="2"></div>
                <div class="form-group"><label>Категория (если не выбрана — из макроса)</label><select id="dish-category"><option value="">-- Авто --</option>${DISH_CATEGORIES.map(c => `<option value="${c}" ${dish?.category===c?'selected':''}>${c}</option>`).join('')}</select></div>
            </div>
            <div class="form-row"><div class="form-group"><label>Размер порции (г) *</label><input type="number" id="dish-portion" value="${dish?.portionSize||''}" required min="0.01" step="any"></div></div>
            <div class="form-row"><div class="form-group"><label>Изображения (пути через запятую, макс. 5)</label><input type="text" id="dish-images" value="${escapeAttr(dish?.images?.join(', ')||'')}" placeholder="images/photo1.png"></div></div>
            <h4>Состав блюда *</h4>${ingHtml}
            <h4>КБЖУ на порцию</h4>
            <div class="form-row">
                <div class="form-group"><label>Калорийность</label><input type="number" id="dish-calories" value="${dish?.calories??''}" required min="0" step="any"></div>
                <div class="form-group"><label>Белки</label><input type="number" id="dish-protein" value="${dish?.protein??''}" required min="0" step="any"></div>
                <div class="form-group"><label>Жиры</label><input type="number" id="dish-fat" value="${dish?.fat??''}" required min="0" step="any"></div>
                <div class="form-group"><label>Углеводы</label><input type="number" id="dish-carbs" value="${dish?.carbs??''}" required min="0" step="any"></div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Флаги (доступность зависит от состава):</label>
                    <div class="flags-group" id="dish-flags-checkboxes">
                        <label class="flag-option"><input type="checkbox" id="dish-flag-vegan"> Веган</label>
                        <label class="flag-option"><input type="checkbox" id="dish-flag-gluten"> Без глютена</label>
                        <label class="flag-option"><input type="checkbox" id="dish-flag-sugar"> Без сахара</label>
                    </div>
                </div>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn btn-primary">${isEdit?'💾 Сохранить':'➕ Создать'}</button>
                <button type="button" class="btn btn-secondary" onclick="hideDishForm()">Отмена</button>
                <button type="button" class="btn btn-secondary" onclick="recalculateDishForm()">🔄 Пересчитать</button>
            </div>
        </form>`;

    container.classList.remove('hidden');
    container.scrollIntoView({ behavior:'smooth', block:'center' });

    setTimeout(() => {
        updateDishFlagsAvailability();
        
        if (dish) {
            setTimeout(() => {
                const veganCheckbox = document.getElementById('dish-flag-vegan');
                const glutenCheckbox = document.getElementById('dish-flag-gluten');
                const sugarCheckbox = document.getElementById('dish-flag-sugar');
                
                if (veganCheckbox && !veganCheckbox.disabled) veganCheckbox.checked = dish.flags?.vegan || false;
                if (glutenCheckbox && !glutenCheckbox.disabled) glutenCheckbox.checked = dish.flags?.glutenFree || false;
                if (sugarCheckbox && !sugarCheckbox.disabled) sugarCheckbox.checked = dish.flags?.sugarFree || false;
            }, 0);
        }
        
        if (!isEdit) recalculateDishForm(true);
    }, 0);
    
    attachIngredientListeners();
    setTimeout(() => { const ni = document.getElementById('dish-name'); if(ni) ni.addEventListener('input', applyMacroToCategory); }, 100);
}

function hideDishForm() { const c = document.getElementById('dish-form-container'); c.classList.add('hidden'); c.innerHTML = ''; }
function editDish(id) { showDishForm(id); }
function addIngredientRow() {
    const c = document.getElementById('ingredients-container');
    if(!c) return;
    const row = document.createElement('div');
    row.className = 'ingredient-row';
    row.innerHTML = `<div class="form-group"><label>Продукт *</label><select class="ingredient-product" required><option value="">-- Выберите --</option>${store.products.map(p => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('')}</select></div>
        <div class="form-group"><label>Кол-во (г) *</label><input type="number" class="ingredient-quantity" required min="0.01" step="any"></div>
        <button type="button" class="btn btn-danger btn-sm" onclick="removeIngredientRow(this)">×</button>`;
    c.appendChild(row);
    attachIngredientListeners();
}
function removeIngredientRow(btn) {
    const c = document.getElementById('ingredients-container');
    if(!c || c.children.length <= 1) return;
    btn.closest('.ingredient-row').remove();
    recalculateDishForm(); updateDishFlagsAvailability();
}
function attachIngredientListeners() {
    document.querySelectorAll('.ingredient-product, .ingredient-quantity').forEach(el => {
        el.removeEventListener('change', onIngredientChange);
        el.addEventListener('change', onIngredientChange);
    });
}
function onIngredientChange() { recalculateDishForm(); updateDishFlagsAvailability(); }
function getIngredientsFromForm() {
    const rows = document.querySelectorAll('.ingredient-row');
    const ings = [];
    rows.forEach(row => {
        const sel = row.querySelector('.ingredient-product');
        const qty = row.querySelector('.ingredient-quantity');
        if(sel?.value && qty?.value) ings.push({ productId: sel.value, quantity: parseFloat(qty.value) });
    });
    return ings;
}
function recalculateDishForm(silent=false) {
    const ings = getIngredientsFromForm();
    if(!ings.length) return;
    const n = store.calculateNutrition(ings);
    document.getElementById('dish-calories').value = n.calories;
    document.getElementById('dish-protein').value = n.protein;
    document.getElementById('dish-fat').value = n.fat;
    document.getElementById('dish-carbs').value = n.carbs;
    if(!silent) showToast('КБЖУ пересчитаны 🔄', 'info');
}
function updateDishFlagsAvailability() {
    const container = document.getElementById('dish-flags-checkboxes');
    if(!container) return;
    const ings = getIngredientsFromForm();
    const avail = store.getAvailableFlagsForDish(ings);
    const ov = document.getElementById('dish-flag-vegan');
    const og = document.getElementById('dish-flag-gluten');
    const os = document.getElementById('dish-flag-sugar');
    container.innerHTML = `
        <label class="flag-option"><input type="checkbox" id="dish-flag-vegan" ${ov?.checked&&avail.vegan?'checked':''} ${!avail.vegan?'disabled':''}> Веган${!avail.vegan?'<span style="color:#d9534f;font-size:0.8rem;"> (недоступен)</span>':''}</label>
        <label class="flag-option"><input type="checkbox" id="dish-flag-gluten" ${og?.checked&&avail.glutenFree?'checked':''} ${!avail.glutenFree?'disabled':''}> Без глютена${!avail.glutenFree?'<span style="color:#d9534f;font-size:0.8rem;"> (недоступен)</span>':''}</label>
        <label class="flag-option"><input type="checkbox" id="dish-flag-sugar" ${os?.checked&&avail.sugarFree?'checked':''} ${!avail.sugarFree?'disabled':''}> Без сахара${!avail.sugarFree?'<span style="color:#d9534f;font-size:0.8rem;"> (недоступен)</span>':''}</label>`;
}
function applyMacroToCategory() {
    const ni = document.getElementById('dish-name');
    const cs = document.getElementById('dish-category');
    if(!ni || !cs || cs.value) return;
    const name = ni.value.toLowerCase();
    for(const [macro, cat] of Object.entries(MACROS_MAP)) {
        if(name.includes(macro.toLowerCase())) { cs.value = cat; return; }
    }
}
function saveDish(event, dishId) {
    event.preventDefault();
    const ings = getIngredientsFromForm();
    if(!ings.length) { showToast('❌ Добавьте хотя бы один продукт!', 'error'); return; }
    const imagesStr = document.getElementById('dish-images').value.trim();
    const images = imagesStr ? imagesStr.split(',').map(s => s.trim()).filter(s=>s).slice(0,5) : [];
    let dishName = document.getElementById('dish-name').value.trim();
    let category = document.getElementById('dish-category').value;
    const catSet = category !== '';
    let firstMacro = null;
    for(const [macro, cat] of Object.entries(MACROS_MAP)) {
        const regex = new RegExp(macro.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        if(regex.test(dishName)) {
            if(!firstMacro) firstMacro = cat;
            dishName = dishName.replace(regex, '').trim();
        }
    }
    dishName = dishName.replace(/\s+/g, ' ').trim();
    if(dishName.length < 2) { showToast('❌ Название должно содержать минимум 2 символа (без макроса)!', 'error'); return; }
    if(!catSet && firstMacro) category = firstMacro;
    if(!category) { showToast('❌ Укажите категорию или используйте макрос!', 'error'); return; }
    const data = {
        name: dishName, images,
        calories: parseFloat(document.getElementById('dish-calories').value)||0,
        protein: parseFloat(document.getElementById('dish-protein').value)||0,
        fat: parseFloat(document.getElementById('dish-fat').value)||0,
        carbs: parseFloat(document.getElementById('dish-carbs').value)||0,
        ingredients: ings,
        portionSize: parseFloat(document.getElementById('dish-portion').value)||0,
        category,
        flags: {
            vegan: document.getElementById('dish-flag-vegan')?.checked||false,
            glutenFree: document.getElementById('dish-flag-gluten')?.checked||false,
            sugarFree: document.getElementById('dish-flag-sugar')?.checked||false
        }
    };
    const avail = store.getAvailableFlagsForDish(ings);
    if(data.flags.vegan && !avail.vegan) { showToast('❌ Флаг "Веган" недоступен!', 'error'); return; }
    if(data.flags.glutenFree && !avail.glutenFree) { showToast('❌ Флаг "Без глютена" недоступен!', 'error'); return; }
    if(data.flags.sugarFree && !avail.sugarFree) { showToast('❌ Флаг "Без сахара" недоступен!', 'error'); return; }
    if(data.portionSize > 0) {
        const pp = { protein: (data.protein/data.portionSize)*100, fat: (data.fat/data.portionSize)*100, carbs: (data.carbs/data.portionSize)*100 };
        if(pp.protein+pp.fat+pp.carbs > 100.001) { showToast('❌ Сумма БЖУ на 100 г блюда превышает 100 г!', 'error'); return; }
    }
    if(dishId) { store.updateDish(dishId, data); showToast('Блюдо обновлено ✅', 'success'); }
    else { store.addDish(data); showToast('Блюдо создано ✅', 'success'); }
    hideDishForm();
    renderDishes();
}
function deleteDish(id) {
    if(confirm('Удалить блюдо?')) { store.deleteDish(id); showToast('Блюдо удалено 🗑️', 'success'); renderDishes(); }
}