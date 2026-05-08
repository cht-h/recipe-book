
/**
 * рассчитывает калорийность, белки, жиры и углеводы на порцию блюда.
 *
 * @param {Array} ingredients - массив { productId, quantity }
 * @param {Object} productsMap - словарь { [productId]: { calories, protein, fat, carbs } }
 * @returns {{ calories: number, protein: number, fat: number, carbs: number }}
 */

function calculateNutrition(ingredients, productsMap) {
    const results = ingredients.map(ing => {
        const product = productsMap[ing.productId] || { calories: 0, protein: 0, fat: 0, carbs: 0 };
        const ratio = ing.quantity / 100;

        return {
            calories: product.calories * ratio,
            protein: product.protein * ratio,
            fat: product.fat * ratio,
            carbs: product.carbs * ratio
        };
    });

    const total = results.reduce((acc, cur) => ({
        calories: acc.calories + cur.calories,
        protein: acc.protein + cur.protein,
        fat: acc.fat + cur.fat,
        carbs: acc.carbs + cur.carbs
    }), { calories: 0, protein: 0, fat: 0, carbs: 0 });

    return {
        calories: Math.round(total.calories * 10) / 10,
        protein: Math.round(total.protein * 10) / 10,
        fat: Math.round(total.fat * 10) / 10,
        carbs: Math.round(total.carbs * 10) / 10
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { calculateNutrition };
}