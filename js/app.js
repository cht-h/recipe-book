var PRODUCT_CATEGORIES = ['Замороженный', 'Мясной', 'Овощи', 'Зелень', 'Специи', 'Крупы', 'Консервы', 'Жидкость', 'Сладости'];
var COOKING_REQUIRED = ['Готовый к употреблению', 'Полуфабрикат', 'Требует приготовления'];
var DISH_CATEGORIES = ['Десерт', 'Первое', 'Второе', 'Напиток', 'Салат', 'Суп', 'Перекус'];
var MACROS_MAP = { '!десерт': 'Десерт', '!первое': 'Первое', '!второе': 'Второе', '!напиток': 'Напиток', '!салат': 'Салат', '!суп': 'Суп', '!перекус': 'Перекус' };

class DataStore {
    constructor() {
        this.products = [];
        this.dishes = [];
        this.apiBase = '/api';
    }

    async loadData() {
        await this.fetchProducts();
        await this.fetchDishes();
    }

    async fetchProducts() {
        const res = await fetch(this.apiBase + '/products');
        this.products = await res.json();
    }

    async fetchDishes() {
        const res = await fetch(this.apiBase + '/dishes');
        this.dishes = await res.json();
    }

    async addProduct(product) {
        await fetch(this.apiBase + '/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });
        await this.fetchProducts();
    }

    async updateProduct(id, product) {
        await fetch(this.apiBase + '/products/' + id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });
        await this.fetchProducts();
    }

    async deleteProduct(id) {
        const res = await fetch(this.apiBase + '/products/' + id, { method: 'DELETE' });
        if (!res.ok) {
            const data = await res.json();
            return { success: false, dishes: data.dishes || [] };
        }
        await this.fetchProducts();
        await this.fetchDishes();
        return { success: true, dishes: [] };
    }

    getProductById(id) {
        return this.products.find(p => p.id === id);
    }

    async addDish(dish) {
        await fetch(this.apiBase + '/dishes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dish)
        });
        await this.fetchDishes();
    }

    async updateDish(id, dish) {
        await fetch(this.apiBase + '/dishes/' + id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dish)
        });
        await this.fetchDishes();
    }

    async deleteDish(id) {
        await fetch(this.apiBase + '/dishes/' + id, { method: 'DELETE' });
        await this.fetchDishes();
    }

    getDishById(id) {
        return this.dishes.find(d => d.id === id);
    }

    getAvailableFlagsForDish(ingredients) {
        if (!ingredients || ingredients.length === 0) {
            return { vegan: false, glutenFree: false, sugarFree: false };
        }
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

function showToast(message, type) {
    type = type || 'info';
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast ' + type;
    toast.classList.remove('hidden');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(function() { toast.classList.add('hidden'); }, 3500);
}

function showModal(title, content) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-content').innerHTML = content;
    document.getElementById('modal-overlay').classList.remove('hidden');
    setTimeout(function() {
        document.querySelectorAll('.modal-carousel').forEach(function(c) { initCarousel(c); });
    }, 10);
}

function hideModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
}

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(String(str)));
    return div.innerHTML;
}

function escapeAttr(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function initCarousel(container) {
    if (!container || container.dataset.carouselInited) return;
    container.dataset.carouselInited = 'true';
    var imagesWrap = container.querySelector('.card-carousel-images, .modal-carousel-images');
    var dotsContainer = container.querySelector('.carousel-dots');
    var prevBtn = container.querySelector('.carousel-btn.prev');
    var nextBtn = container.querySelector('.carousel-btn.next');
    var slides = imagesWrap ? imagesWrap.children : [];
    if (!imagesWrap || slides.length <= 1) {
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
        if (dotsContainer) dotsContainer.style.display = 'none';
        return;
    }
    var currentIndex = 0;
    function goTo(index) {
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;
        currentIndex = index;
        imagesWrap.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';
        if (dotsContainer) {
            var dots = dotsContainer.querySelectorAll('.carousel-dot');
            for (var i = 0; i < dots.length; i++) {
                dots[i].classList.toggle('active', i === currentIndex);
            }
        }
    }
    if (prevBtn) prevBtn.addEventListener('click', function(e) { e.stopPropagation(); goTo(currentIndex - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function(e) { e.stopPropagation(); goTo(currentIndex + 1); });
    if (dotsContainer) {
        dotsContainer.innerHTML = '';
        for (var i = 0; i < slides.length; i++) {
            var dot = document.createElement('button');
            dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
            (function(idx) {
                dot.addEventListener('click', function(e) { e.stopPropagation(); goTo(idx); });
            })(i);
            dotsContainer.appendChild(dot);
        }
    }
}

function buildCarouselHtml(images, noImageContent, carouselClass, imagesClass) {
    carouselClass = carouselClass || 'card-carousel';
    imagesClass = imagesClass || 'card-carousel-images';
    if (!images || images.length === 0) {
        return '<div class="' + carouselClass + '"><div class="' + imagesClass + '"><div class="card-carousel-no-image">' + noImageContent + '</div></div></div>';
    }
    if (images.length === 1) {
        return '<div class="' + carouselClass + '"><div class="' + imagesClass + '"><img src="' + escapeAttr(images[0]) + '" alt="" onerror="this.style.display=\'none\'; this.parentElement.innerHTML=\'<div class=&quot;card-carousel-no-image&quot;>' + noImageContent + '</div>\';"></div></div>';
    }
    var html = '<div class="' + carouselClass + '">';
    html += '<button class="carousel-btn prev">&lsaquo;</button>';
    html += '<button class="carousel-btn next">&rsaquo;</button>';
    html += '<div class="carousel-dots"></div>';
    html += '<div class="' + imagesClass + '">';
    for (var j = 0; j < images.length; j++) {
        html += '<img src="' + escapeAttr(images[j]) + '" alt="" onerror="this.style.display=\'none\';">';
    }
    html += '</div></div>';
    return html;
}

var sortState = { field: 'name', direction: 'asc' };

document.addEventListener('DOMContentLoaded', async function() {
    await store.loadData();

    document.querySelectorAll('.nav-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.nav-btn').forEach(function(b) { b.classList.remove('active'); });
            document.querySelectorAll('.view').forEach(function(v) { v.classList.remove('active'); });
            btn.classList.add('active');
            document.getElementById(btn.dataset.view + '-view').classList.add('active');
        });
    });

    document.querySelector('.modal-overlay').addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-overlay')) hideModal();
    });
    document.querySelector('.modal-close').addEventListener('click', hideModal);
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape') hideModal(); });

    document.getElementById('add-product-btn').addEventListener('click', function() { showProductForm(); });
    document.getElementById('add-dish-btn').addEventListener('click', function() { showDishForm(); });

    document.getElementById('product-search').addEventListener('input', renderProducts);
    document.getElementById('dish-search').addEventListener('input', renderDishes);
    document.getElementById('product-category-filter').addEventListener('change', renderProducts);
    document.getElementById('product-cooking-filter').addEventListener('change', renderProducts);
    document.querySelectorAll('#products-view .flag-filter').forEach(function(cb) { cb.addEventListener('change', renderProducts); });
    document.getElementById('dish-category-filter').addEventListener('change', renderDishes);
    document.querySelectorAll('#dishes-view .dish-flag-filter').forEach(function(cb) { cb.addEventListener('change', renderDishes); });

    document.getElementById('product-sort').addEventListener('change', function(e) {
        sortState.field = e.target.value;
        sortState.direction = 'asc';
        updateSortButtons();
        renderProducts();
    });
    document.getElementById('sort-asc').addEventListener('click', function() { sortState.direction = 'asc'; updateSortButtons(); renderProducts(); });
    document.getElementById('sort-desc').addEventListener('click', function() { sortState.direction = 'desc'; updateSortButtons(); renderProducts(); });

    populateFilters();
    renderProducts();
    renderDishes();
});

function updateSortButtons() {
    document.getElementById('sort-asc').classList.toggle('active', sortState.direction === 'asc');
    document.getElementById('sort-desc').classList.toggle('active', sortState.direction === 'desc');
}

function populateFilters() {
    var pcf = document.getElementById('product-category-filter');
    PRODUCT_CATEGORIES.forEach(function(c) { var o = document.createElement('option'); o.value = c; o.textContent = c; pcf.appendChild(o); });
    var cf = document.getElementById('product-cooking-filter');
    COOKING_REQUIRED.forEach(function(c) { var o = document.createElement('option'); o.value = c; o.textContent = c; cf.appendChild(o); });
    var dcf = document.getElementById('dish-category-filter');
    DISH_CATEGORIES.forEach(function(c) { var o = document.createElement('option'); o.value = c; o.textContent = c; dcf.appendChild(o); });
}

function renderProducts() {
    var container = document.getElementById('products-list');
    if (!container) return;
    var searchTerm = (document.getElementById('product-search').value || '').toLowerCase();
    var catFilter = document.getElementById('product-category-filter').value || '';
    var cookFilter = document.getElementById('product-cooking-filter').value || '';
    var flagFilters = [];
    document.querySelectorAll('#products-view .flag-filter:checked').forEach(function(cb) { flagFilters.push(cb.value); });

    var filtered = store.products.filter(function(p) {
        if (searchTerm && p.name.toLowerCase().indexOf(searchTerm) === -1) return false;
        if (catFilter && p.category !== catFilter) return false;
        if (cookFilter && p.cookingRequired !== cookFilter) return false;
        if (flagFilters.indexOf('vegan') !== -1 && !p.flags.vegan) return false;
        if (flagFilters.indexOf('glutenFree') !== -1 && !p.flags.glutenFree) return false;
        if (flagFilters.indexOf('sugarFree') !== -1 && !p.flags.sugarFree) return false;
        return true;
    });

    var dir = sortState.direction === 'asc' ? 1 : -1;
    filtered.sort(function(a, b) {
        switch (sortState.field) {
            case 'name': return a.name.localeCompare(b.name, 'ru') * dir;
            case 'calories': return ((a.calories || 0) - (b.calories || 0)) * dir;
            case 'protein': return ((a.protein || 0) - (b.protein || 0)) * dir;
            case 'fat': return ((a.fat || 0) - (b.fat || 0)) * dir;
            case 'carbs': return ((a.carbs || 0) - (b.carbs || 0)) * dir;
        }
        return 0;
    });

    if (filtered.length === 0) {
        container.innerHTML = '<p style="color:#999;text-align:center;padding:40px;grid-column:1/-1;">Продукты не найдены</p>';
        return;
    }

    container.innerHTML = filtered.map(function(p) {
        var tags = '';
        if (p.flags.vegan) tags += '<span class="tag tag-vegan">Веган</span>';
        if (p.flags.glutenFree) tags += '<span class="tag tag-gluten-free">Без глютена</span>';
        if (p.flags.sugarFree) tags += '<span class="tag tag-sugar-free">Без сахара</span>';
        var carouselHtml = buildCarouselHtml(p.images, '📷');
        return '<div class="card" onclick="showProductDetail(\'' + p.id + '\')">' + carouselHtml +
            '<div class="card-body">' +
            '<h3 class="card-title">' + escapeHtml(p.name) + '</h3>' +
            '<div class="card-tags">' + tags + '</div>' +
            '<div class="card-info"><span class="card-info-item">' + p.calories + ' ккал</span><span class="card-info-item">Б: ' + p.protein + '</span><span class="card-info-item">Ж: ' + p.fat + '</span><span class="card-info-item">У: ' + p.carbs + '</span><span class="card-info-item tag-category">' + p.category + '</span></div>' +
            '<div class="card-time">Создан: ' + formatDate(p.createdAt) + (p.updatedAt ? '<br>Изменён: ' + formatDate(p.updatedAt) : '') + '</div>' +
            '<div class="card-actions" onclick="event.stopPropagation();">' +
            '<button class="btn btn-secondary btn-sm" onclick="editProduct(\'' + p.id + '\')">✏️ Ред.</button>' +
            '<button class="btn btn-danger btn-sm" onclick="deleteProduct(\'' + p.id + '\')">🗑️ Удалить</button>' +
            '</div></div></div>';
    }).join('');

    document.querySelectorAll('#products-list .card-carousel').forEach(function(c) { initCarousel(c); });
}

function renderDishes() {
    var container = document.getElementById('dishes-list');
    if (!container) return;
    var searchTerm = (document.getElementById('dish-search').value || '').toLowerCase();
    var catFilter = document.getElementById('dish-category-filter').value || '';
    var flagFilters = [];
    document.querySelectorAll('#dishes-view .dish-flag-filter:checked').forEach(function(cb) { flagFilters.push(cb.value); });

    var filtered = store.dishes.filter(function(d) {
        if (searchTerm && d.name.toLowerCase().indexOf(searchTerm) === -1) return false;
        if (catFilter && d.category !== catFilter) return false;
        if (flagFilters.indexOf('vegan') !== -1 && !d.flags.vegan) return false;
        if (flagFilters.indexOf('glutenFree') !== -1 && !d.flags.glutenFree) return false;
        if (flagFilters.indexOf('sugarFree') !== -1 && !d.flags.sugarFree) return false;
        return true;
    });

    if (filtered.length === 0) {
        container.innerHTML = '<p style="color:#999;text-align:center;padding:40px;grid-column:1/-1;">Блюда не найдены</p>';
        return;
    }

    container.innerHTML = filtered.map(function(d) {
        var tags = '';
        if (d.flags.vegan) tags += '<span class="tag tag-vegan">Веган</span>';
        if (d.flags.glutenFree) tags += '<span class="tag tag-gluten-free">Без глютена</span>';
        if (d.flags.sugarFree) tags += '<span class="tag tag-sugar-free">Без сахара</span>';
        var carouselHtml = buildCarouselHtml(d.images, '🍽️');
        return '<div class="card" onclick="showDishDetail(\'' + d.id + '\')">' + carouselHtml +
            '<div class="card-body">' +
            '<h3 class="card-title">' + escapeHtml(d.name) + '</h3>' +
            '<div class="card-tags">' + tags + '</div>' +
            '<div class="card-info"><span class="card-info-item">' + d.calories + ' ккал/порц</span><span class="card-info-item">Б: ' + d.protein + '</span><span class="card-info-item">Ж: ' + d.fat + '</span><span class="card-info-item">У: ' + d.carbs + '</span><span class="card-info-item tag-category">' + d.category + '</span><span class="card-info-item">' + d.portionSize + ' г</span></div>' +
            '<div class="card-time">Создан: ' + formatDate(d.createdAt) + (d.updatedAt ? '<br>Изменён: ' + formatDate(d.updatedAt) : '') + '</div>' +
            '<div class="card-actions" onclick="event.stopPropagation();">' +
            '<button class="btn btn-secondary btn-sm" onclick="editDish(\'' + d.id + '\')">✏️ Ред.</button>' +
            '<button class="btn btn-danger btn-sm" onclick="deleteDish(\'' + d.id + '\')">🗑️ Удалить</button>' +
            '</div></div></div>';
    }).join('');

    document.querySelectorAll('#dishes-list .card-carousel').forEach(function(c) { initCarousel(c); });
}

function showProductDetail(id) {
    var p = store.getProductById(id);
    if (!p) { showToast('Продукт не найден', 'error'); return; }
    var carouselHtml = buildCarouselHtml(p.images, '📷', 'modal-carousel', 'modal-carousel-images');
    var flags = [];
    if (p.flags.vegan) flags.push('Веган');
    if (p.flags.glutenFree) flags.push('Без глютена');
    if (p.flags.sugarFree) flags.push('Без сахара');
    var content = carouselHtml +
        '<div class="modal-detail"><strong>Калорийность:</strong> <span>' + p.calories + ' ккал / 100 г</span></div>' +
        '<div class="modal-detail"><strong>Белки:</strong> <span>' + p.protein + ' г / 100 г</span></div>' +
        '<div class="modal-detail"><strong>Жиры:</strong> <span>' + p.fat + ' г / 100 г</span></div>' +
        '<div class="modal-detail"><strong>Углеводы:</strong> <span>' + p.carbs + ' г / 100 г</span></div>' +
        '<div class="modal-detail"><strong>Состав:</strong> <span>' + escapeHtml(p.composition || 'Не указан') + '</span></div>' +
        '<div class="modal-detail"><strong>Категория:</strong> <span>' + p.category + '</span></div>' +
        '<div class="modal-detail"><strong>Готовность:</strong> <span>' + p.cookingRequired + '</span></div>' +
        '<div class="modal-detail"><strong>Флаги:</strong> <span>' + (flags.length ? flags.join(', ') : 'Нет') + '</span></div>' +
        '<div style="margin-top:16px;padding-top:16px;border-top:1px solid #e0e0e0;">' +
        '<div class="modal-detail"><strong>Создан:</strong> <span>' + formatDate(p.createdAt) + '</span></div>' +
        (p.updatedAt ? '<div class="modal-detail"><strong>Изменён:</strong> <span>' + formatDate(p.updatedAt) + '</span></div>' : '') +
        '</div>';
    showModal(p.name, content);
}

function showDishDetail(id) {
    var d = store.getDishById(id);
    if (!d) { showToast('Блюдо не найдено', 'error'); return; }
    var carouselHtml = buildCarouselHtml(d.images, '🍽️', 'modal-carousel', 'modal-carousel-images');
    var flags = [];
    if (d.flags.vegan) flags.push('Веган');
    if (d.flags.glutenFree) flags.push('Без глютена');
    if (d.flags.sugarFree) flags.push('Без сахара');
    var ingsHtml = '';
    if (d.ingredients && d.ingredients.length > 0) {
        for (var i = 0; i < d.ingredients.length; i++) {
            var ing = d.ingredients[i];
            var prod = store.getProductById(ing.productId);
            ingsHtml += '<div class="modal-detail">&bull; ' + escapeHtml(prod ? prod.name : '(продукт удалён)') + ' &mdash; ' + ing.quantity + ' г</div>';
        }
    } else {
        ingsHtml = '<div class="modal-detail">Состав не указан</div>';
    }
    var content = carouselHtml +
        '<div class="modal-detail"><strong>Калорийность:</strong> <span>' + d.calories + ' ккал / порция</span></div>' +
        '<div class="modal-detail"><strong>Белки:</strong> <span>' + d.protein + ' г / порция</span></div>' +
        '<div class="modal-detail"><strong>Жиры:</strong> <span>' + d.fat + ' г / порция</span></div>' +
        '<div class="modal-detail"><strong>Углеводы:</strong> <span>' + d.carbs + ' г / порция</span></div>' +
        '<div class="modal-detail"><strong>Размер порции:</strong> <span>' + d.portionSize + ' г</span></div>' +
        '<div class="modal-detail"><strong>Категория:</strong> <span>' + d.category + '</span></div>' +
        '<div class="modal-detail"><strong>Флаги:</strong> <span>' + (flags.length ? flags.join(', ') : 'Нет') + '</span></div>' +
        '<div class="modal-section-title">Состав:</div>' + ingsHtml +
        '<div style="margin-top:16px;padding-top:16px;border-top:1px solid #e0e0e0;">' +
        '<div class="modal-detail"><strong>Создан:</strong> <span>' + formatDate(d.createdAt) + '</span></div>' +
        (d.updatedAt ? '<div class="modal-detail"><strong>Изменён:</strong> <span>' + formatDate(d.updatedAt) + '</span></div>' : '') +
        '</div>';
    showModal(d.name, content);
}

function showProductForm(productId) {
    var container = document.getElementById('product-form-container');
    var isEdit = productId !== null && productId !== undefined && productId !== '';
    var product = isEdit ? store.getProductById(productId) : null;
    var title = isEdit ? 'Редактировать продукт' : 'Новый продукт';

    var cats = '';
    PRODUCT_CATEGORIES.forEach(function(c) { cats += '<option value="' + c + '"' + ((product && product.category === c) ? ' selected' : '') + '>' + c + '</option>'; });
    var cooks = '';
    COOKING_REQUIRED.forEach(function(c) { cooks += '<option value="' + c + '"' + ((product && product.cookingRequired === c) ? ' selected' : '') + '>' + c + '</option>'; });

    container.innerHTML = '<h3>' + title + '</h3>' +
        '<form id="product-form" onsubmit="saveProduct(event, \'' + (isEdit ? productId : '') + '\')">' +
        '<div class="form-row"><div class="form-group"><label>Название * (мин. 2 символа)</label><input type="text" id="prod-name" value="' + escapeAttr(product ? product.name : '') + '" required minlength="2"></div>' +
        '<div class="form-group"><label>Категория *</label><select id="prod-category" required><option value="">-- Выберите --</option>' + cats + '</select></div></div>' +
        '<div class="form-row"><div class="form-group"><label>Калорийность * (ккал / 100 г)</label><input type="number" id="prod-calories" value="' + (product ? product.calories : '') + '" required min="0" step="any"></div>' +
        '<div class="form-group"><label>Белки * (г / 100 г)</label><input type="number" id="prod-protein" value="' + (product ? product.protein : '') + '" required min="0" max="100" step="any"></div>' +
        '<div class="form-group"><label>Жиры * (г / 100 г)</label><input type="number" id="prod-fat" value="' + (product ? product.fat : '') + '" required min="0" max="100" step="any"></div>' +
        '<div class="form-group"><label>Углеводы * (г / 100 г)</label><input type="number" id="prod-carbs" value="' + (product ? product.carbs : '') + '" required min="0" max="100" step="any"></div></div>' +
        '<div class="form-row"><div class="form-group"><label>Состав (опционально)</label><textarea id="prod-composition">' + escapeHtml(product ? (product.composition || '') : '') + '</textarea></div></div>' +
        '<div class="form-row"><div class="form-group"><label>Необходимость готовки *</label><select id="prod-cooking" required><option value="">-- Выберите --</option>' + cooks + '</select></div></div>' +
        '<div class="form-row"><div class="form-group"><label>Изображения (через запятую, макс. 5)</label><input type="text" id="prod-images" value="' + escapeAttr(product && product.images ? product.images.join(', ') : '') + '" placeholder="images/photo1.png"></div></div>' +
        '<div class="form-row"><div class="form-group"><label>Флаги:</label><div class="flags-group">' +
        '<label class="flag-option"><input type="checkbox" id="prod-flag-vegan"' + (product && product.flags.vegan ? ' checked' : '') + '> Веган</label>' +
        '<label class="flag-option"><input type="checkbox" id="prod-flag-gluten"' + (product && product.flags.glutenFree ? ' checked' : '') + '> Без глютена</label>' +
        '<label class="flag-option"><input type="checkbox" id="prod-flag-sugar"' + (product && product.flags.sugarFree ? ' checked' : '') + '> Без сахара</label>' +
        '</div></div></div>' +
        '<div class="form-actions"><button type="submit" class="btn btn-primary">' + (isEdit ? '💾 Сохранить' : '➕ Создать') + '</button>' +
        '<button type="button" class="btn btn-secondary" onclick="hideProductForm()">Отмена</button></div></form>';
    container.classList.remove('hidden');
    container.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function hideProductForm() {
    var c = document.getElementById('product-form-container');
    c.classList.add('hidden');
    c.innerHTML = '';
}

function editProduct(id) { showProductForm(id); }

async function saveProduct(event, productId) {
    event.preventDefault();
    var protein = parseFloat(document.getElementById('prod-protein').value) || 0;
    var fat = parseFloat(document.getElementById('prod-fat').value) || 0;
    var carbs = parseFloat(document.getElementById('prod-carbs').value) || 0;
    if (protein + fat + carbs > 100.001) { showToast('Сумма БЖУ на 100 г не может превышать 100 г!', 'error'); return; }
    var imagesStr = document.getElementById('prod-images').value.trim();
    var images = imagesStr ? imagesStr.split(',').map(function(s) { return s.trim(); }).filter(function(s) { return s.length > 0; }).slice(0, 5) : [];
    var data = {
        name: document.getElementById('prod-name').value.trim(),
        images: images,
        calories: parseFloat(document.getElementById('prod-calories').value) || 0,
        protein: protein, fat: fat, carbs: carbs,
        composition: document.getElementById('prod-composition').value.trim() || null,
        category: document.getElementById('prod-category').value,
        cookingRequired: document.getElementById('prod-cooking').value,
        flags: {
            vegan: document.getElementById('prod-flag-vegan').checked,
            glutenFree: document.getElementById('prod-flag-gluten').checked,
            sugarFree: document.getElementById('prod-flag-sugar').checked
        }
    };
    if (productId) { await store.updateProduct(productId, data); showToast('Продукт обновлён', 'success'); }
    else { await store.addProduct(data); showToast('Продукт создан', 'success'); }
    hideProductForm();
    renderProducts();
}

async function deleteProduct(id) {
    var r = await store.deleteProduct(id);
    if (!r.success) { showToast('Продукт используется в: ' + r.dishes.map(function(d) { return '«' + d + '»'; }).join(', '), 'error'); return; }
    showToast('Продукт удалён', 'success');
    renderProducts();
    renderDishes();
}

function showDishForm(dishId) {
    var container = document.getElementById('dish-form-container');
    var isEdit = dishId !== null && dishId !== undefined && dishId !== '';
    var dish = isEdit ? store.getDishById(dishId) : null;
    var title = isEdit ? 'Редактировать блюдо' : 'Новое блюдо';

    var dishCats = '';
    DISH_CATEGORIES.forEach(function(c) { dishCats += '<option value="' + c + '"' + (dish && dish.category === c ? ' selected' : '') + '>' + c + '</option>'; });

    var ingHtml = '<div id="ingredients-container">';
    var existing = (dish && dish.ingredients && dish.ingredients.length) ? dish.ingredients : [{ productId: '', quantity: '' }];
    existing.forEach(function(ing) {
        var prodOpts = '<option value="">-- Выберите --</option>';
        store.products.forEach(function(p) { prodOpts += '<option value="' + p.id + '"' + (ing.productId === p.id ? ' selected' : '') + '>' + escapeHtml(p.name) + '</option>'; });
        ingHtml += '<div class="ingredient-row"><div class="form-group"><label>Продукт *</label><select class="ingredient-product" required>' + prodOpts + '</select></div>' +
            '<div class="form-group"><label>Кол-во (г) *</label><input type="number" class="ingredient-quantity" value="' + (ing.quantity || '') + '" required min="0.01" step="any"></div>' +
            '<button type="button" class="btn btn-danger btn-sm" onclick="removeIngredientRow(this)"' + (existing.length <= 1 ? ' style="display:none"' : '') + '>&times;</button></div>';
    });
    ingHtml += '</div><button type="button" class="btn btn-secondary btn-sm" onclick="addIngredientRow()" style="margin-top:8px;">+ Добавить продукт</button>';

    container.innerHTML = '<h3>' + title + '</h3>' +
        '<form id="dish-form" onsubmit="saveDish(event, \'' + (isEdit ? dishId : '') + '\')">' +
        '<div class="form-row"><div class="form-group"><label>Название * (макросы: !десерт, !первое, !второе, !напиток, !салат, !суп, !перекус)</label><input type="text" id="dish-name" value="' + escapeAttr(dish ? dish.name : '') + '" required minlength="2"></div>' +
        '<div class="form-group"><label>Категория (если не выбрана — из макроса)</label><select id="dish-category"><option value="">-- Авто --</option>' + dishCats + '</select></div></div>' +
        '<div class="form-row"><div class="form-group"><label>Размер порции (г) *</label><input type="number" id="dish-portion" value="' + (dish ? dish.portionSize : '') + '" required min="0.01" step="any"></div></div>' +
        '<div class="form-row"><div class="form-group"><label>Изображения (через запятую, макс. 5)</label><input type="text" id="dish-images" value="' + escapeAttr(dish && dish.images ? dish.images.join(', ') : '') + '" placeholder="images/photo1.png"></div></div>' +
        '<h4>Состав блюда *</h4>' + ingHtml +
        '<h4>КБЖУ на порцию</h4>' +
        '<div class="form-row"><div class="form-group"><label>Калорийность</label><input type="number" id="dish-calories" value="' + (dish ? dish.calories : '') + '" required min="0" step="any"></div>' +
        '<div class="form-group"><label>Белки</label><input type="number" id="dish-protein" value="' + (dish ? dish.protein : '') + '" required min="0" step="any"></div>' +
        '<div class="form-group"><label>Жиры</label><input type="number" id="dish-fat" value="' + (dish ? dish.fat : '') + '" required min="0" step="any"></div>' +
        '<div class="form-group"><label>Углеводы</label><input type="number" id="dish-carbs" value="' + (dish ? dish.carbs : '') + '" required min="0" step="any"></div></div>' +
        '<div class="form-row"><div class="form-group"><label>Флаги:</label><div class="flags-group" id="dish-flags-checkboxes"></div></div></div>' +
        '<div class="form-actions"><button type="submit" class="btn btn-primary">' + (isEdit ? '💾 Сохранить' : '➕ Создать') + '</button>' +
        '<button type="button" class="btn btn-secondary" onclick="hideDishForm()">Отмена</button>' +
        '<button type="button" class="btn btn-secondary" onclick="recalculateDishForm()">🔄 Пересчитать</button></div></form>';
    container.classList.remove('hidden');
    container.scrollIntoView({ behavior: 'smooth', block: 'center' });
    updateDishFlagsAvailability();
    if (!isEdit) recalculateDishForm(true);
    attachIngredientListeners();
    setTimeout(function() { var ni = document.getElementById('dish-name'); if (ni) ni.addEventListener('input', applyMacroToCategory); }, 100);
}

function hideDishForm() { var c = document.getElementById('dish-form-container'); c.classList.add('hidden'); c.innerHTML = ''; }
function editDish(id) { showDishForm(id); }

function addIngredientRow() {
    var c = document.getElementById('ingredients-container');
    if (!c) return;
    var row = document.createElement('div');
    row.className = 'ingredient-row';
    var prodOpts = '<option value="">-- Выберите --</option>';
    store.products.forEach(function(p) { prodOpts += '<option value="' + p.id + '">' + escapeHtml(p.name) + '</option>'; });
    row.innerHTML = '<div class="form-group"><label>Продукт *</label><select class="ingredient-product" required>' + prodOpts + '</select></div>' +
        '<div class="form-group"><label>Кол-во (г) *</label><input type="number" class="ingredient-quantity" required min="0.01" step="any"></div>' +
        '<button type="button" class="btn btn-danger btn-sm" onclick="removeIngredientRow(this)">&times;</button>';
    c.appendChild(row);
    attachIngredientListeners();
}

function removeIngredientRow(btn) {
    var c = document.getElementById('ingredients-container');
    if (!c || c.children.length <= 1) return;
    btn.closest('.ingredient-row').remove();
    recalculateDishForm();
    updateDishFlagsAvailability();
}

function attachIngredientListeners() {
    document.querySelectorAll('.ingredient-product, .ingredient-quantity').forEach(function(el) {
        el.removeEventListener('change', onIngredientChange);
        el.addEventListener('change', onIngredientChange);
    });
}

function onIngredientChange() { recalculateDishForm(); updateDishFlagsAvailability(); }

function getIngredientsFromForm() {
    var rows = document.querySelectorAll('.ingredient-row');
    var ings = [];
    rows.forEach(function(row) {
        var sel = row.querySelector('.ingredient-product');
        var qty = row.querySelector('.ingredient-quantity');
        if (sel && sel.value && qty && qty.value) ings.push({ productId: sel.value, quantity: parseFloat(qty.value) });
    });
    return ings;
}

function recalculateDishForm(silent) {
    silent = silent || false;
    var ings = getIngredientsFromForm();
    if (!ings.length) return;
    var n = store.calculateNutrition(ings);
    document.getElementById('dish-calories').value = n.calories;
    document.getElementById('dish-protein').value = n.protein;
    document.getElementById('dish-fat').value = n.fat;
    document.getElementById('dish-carbs').value = n.carbs;
    if (!silent) showToast('КБЖУ пересчитаны', 'info');
}

function updateDishFlagsAvailability() {
    var container = document.getElementById('dish-flags-checkboxes');
    if (!container) return;
    var ings = getIngredientsFromForm();
    var avail = store.getAvailableFlagsForDish(ings);
    var ov = document.getElementById('dish-flag-vegan');
    var og = document.getElementById('dish-flag-gluten');
    var os = document.getElementById('dish-flag-sugar');
    container.innerHTML = '<label class="flag-option"><input type="checkbox" id="dish-flag-vegan"' + (ov && ov.checked && avail.vegan ? ' checked' : '') + (avail.vegan ? '' : ' disabled') + '> Веган' + (avail.vegan ? '' : ' <span style="color:#d9534f;font-size:0.8rem;">(недоступен)</span>') + '</label>' +
        '<label class="flag-option"><input type="checkbox" id="dish-flag-gluten"' + (og && og.checked && avail.glutenFree ? ' checked' : '') + (avail.glutenFree ? '' : ' disabled') + '> Без глютена' + (avail.glutenFree ? '' : ' <span style="color:#d9534f;font-size:0.8rem;">(недоступен)</span>') + '</label>' +
        '<label class="flag-option"><input type="checkbox" id="dish-flag-sugar"' + (os && os.checked && avail.sugarFree ? ' checked' : '') + (avail.sugarFree ? '' : ' disabled') + '> Без сахара' + (avail.sugarFree ? '' : ' <span style="color:#d9534f;font-size:0.8rem;">(недоступен)</span>') + '</label>';
}

function applyMacroToCategory() {
    var ni = document.getElementById('dish-name');
    var cs = document.getElementById('dish-category');
    if (!ni || !cs || cs.value) return;
    var name = ni.value.toLowerCase();
    for (var macro in MACROS_MAP) {
        if (name.indexOf(macro.toLowerCase()) !== -1) { cs.value = MACROS_MAP[macro]; return; }
    }
}

async function saveDish(event, dishId) {
    event.preventDefault();
    var ings = getIngredientsFromForm();
    if (!ings.length) { showToast('Добавьте хотя бы один продукт!', 'error'); return; }
    var imagesStr = document.getElementById('dish-images').value.trim();
    var images = imagesStr ? imagesStr.split(',').map(function(s) { return s.trim(); }).filter(function(s) { return s; }).slice(0, 5) : [];
    var dishName = document.getElementById('dish-name').value.trim();
    var category = document.getElementById('dish-category').value;
    var catSet = category !== '';
    var firstMacro = null;
    for (var macro in MACROS_MAP) {
        var regex = new RegExp(macro.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        if (regex.test(dishName)) {
            if (!firstMacro) firstMacro = MACROS_MAP[macro];
            dishName = dishName.replace(regex, '').trim();
        }
    }
    dishName = dishName.replace(/\s+/g, ' ').trim();
    if (dishName.length < 2) { showToast('Название должно содержать минимум 2 символа!', 'error'); return; }
    if (!catSet && firstMacro) category = firstMacro;
    if (!category) { showToast('Укажите категорию или используйте макрос!', 'error'); return; }
    var data = {
        name: dishName, images: images,
        calories: parseFloat(document.getElementById('dish-calories').value) || 0,
        protein: parseFloat(document.getElementById('dish-protein').value) || 0,
        fat: parseFloat(document.getElementById('dish-fat').value) || 0,
        carbs: parseFloat(document.getElementById('dish-carbs').value) || 0,
        ingredients: ings,
        portionSize: parseFloat(document.getElementById('dish-portion').value) || 0,
        category: category,
        flags: {
            vegan: document.getElementById('dish-flag-vegan') ? document.getElementById('dish-flag-vegan').checked : false,
            glutenFree: document.getElementById('dish-flag-gluten') ? document.getElementById('dish-flag-gluten').checked : false,
            sugarFree: document.getElementById('dish-flag-sugar') ? document.getElementById('dish-flag-sugar').checked : false
        }
    };
    var avail = store.getAvailableFlagsForDish(ings);
    if (data.flags.vegan && !avail.vegan) { showToast('Флаг "Веган" недоступен!', 'error'); return; }
    if (data.flags.glutenFree && !avail.glutenFree) { showToast('Флаг "Без глютена" недоступен!', 'error'); return; }
    if (data.flags.sugarFree && !avail.sugarFree) { showToast('Флаг "Без сахара" недоступен!', 'error'); return; }
    if (data.portionSize > 0) {
        var pp = { protein: (data.protein / data.portionSize) * 100, fat: (data.fat / data.portionSize) * 100, carbs: (data.carbs / data.portionSize) * 100 };
        if (pp.protein + pp.fat + pp.carbs > 100.001) { showToast('Сумма БЖУ на 100 г блюда превышает 100 г!', 'error'); return; }
    }
    if (dishId) { await store.updateDish(dishId, data); showToast('Блюдо обновлено', 'success'); }
    else { await store.addDish(data); showToast('Блюдо создано', 'success'); }
    hideDishForm();
    renderDishes();
}

async function deleteDish(id) {
    if (confirm('Удалить блюдо?')) { await store.deleteDish(id); showToast('Блюдо удалено', 'success'); renderDishes(); }
}