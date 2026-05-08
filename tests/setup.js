
const TEST_PRODUCTS = {
    water: {
        id: 'test-water',
        name: 'Вода',
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0
    },

    //целочисленные значения
    potato: {
        id: 'test-potato',
        name: 'Картофель',
        calories: 77,
        protein: 2,
        fat: 0.4,
        carbs: 16.3
    },

    //дробные значения с одним знаком после запятой
    meat: {
        id: 'test-meat',
        name: 'Мясо',
        calories: 187.2,
        protein: 18.9,
        fat: 12.4,
        carbs: 0
    },

    //граничные значения БЖУ
    boundary100: {
        id: 'test-boundary',
        name: 'ГраничныйПродукт',
        calories: 400,
        protein: 50,
        fat: 30,
        carbs: 20
    },

    //каждый макронутриент по 100 г (для теста валидации)
    maxEach: {
        id: 'test-max',
        name: 'Максимальный',
        calories: 900,
        protein: 100,
        fat: 100,
        carbs: 100
    }
};

const productsMap = {
    [TEST_PRODUCTS.water.id]: TEST_PRODUCTS.water,
    [TEST_PRODUCTS.potato.id]: TEST_PRODUCTS.potato,
    [TEST_PRODUCTS.meat.id]: TEST_PRODUCTS.meat,
    [TEST_PRODUCTS.boundary100.id]: TEST_PRODUCTS.boundary100,
    [TEST_PRODUCTS.maxEach.id]: TEST_PRODUCTS.maxEach
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TEST_PRODUCTS, productsMap };
}