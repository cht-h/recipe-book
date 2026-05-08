const { calculateNutrition } = require('../js/calculator.js');
const { productsMap, TEST_PRODUCTS } = require('./setup.js');

describe('calculateNutrition — расчёт КБЖУ блюда', () => {


    describe('Пустой состав (ingredients = [])', () => {
        test('возвращает нули для пустого массива', () => {
            const result = calculateNutrition([], productsMap);

            expect(result).toEqual({
                calories: 0,
                protein: 0,
                fat: 0,
                carbs: 0
            });
        });
    });

    describe('Один продукт: количество = 100 г', () => {
        test('ровно 100 г продукта возвращает его КБЖУ без изменений', () => {
            const ingredients = [
                { productId: TEST_PRODUCTS.potato.id, quantity: 100 }
            ];

            const result = calculateNutrition(ingredients, productsMap);

            expect(result.calories).toBe(77);
            expect(result.protein).toBe(2);
            expect(result.fat).toBe(0.4);
            expect(result.carbs).toBe(16.3);
        });
    });

    describe('Один продукт: количество = 0 г (нижняя граница)', () => {
        test('0 г продукта даёт нулевые значения КБЖУ', () => {
            const ingredients = [
                { productId: TEST_PRODUCTS.meat.id, quantity: 0 }
            ];

            const result = calculateNutrition(ingredients, productsMap);

            expect(result.calories).toBe(0);
            expect(result.protein).toBe(0);
            expect(result.fat).toBe(0);
            expect(result.carbs).toBe(0);
        });
    });

    describe('Один продукт: количество = 50 г (половина от 100 г)', () => {
        test('половина порции — половина КБЖУ с округлением', () => {
            const ingredients = [
                { productId: TEST_PRODUCTS.meat.id, quantity: 50 }
            ];

            const result = calculateNutrition(ingredients, productsMap);

            expect(result.calories).toBe(93.6);
            expect(result.protein).toBe(9.5); 
            expect(result.fat).toBe(6.2);
            expect(result.carbs).toBe(0);
        });
    });

    describe('Один продукт: количество = 200 г (ровно 2×100 г)', () => {
        test('200 г — удвоенные значения КБЖУ', () => {
            const ingredients = [
                { productId: TEST_PRODUCTS.potato.id, quantity: 200 }
            ];

            const result = calculateNutrition(ingredients, productsMap);

            expect(result.calories).toBe(154);
            expect(result.protein).toBe(4);
            expect(result.fat).toBe(0.8);
            expect(result.carbs).toBe(32.6);
        });
    });

    describe('Один продукт: нулевая калорийность продукта (вода)', () => {
        test('продукт с нулевой калорийностью не добавляет КБЖУ', () => {
            const ingredients = [
                { productId: TEST_PRODUCTS.water.id, quantity: 500 }
            ];

            const result = calculateNutrition(ingredients, productsMap);

            expect(result.calories).toBe(0);
            expect(result.protein).toBe(0);
            expect(result.fat).toBe(0);
            expect(result.carbs).toBe(0);
        });
    });

    describe('Несколько продуктов: сумма КБЖУ', () => {
        test('два продукта — значения суммируются', () => {
            const ingredients = [
                { productId: TEST_PRODUCTS.potato.id, quantity: 100 },
                { productId: TEST_PRODUCTS.meat.id, quantity: 50 }
            ];

            const result = calculateNutrition(ingredients, productsMap);

            expect(result.calories).toBe(170.6);
            expect(result.protein).toBe(11.5); 
            expect(result.fat).toBe(6.6);
            expect(result.carbs).toBe(16.3);
        });
    });

    describe('Граничные значения: сумма БЖУ = 100 г на 100 г продукта', () => {
        test('продукт с суммой БЖУ ровно 100 г пересчитывается корректно', () => {
            const ingredients = [
                { productId: TEST_PRODUCTS.boundary100.id, quantity: 100 }
            ];

            const result = calculateNutrition(ingredients, productsMap);

            expect(result.calories).toBe(400);
            expect(result.protein).toBe(50);
            expect(result.fat).toBe(30);
            expect(result.carbs).toBe(20);
        });
    });

    describe('Граничные значения: каждый нутриент = 100 г', () => {
        test('продукт с Б=100, Ж=100, У=100 на 100 г (сумма 300)', () => {
            const ingredients = [
                { productId: TEST_PRODUCTS.maxEach.id, quantity: 100 }
            ];

            const result = calculateNutrition(ingredients, productsMap);

            expect(result.calories).toBe(900);
            expect(result.protein).toBe(100);
            expect(result.fat).toBe(100);
            expect(result.carbs).toBe(100);
        });
    });

    describe('Граничные значения: очень маленькое количество', () => {
        test('0.1 г продукта — минимальное ненулевое количество', () => {
            const ingredients = [
                { productId: TEST_PRODUCTS.meat.id, quantity: 0.1 }
            ];

            const result = calculateNutrition(ingredients, productsMap);

            expect(result.calories).toBe(0.2);  
            expect(result.protein).toBe(0);      
            expect(result.fat).toBe(0);          
            expect(result.carbs).toBe(0);
        });
    });


    describe('Продукт не найден в productsMap', () => {
        test('неизвестный productId игнорируется, возвращаются нули', () => {
            const ingredients = [
                { productId: 'non-existent-id', quantity: 100 }
            ];

            const result = calculateNutrition(ingredients, productsMap);

            expect(result.calories).toBe(0);
            expect(result.protein).toBe(0);
            expect(result.fat).toBe(0);
            expect(result.carbs).toBe(0);
        });

        test('смесь: один известный продукт, один неизвестный — считается только известный', () => {
            const ingredients = [
                { productId: TEST_PRODUCTS.potato.id, quantity: 100 },
                { productId: 'ghost-product', quantity: 999 }
            ];

            const result = calculateNutrition(ingredients, productsMap);

            expect(result.calories).toBe(77);
            expect(result.protein).toBe(2);
            expect(result.fat).toBe(0.4);
            expect(result.carbs).toBe(16.3);
        });
    });

    describe('Округление до 1 знака после запятой', () => {
        test('значение .45 округляется до .5', () => {
            const ingredients = [
                { productId: TEST_PRODUCTS.meat.id, quantity: 50 }
            ];

            const result = calculateNutrition(ingredients, productsMap);

            expect(result.protein).toBe(9.5);
        });

        test('значение .44 округляется до .4', () => {

            const ingredients = [
                { productId: TEST_PRODUCTS.meat.id, quantity: 3.548 }
            ];

            const result = calculateNutrition(ingredients, productsMap);

            expect(result.fat).toBe(0.4);
        });

        test('значение .55 округляется до .6', () => {

            const ingredients = [
                { productId: TEST_PRODUCTS.meat.id, quantity: 2.92 }
            ];

            const result = calculateNutrition(ingredients, productsMap);

            expect(result.protein).toBe(0.6);
        });
    });

});