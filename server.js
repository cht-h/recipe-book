var express = require('express');
var fs = require('fs');
var path = require('path');

var app = express();
var PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

var PRODUCTS_FILE = path.join(__dirname, 'data', 'products.json');
var DISHES_FILE = path.join(__dirname, 'data', 'dishes.json');

function readJSON(filePath) {
    var raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
}

function writeJSON(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

var INITIAL_PRODUCTS = [
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

function initDataFiles() {
    if (!fs.existsSync(PRODUCTS_FILE)) {
        writeJSON(PRODUCTS_FILE, INITIAL_PRODUCTS);
    }
    if (!fs.existsSync(DISHES_FILE)) {
        writeJSON(DISHES_FILE, []);
    }
}

initDataFiles();

app.get('/api/reset', function(req, res) {
    writeJSON(PRODUCTS_FILE, JSON.parse(JSON.stringify(INITIAL_PRODUCTS)));
    writeJSON(DISHES_FILE, []);
    res.json({ ok: true });
});

app.get('/api/products', function(req, res) { res.json(readJSON(PRODUCTS_FILE)); });
app.get('/api/products/:id', function(req, res) {
    var products = readJSON(PRODUCTS_FILE);
    var product = products.find(function(p) { return p.id === req.params.id; });
    if (!product) return res.status(404).json({ error: 'Продукт не найден' });
    res.json(product);
});
app.post('/api/products', function(req, res) {
    var products = readJSON(PRODUCTS_FILE);
    var newProduct = Object.assign({}, req.body, { id: Date.now().toString(), createdAt: new Date().toISOString(), updatedAt: null });
    products.push(newProduct);
    writeJSON(PRODUCTS_FILE, products);
    res.status(201).json(newProduct);
});
app.put('/api/products/:id', function(req, res) {
    var products = readJSON(PRODUCTS_FILE);
    var index = products.findIndex(function(p) { return p.id === req.params.id; });
    if (index === -1) return res.status(404).json({ error: 'Продукт не найден' });
    products[index] = Object.assign({}, req.body, { id: req.params.id, createdAt: products[index].createdAt, updatedAt: new Date().toISOString() });
    writeJSON(PRODUCTS_FILE, products);
    res.json(products[index]);
});
app.delete('/api/products/:id', function(req, res) {
    var products = readJSON(PRODUCTS_FILE);
    var dishes = readJSON(DISHES_FILE);
    var usedIn = dishes.filter(function(d) { return d.ingredients.some(function(i) { return i.productId === req.params.id; }); });
    if (usedIn.length > 0) return res.status(400).json({ error: 'Продукт используется в блюдах', dishes: usedIn.map(function(d) { return d.name; }) });
    writeJSON(PRODUCTS_FILE, products.filter(function(p) { return p.id !== req.params.id; }));
    res.json({ success: true });
});

app.get('/api/dishes', function(req, res) { res.json(readJSON(DISHES_FILE)); });
app.get('/api/dishes/:id', function(req, res) {
    var dishes = readJSON(DISHES_FILE);
    var dish = dishes.find(function(d) { return d.id === req.params.id; });
    if (!dish) return res.status(404).json({ error: 'Блюдо не найдено' });
    res.json(dish);
});
app.post('/api/dishes', function(req, res) {
    var dishes = readJSON(DISHES_FILE);
    var newDish = Object.assign({}, req.body, { id: Date.now().toString(), createdAt: new Date().toISOString(), updatedAt: null });
    dishes.push(newDish);
    writeJSON(DISHES_FILE, dishes);
    res.status(201).json(newDish);
});
app.put('/api/dishes/:id', function(req, res) {
    var dishes = readJSON(DISHES_FILE);
    var index = dishes.findIndex(function(d) { return d.id === req.params.id; });
    if (index === -1) return res.status(404).json({ error: 'Блюдо не найдено' });
    dishes[index] = Object.assign({}, req.body, { id: req.params.id, createdAt: dishes[index].createdAt, updatedAt: new Date().toISOString() });
    writeJSON(DISHES_FILE, dishes);
    res.json(dishes[index]);
});
app.delete('/api/dishes/:id', function(req, res) {
    var dishes = readJSON(DISHES_FILE);
    writeJSON(DISHES_FILE, dishes.filter(function(d) { return d.id !== req.params.id; }));
    res.json({ success: true });
});

app.listen(PORT, function() {
    console.log('Сервер запущен: http://localhost:' + PORT);
});