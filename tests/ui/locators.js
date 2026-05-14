var locators = {
    sidebar: {
        productsBtn: '.nav-btn[data-view="products"]',
        dishesBtn: '.nav-btn[data-view="dishes"]'
    },

    products: {
        addBtn: '#add-product-btn',
        formContainer: '#product-form-container',
        form: '#product-form',
        nameInput: '#prod-name',
        caloriesInput: '#prod-calories',
        proteinInput: '#prod-protein',
        fatInput: '#prod-fat',
        carbsInput: '#prod-carbs',
        compositionTextarea: '#prod-composition',
        categorySelect: '#prod-category',
        cookingSelect: '#prod-cooking',
        imagesInput: '#prod-images',
        veganCheckbox: '#prod-flag-vegan',
        glutenCheckbox: '#prod-flag-gluten',
        sugarCheckbox: '#prod-flag-sugar',
        submitBtn: '#product-form button[type="submit"]',
        cancelBtn: '#product-form button[type="button"]',
        searchInput: '#product-search',
        categoryFilter: '#product-category-filter',
        cookingFilter: '#product-cooking-filter',
        sortSelect: '#product-sort',
        sortAsc: '#sort-asc',
        sortDesc: '#sort-desc',
        list: '#products-list',
        cards: '#products-list .card',
        cardTitle: '.card-title',
        editBtn: '.card-actions .btn-secondary',
        deleteBtn: '.card-actions .btn-danger',
        toast: '#toast'
    },

    dishes: {
        addBtn: '#add-dish-btn',
        formContainer: '#dish-form-container',
        form: '#dish-form',
        nameInput: '#dish-name',
        portionInput: '#dish-portion',
        imagesInput: '#dish-images',
        caloriesInput: '#dish-calories',
        proteinInput: '#dish-protein',
        fatInput: '#dish-fat',
        carbsInput: '#dish-carbs',
        categorySelect: '#dish-category',
        ingredientProduct: '.ingredient-product',
        ingredientQuantity: '.ingredient-quantity',
        addIngredientBtnText: '+ Добавить продукт',
        recalcBtnText: 'Пересчитать',
        submitBtn: '#dish-form button[type="submit"]',
        cancelBtn: '#dish-form button[type="button"]',
        searchInput: '#dish-search',
        categoryFilter: '#dish-category-filter',
        list: '#dishes-list',
        cards: '#dishes-list .card',
        editBtn: '.card-actions .btn-secondary',
        deleteBtn: '.card-actions .btn-danger'
    },

    modal: {
        overlay: '#modal-overlay',
        title: '#modal-title',
        closeBtn: '.modal-close',
        content: '#modal-content'
    },

    toast: '#toast'
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = locators;
}