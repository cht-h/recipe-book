var locators = require('./locators.js');

function sleep(ms) {
    return new Promise(function(resolve) { setTimeout(resolve, ms); });
}

async function waitForToast(page) {
    await sleep(1500);
}

async function clickByText(page, text) {
    await page.evaluate(function(t) {
        var buttons = document.querySelectorAll('button');
        for (var i = 0; i < buttons.length; i++) {
            if (buttons[i].textContent.indexOf(t) !== -1) {
                buttons[i].click();
                return;
            }
        }
    }, text);
}

async function openAddProductForm(page) {
    await page.click(locators.sidebar.productsBtn);
    await sleep(400);
    await page.click(locators.products.addBtn);
    await page.waitForSelector(locators.products.form, { visible: true, timeout: 3000 });
}

async function fillProductForm(page, data) {
    var nameEl = await page.$(locators.products.nameInput);
    await nameEl.click({ clickCount: 3 });
    await nameEl.type(data.name);
    var calEl = await page.$(locators.products.caloriesInput);
    await calEl.click({ clickCount: 3 });
    await calEl.type(String(data.calories));
    var protEl = await page.$(locators.products.proteinInput);
    await protEl.click({ clickCount: 3 });
    await protEl.type(String(data.protein));
    var fatEl = await page.$(locators.products.fatInput);
    await fatEl.click({ clickCount: 3 });
    await fatEl.type(String(data.fat));
    var carbsEl = await page.$(locators.products.carbsInput);
    await carbsEl.click({ clickCount: 3 });
    await carbsEl.type(String(data.carbs));
    await page.select(locators.products.categorySelect, data.category);
    await page.select(locators.products.cookingSelect, data.cookingRequired);
}

async function submitProductForm(page) {
    await page.click(locators.products.submitBtn);
    await waitForToast(page);
}

async function openAddDishForm(page) {
    await page.click(locators.sidebar.dishesBtn);
    await sleep(400);
    await page.click(locators.dishes.addBtn);
    await page.waitForSelector(locators.dishes.form, { visible: true, timeout: 3000 });
}

async function fillDishForm(page, data) {
    var nameEl = await page.$(locators.dishes.nameInput);
    await nameEl.click({ clickCount: 3 });
    await nameEl.type(data.name);
    var portionEl = await page.$(locators.dishes.portionInput);
    await portionEl.click({ clickCount: 3 });
    await portionEl.type(String(data.portionSize));
    if (data.category) {
        await page.select(locators.dishes.categorySelect, data.category);
    }
    var calEl = await page.$(locators.dishes.caloriesInput);
    await calEl.click({ clickCount: 3 });
    await calEl.type(String(data.calories));
    var protEl = await page.$(locators.dishes.proteinInput);
    await protEl.click({ clickCount: 3 });
    await protEl.type(String(data.protein));
    var fatEl = await page.$(locators.dishes.fatInput);
    await fatEl.click({ clickCount: 3 });
    await fatEl.type(String(data.fat));
    var carbsEl = await page.$(locators.dishes.carbsInput);
    await carbsEl.click({ clickCount: 3 });
    await carbsEl.type(String(data.carbs));
}

async function submitDishForm(page) {
    await page.click(locators.dishes.submitBtn);
    await waitForToast(page);
}

async function selectFirstIngredientByValue(page, value) {
    var selects = await page.$$(locators.dishes.ingredientProduct);
    await selects[0].select(value);
}

async function typeFirstIngredientQuantity(page, quantity) {
    var inputs = await page.$$(locators.dishes.ingredientQuantity);
    await inputs[0].click({ clickCount: 3 });
    await inputs[0].type(String(quantity));
}

async function clickRecalc(page) {
    await clickByText(page, locators.dishes.recalcBtnText);
    await sleep(600);
}

async function getCardCount(page, listSelector, cardSelector) {
    listSelector = listSelector || locators.products.list;
    cardSelector = cardSelector || '.card';
    await page.waitForSelector(listSelector, { timeout: 3000 });
    await sleep(300);
    return await page.$$eval(listSelector + ' ' + cardSelector, function(cards) { return cards.length; });
}

async function getFirstCardName(page, listSelector, cardSelector) {
    listSelector = listSelector || locators.products.list;
    cardSelector = cardSelector || '.card';
    await page.waitForSelector(listSelector + ' ' + cardSelector, { timeout: 3000 });
    return await page.$eval(listSelector + ' ' + cardSelector + ' .card-title', function(el) {
        return el.textContent.trim();
    });
}

async function clickFirstCard(page, listSelector) {
    listSelector = listSelector || locators.products.list;
    await page.waitForSelector(listSelector + ' .card', { timeout: 3000 });
    var cards = await page.$$(listSelector + ' .card');
    await cards[0].click();
}

async function clearSearch(page) {
    await page.$eval(locators.products.searchInput, function(el) {
        el.value = '';
        el.dispatchEvent(new Event('input', { bubbles: true }));
    });
}

module.exports = {
    sleep: sleep,
    waitForToast: waitForToast,
    openAddProductForm: openAddProductForm,
    fillProductForm: fillProductForm,
    submitProductForm: submitProductForm,
    openAddDishForm: openAddDishForm,
    fillDishForm: fillDishForm,
    submitDishForm: submitDishForm,
    selectFirstIngredientByValue: selectFirstIngredientByValue,
    typeFirstIngredientQuantity: typeFirstIngredientQuantity,
    clickRecalc: clickRecalc,
    getCardCount: getCardCount,
    getFirstCardName: getFirstCardName,
    clickFirstCard: clickFirstCard,
    clearSearch: clearSearch
};