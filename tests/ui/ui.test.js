var puppeteer = require('puppeteer');
var locators = require('./locators.js');
var helpers = require('./helpers.js');

var BASE_URL = 'http://localhost:3000/index.html';
var RESET_URL = 'http://localhost:3000/api/reset';

jest.setTimeout(15000);

describe('Системные UI-тесты Книги рецептов', function() {
    var browser;
    var page;

    beforeAll(async function() {
        browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    });

    afterAll(async function() {
        await browser.close();
    });

    beforeEach(async function() {
        page = await browser.newPage();
        await page.setViewport({ width: 1400, height: 900 });
        await page.goto(RESET_URL, { waitUntil: 'networkidle0' });
        await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
        await page.waitForSelector(locators.products.list, { timeout: 5000 });
    });

    afterEach(async function() {
        await page.close();
    });

    describe('Навигация', function() {
        test('вкладка Блюда показывает список блюд', async function() {
            await page.click(locators.sidebar.dishesBtn);
            await page.waitForSelector(locators.dishes.list, { visible: true, timeout: 3000 });
        });

        test('возврат на Продукты показывает список продуктов', async function() {
            await page.click(locators.sidebar.dishesBtn);
            await helpers.sleep(400);
            await page.click(locators.sidebar.productsBtn);
            await page.waitForSelector(locators.products.list, { visible: true, timeout: 3000 });
        });
    });

    describe('Создание продукта', function() {
        test('после создания продукта число карточек растёт на 1', async function() {
            var before = await helpers.getCardCount(page);
            await helpers.openAddProductForm(page);
            await helpers.fillProductForm(page, {
                name: 'Огурец',
                calories: 15,
                protein: 0.8,
                fat: 0.1,
                carbs: 2.6,
                category: 'Овощи',
                cookingRequired: 'Готовый к употреблению'
            });
            await helpers.submitProductForm(page);
            var after = await helpers.getCardCount(page);
            expect(after).toBe(before + 1);
        });
    });

    describe('Поиск продукта', function() {
        test('поиск "карт" даёт 1 продукт', async function() {
            await page.type(locators.products.searchInput, 'карт');
            await helpers.sleep(600);
            var count = await helpers.getCardCount(page);
            expect(count).toBe(1);
        });

        test('поиск "zzzzz" показывает "не найдены"', async function() {
            await page.type(locators.products.searchInput, 'zzzzz');
            await helpers.sleep(600);
            var text = await page.$eval(locators.products.list, function(el) { return el.textContent; });
            expect(text).toContain('Продукты не найдены');
        });
    });

    describe('Фильтрация по категории', function() {
        test('фильтр "Мясной" даёт 1 продукт', async function() {
            await page.select(locators.products.categoryFilter, 'Мясной');
            await helpers.sleep(600);
            var count = await helpers.getCardCount(page);
            expect(count).toBe(1);
        });
    });

    describe('Сортировка', function() {
        test('по калориям asc — первый Вода', async function() {
            await page.select(locators.products.sortSelect, 'calories');
            await page.click(locators.products.sortAsc);
            await helpers.sleep(600);
            var name = await helpers.getFirstCardName(page);
            expect(name).toBe('Вода');
        });

        test('по калориям desc — первый Мясо', async function() {
            await page.select(locators.products.sortSelect, 'calories');
            await page.click(locators.products.sortDesc);
            await helpers.sleep(600);
            var name = await helpers.getFirstCardName(page);
            expect(name).toBe('Мясо');
        });
    });

    describe('Модальное окно', function() {
        test('клик по карточке открывает модалку', async function() {
            await helpers.clickFirstCard(page);
            await page.waitForSelector(locators.modal.overlay, { visible: true, timeout: 3000 });
            var title = await page.$eval(locators.modal.title, function(el) { return el.textContent; });
            expect(title.length).toBeGreaterThan(0);
        });

        test('крестик закрывает модалку', async function() {
            await helpers.clickFirstCard(page);
            await page.waitForSelector(locators.modal.closeBtn, { visible: true, timeout: 3000 });
            await page.click(locators.modal.closeBtn);
            await page.waitForSelector(locators.modal.overlay, { hidden: true, timeout: 3000 });
        });
    });

    describe('Создание блюда с макросом', function() {
        test('макрос !суп удаляется из названия', async function() {
            await helpers.openAddDishForm(page);
            await helpers.selectFirstIngredientByValue(page, '1');
            await helpers.typeFirstIngredientQuantity(page, 200);
            await helpers.clickRecalc(page);
            await helpers.fillDishForm(page, {
                name: '!суп Грибной',
                portionSize: 300,
                category: '',
                calories: 154,
                protein: 4,
                fat: 0.8,
                carbs: 32.6
            });
            await helpers.submitDishForm(page);
            var name = await helpers.getFirstCardName(page, locators.dishes.list, '.card');
            expect(name).toBe('Грибной');
        });
    });

    describe('Граничные значения', function() {
        test('калорийность 0 — продукт создаётся', async function() {
            var before = await helpers.getCardCount(page);
            await helpers.openAddProductForm(page);
            await helpers.fillProductForm(page, {
                name: 'Нулевой',
                calories: 0,
                protein: 0,
                fat: 0,
                carbs: 0,
                category: 'Жидкость',
                cookingRequired: 'Готовый к употреблению'
            });
            await helpers.submitProductForm(page);
            var after = await helpers.getCardCount(page);
            expect(after).toBe(before + 1);
        });

        test('белки 100 — продукт создаётся', async function() {
            var before = await helpers.getCardCount(page);
            await helpers.openAddProductForm(page);
            await helpers.fillProductForm(page, {
                name: 'Белковый',
                calories: 400,
                protein: 100,
                fat: 0,
                carbs: 0,
                category: 'Мясной',
                cookingRequired: 'Требует приготовления'
            });
            await helpers.submitProductForm(page);
            var after = await helpers.getCardCount(page);
            expect(after).toBe(before + 1);
        });
    });

    describe('Эквивалентное разбиение', function() {
        test('очистка поиска возвращает все 3 продукта', async function() {
            await page.type(locators.products.searchInput, 'zzz');
            await helpers.sleep(400);
            await helpers.clearSearch(page);
            await helpers.sleep(600);
            var count = await helpers.getCardCount(page);
            expect(count).toBe(3);
        });
    });

});