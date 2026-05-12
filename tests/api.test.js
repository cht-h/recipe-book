var request = require('supertest');
var fs = require('fs');
var path = require('path');

var PRODUCTS_FILE = path.join(__dirname, '..', 'data', 'products.json');
var DISHES_FILE = path.join(__dirname, '..', 'data', 'dishes.json');

var base = 'http://localhost:3000';

beforeAll(async function() {
    var initialProducts = [
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
            flags: { vegan: true, glutenFree: true, sugarFree: true },
            createdAt: new Date('2024-01-01T10:00:00').toISOString(),
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
            flags: { vegan: true, glutenFree: true, sugarFree: true },
            createdAt: new Date('2024-01-01T10:00:00').toISOString(),
            updatedAt: null
        },
        {
            id: '3',
            name: 'Мясо',
            images: ['images/meat.jpeg', 'images/meat.jpeg'],
            calories: 187.2,
            protein: 18.9,
            fat: 12.4,
            carbs: 0,
            composition: 'Говядина',
            category: 'Мясной',
            cookingRequired: 'Требует приготовления',
            flags: { vegan: false, glutenFree: true, sugarFree: true },
            createdAt: new Date('2024-01-01T10:00:00').toISOString(),
            updatedAt: null
        }
    ];

    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(initialProducts, null, 2));
    fs.writeFileSync(DISHES_FILE, JSON.stringify([], null, 2));
});

afterAll(function() {
    var initialProducts = [
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
            flags: { vegan: true, glutenFree: true, sugarFree: true },
            createdAt: new Date('2024-01-01T10:00:00').toISOString(),
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
            flags: { vegan: true, glutenFree: true, sugarFree: true },
            createdAt: new Date('2024-01-01T10:00:00').toISOString(),
            updatedAt: null
        },
        {
            id: '3',
            name: 'Мясо',
            images: ['images/meat.jpeg', 'images/meat.jpeg'],
            calories: 187.2,
            protein: 18.9,
            fat: 12.4,
            carbs: 0,
            composition: 'Говядина',
            category: 'Мясной',
            cookingRequired: 'Требует приготовления',
            flags: { vegan: false, glutenFree: true, sugarFree: true },
            createdAt: new Date('2024-01-01T10:00:00').toISOString(),
            updatedAt: null
        }
    ];

    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(initialProducts, null, 2));
    fs.writeFileSync(DISHES_FILE, JSON.stringify([], null, 2));
});

describe('Интеграционные тесты API Книги рецептов', function() {

    describe('GET /api/products', function() {
        test('возвращает массив из трёх начальных продуктов', async function() {
            var res = await request(base).get('/api/products').expect(200);
            expect(res.body.length).toBe(3);
            expect(res.body[0].name).toBe('Картофель');
            expect(res.body[1].name).toBe('Вода');
            expect(res.body[2].name).toBe('Мясо');
        });

        test('каждый продукт содержит обязательные поля: id, name, calories, protein, fat, carbs, category, cookingRequired, flags, createdAt', async function() {
            var res = await request(base).get('/api/products').expect(200);
            var p = res.body[0];
            expect(p).toHaveProperty('id');
            expect(p).toHaveProperty('name');
            expect(p).toHaveProperty('calories');
            expect(p).toHaveProperty('protein');
            expect(p).toHaveProperty('fat');
            expect(p).toHaveProperty('carbs');
            expect(p).toHaveProperty('category');
            expect(p).toHaveProperty('cookingRequired');
            expect(p).toHaveProperty('flags');
            expect(p).toHaveProperty('createdAt');
        });
    });

    describe('GET /api/products/:id', function() {
        test('возвращает продукт Картофель по id=1 с калорийностью 77', async function() {
            var res = await request(base).get('/api/products/1').expect(200);
            expect(res.body.name).toBe('Картофель');
            expect(res.body.calories).toBe(77);
        });

        test('возвращает 404 для несуществующего id=99999', async function() {
            var res = await request(base).get('/api/products/99999').expect(404);
            expect(res.body.error).toBe('Продукт не найден');
        });
    });

    describe('POST /api/products', function() {
        test('создаёт продукт с валидными данными и возвращает 201', async function() {
            var res = await request(base).post('/api/products').send({
                name: 'ТестовыйПродукт',
                calories: 100,
                protein: 10,
                fat: 5,
                carbs: 20,
                category: 'Овощи',
                cookingRequired: 'Готовый к употреблению',
                flags: { vegan: true, glutenFree: true, sugarFree: false }
            }).expect(201);
            expect(res.body.name).toBe('ТестовыйПродукт');
            expect(res.body.id).toBeDefined();
            expect(res.body.createdAt).toBeDefined();
            expect(res.body.protein).toBe(10);
        });
    });

    describe('PUT /api/products/:id', function() {
        test('обновляет название продукта и проставляет updatedAt', async function() {
            var res = await request(base).put('/api/products/1').send({
                name: 'КартофельОбновлённый',
                calories: 77,
                protein: 2,
                fat: 0.4,
                carbs: 16.3,
                category: 'Овощи',
                cookingRequired: 'Требует приготовления',
                flags: { vegan: true, glutenFree: true, sugarFree: true }
            }).expect(200);
            expect(res.body.name).toBe('КартофельОбновлённый');
            expect(res.body.updatedAt).toBeDefined();
        });

        test('возвращает 404 при обновлении несуществующего id=99999', async function() {
            var res = await request(base).put('/api/products/99999').send({
                name: 'Неважно',
                calories: 0,
                protein: 0,
                fat: 0,
                carbs: 0,
                category: 'Жидкость',
                cookingRequired: 'Готовый к употреблению'
            }).expect(404);
            expect(res.body.error).toBe('Продукт не найден');
        });
    });

    describe('DELETE /api/products/:id', function() {
        test('удаляет свободный продукт и возвращает success: true', async function() {
            var createRes = await request(base).post('/api/products').send({
                name: 'ДляУдаления',
                calories: 50,
                protein: 1,
                fat: 1,
                carbs: 10,
                category: 'Специи',
                cookingRequired: 'Готовый к употреблению'
            });
            var id = createRes.body.id;
            var res = await request(base).delete('/api/products/' + id).expect(200);
            expect(res.body.success).toBe(true);
        });

        test('не удаляет продукт, используемый в блюде, возвращает 400 и имя блюда', async function() {
            await request(base).post('/api/dishes').send({
                name: 'БлюдоСМясом',
                calories: 200,
                protein: 20,
                fat: 15,
                carbs: 10,
                ingredients: [{ productId: '3', quantity: 100 }],
                portionSize: 250,
                category: 'Второе'
            });
            var res = await request(base).delete('/api/products/3').expect(400);
            expect(res.body.error).toBe('Продукт используется в блюдах');
            expect(res.body.dishes).toContain('БлюдоСМясом');
        });
    });

    describe('POST /api/dishes', function() {
        test('создаёт блюдо с одним продуктом в составе', async function() {
            var res = await request(base).post('/api/dishes').send({
                name: 'ТестовоеБлюдо',
                calories: 200,
                protein: 15,
                fat: 10,
                carbs: 25,
                ingredients: [{ productId: '1', quantity: 150 }],
                portionSize: 300,
                category: 'Второе'
            }).expect(201);
            expect(res.body.name).toBe('ТестовоеБлюдо');
            expect(res.body.ingredients.length).toBe(1);
        });

        test('создаёт блюдо с двумя продуктами в составе', async function() {
            var res = await request(base).post('/api/dishes').send({
                name: 'СложноеБлюдо',
                calories: 300,
                protein: 20,
                fat: 15,
                carbs: 30,
                ingredients: [
                    { productId: '1', quantity: 100 },
                    { productId: '2', quantity: 200 }
                ],
                portionSize: 350,
                category: 'Первое'
            }).expect(201);
            expect(res.body.ingredients.length).toBe(2);
        });
    });

    describe('GET /api/dishes/:id', function() {
        test('возвращает 404 для несуществующего блюда', async function() {
            var res = await request(base).get('/api/dishes/99999').expect(404);
            expect(res.body.error).toBe('Блюдо не найдено');
        });
    });

    describe('PUT /api/dishes/:id', function() {
        test('обновляет название существующего блюда', async function() {
            var allDishes = await request(base).get('/api/dishes');
            var dishId = allDishes.body[0].id;
            var res = await request(base).put('/api/dishes/' + dishId).send({
                name: 'ОбновлённоеБлюдо',
                calories: 250,
                protein: 18,
                fat: 12,
                carbs: 28,
                ingredients: [{ productId: '1', quantity: 200 }],
                portionSize: 400,
                category: 'Второе'
            }).expect(200);
            expect(res.body.name).toBe('ОбновлённоеБлюдо');
        });
    });

    describe('DELETE /api/dishes/:id', function() {
        test('удаляет блюдо и возвращает success: true', async function() {
            var createRes = await request(base).post('/api/dishes').send({
                name: 'НаУдаление',
                calories: 100,
                protein: 5,
                fat: 3,
                carbs: 10,
                ingredients: [{ productId: '2', quantity: 50 }],
                portionSize: 150,
                category: 'Напиток'
            });
            var id = createRes.body.id;
            var res = await request(base).delete('/api/dishes/' + id).expect(200);
            expect(res.body.success).toBe(true);
        });
    });

    describe('Граничные значения', function() {
        test('калорийность продукта = 0', async function() {
            var res = await request(base).post('/api/products').send({
                name: 'НулевойПродукт',
                calories: 0,
                protein: 0,
                fat: 0,
                carbs: 0,
                category: 'Жидкость',
                cookingRequired: 'Готовый к употреблению'
            }).expect(201);
            expect(res.body.calories).toBe(0);
        });

        test('белки продукта = 100', async function() {
            var res = await request(base).post('/api/products').send({
                name: 'БелковыйМакс',
                calories: 400,
                protein: 100,
                fat: 0,
                carbs: 0,
                category: 'Мясной',
                cookingRequired: 'Требует приготовления'
            }).expect(201);
            expect(res.body.protein).toBe(100);
        });

        test('размер порции блюда = 0.01', async function() {
            var res = await request(base).post('/api/dishes').send({
                name: 'МиниПорция',
                calories: 1,
                protein: 0.1,
                fat: 0,
                carbs: 0.1,
                ingredients: [{ productId: '2', quantity: 0.1 }],
                portionSize: 0.01,
                category: 'Напиток'
            }).expect(201);
            expect(res.body.portionSize).toBe(0.01);
        });
    });

    describe('Эквивалентное разбиение', function() {
        test('блюдо с пустым составом создаётся с 0 ингредиентов', async function() {
            var res = await request(base).post('/api/dishes').send({
                name: 'ПустоеБлюдо',
                calories: 0,
                protein: 0,
                fat: 0,
                carbs: 0,
                ingredients: [],
                portionSize: 100,
                category: 'Салат'
            }).expect(201);
            expect(res.body.ingredients.length).toBe(0);
        });

        test('запрос несуществующего продукта возвращает 404', async function() {
            var res = await request(base).get('/api/products/88888').expect(404);
            expect(res.body.error).toBe('Продукт не найден');
        });

        test('запрос несуществующего блюда возвращает 404', async function() {
            var res = await request(base).get('/api/dishes/77777').expect(404);
            expect(res.body.error).toBe('Блюдо не найдено');
        });
    });

});