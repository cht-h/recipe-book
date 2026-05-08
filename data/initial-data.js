const INITIAL_PRODUCTS = [
    {
        id: '1',
        name: 'Картофель',
        images: ['images/kartoshqa.png'],
        calories: 77,
        protein: 2,
        fat: 0.4,
        carbs: 16.3,
        composition: 'Клубни картофеля',
        category: 'Овощи',
        cookingRequired: 'Требует приготовления',
        flags: {
            vegan: true,
            glutenFree: true,
            sugarFree: true
        },
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: null
    },
    {
        id: '2',
        name: 'Вода',
        images: ['images/water.png'],
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        composition: 'Питьевая вода',
        category: 'Жидкость',
        cookingRequired: 'Готовый к употреблению',
        flags: {
            vegan: true,
            glutenFree: true,
            sugarFree: true
        },
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: null
    },
    {
        id: '3',
        name: 'Мясо',
        images: ['images/meat.jpeg', 'images/meat2.jpeg'], 
        calories: 187.2,
        protein: 18.9,
        fat: 12.4,
        carbs: 0,
        composition: 'Говядина',
        category: 'Мясной',
        cookingRequired: 'Требует приготовления',
        flags: {
            vegan: false,
            glutenFree: true,
            sugarFree: true
        },
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: null
    }
];

const PRODUCT_CATEGORIES = [
    'Замороженный', 'Мясной', 'Овощи', 'Зелень', 'Специи',
    'Крупы', 'Консервы', 'Жидкость', 'Сладости'
];

const COOKING_REQUIRED = [
    'Готовый к употреблению', 'Полуфабрикат', 'Требует приготовления'
];

const DISH_CATEGORIES = [
    'Десерт', 'Первое', 'Второе', 'Напиток', 'Салат', 'Суп', 'Перекус'
];

const MACROS_MAP = {
    '!десерт': 'Десерт',
    '!первое': 'Первое',
    '!второе': 'Второе',
    '!напиток': 'Напиток',
    '!салат': 'Салат',
    '!суп': 'Суп',
    '!перекус': 'Перекус'
};