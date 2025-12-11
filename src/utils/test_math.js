import { generateData, preprocessData, solveRidge, solveLasso } from './math.js';
import { multiply, transpose, inv } from 'mathjs';

console.log("Testing math utils...");

try {
    const { X, y, true_coef } = generateData(10, 5, 1);
    console.log("Data generated.");

    const processed = preprocessData(X, y);
    console.log("Data processed.");

    const ridgeCoef = solveRidge(processed.X, processed.y, 1.0);
    console.log("Ridge solved:", ridgeCoef);
    if (!Array.isArray(ridgeCoef)) console.warn("Ridge Coef is not an array:", ridgeCoef);

    const lassoCoef = solveLasso(processed.X, processed.y, 1.0);
    console.log("Lasso solved:", lassoCoef);

    console.log("Test Passed!");
} catch (e) {
    console.error("Test Failed:", e);
    process.exit(1);
}
