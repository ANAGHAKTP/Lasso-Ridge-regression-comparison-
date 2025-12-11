import { multiply, transpose, inv, add, identity, subtract, dot, mean, std } from 'mathjs';

/**
 * Standardize the data (Center and scale)
 * @param {Array<Array<number>>} X - Features matrix
 * @param {Array<number>} y - Target vector
 */
export const preprocessData = (X, y) => {
    // Mathjs handles matrices, but let's work with standard arrays for simplicity where possible
    // or convert to mathjs matrices
    
    // Calculate mean and std for columns of X
    const n = X.length;
    const p = X[0].length;
    
    const X_means = [];
    const X_stds = [];
    
    // Transpose to iterate columns easily
    const X_T = transpose(X);
    
    const X_scaled = [];
    
    for (let j = 0; j < p; j++) {
        const col = X_T[j];
        const m = mean(col);
        const s = std(col, 'uncorrected'); // use population std or sample? sklearn uses sample usually, but for scaling often uncorrected.
        // Let's use simple std. If std is 0, use 1.
        const safe_s = s === 0 ? 1 : s;
        
        X_means.push(m);
        X_stds.push(safe_s);
    }
    
    // Scale X
    for (let i = 0; i < n; i++) {
        const row = [];
        for (let j = 0; j < p; j++) {
            row.push((X[i][j] - X_means[j]) / X_stds[j]);
        }
        X_scaled.push(row);
    }
    
    // Center y
    const y_mean = mean(y);
    const y_centered = y.map(val => val - y_mean);
    
    return {
        X: X_scaled,
        y: y_centered,
        X_means,
        X_stds,
        y_mean
    };
};

/**
 * Ridge Regression
 * beta = (X'X + lambda*I)^-1 * X'y
 */
export const solveRidge = (X, y, lambda) => {
    const p = X[0].length;
    const XT = transpose(X);
    const XTX = multiply(XT, X);
    const LI = multiply(lambda, identity(p));
    const term1 = add(XTX, LI);
    const term2 = multiply(XT, y);
    
    try {
        const beta = multiply(inv(term1), term2);
        // mathjs might return a matrix or array depending on input
        return beta.valueOf().flat ? beta.valueOf().flat() : beta;
    } catch (e) {
        // Singular matrix fallback
        console.error("Singular matrix in Ridge", e);
        return new Array(p).fill(0);
    }
};

/**
 * Lasso Regression (Coordinate Descent)
 * Objective: (1/2n) * ||y - Xb||^2 + alpha * ||b||_1
 * Note: Scikit-learn uses alpha. Here we use lambda to match Ridge params roughly, 
 * but note scaling roughly differs.
 */
export const solveLasso = (X, y, lambda, maxIter = 1000, tol = 1e-4) => {
    const n = X.length;
    const p = X[0].length;
    
    // Initialize beta with 0
    let beta = new Array(p).fill(0);
    
    // Precompute X squared norms?
    // If X is standardized, sum(x_ij^2) over i might be different. 
    // In coord descent:
    // z_j = sum(x_ij^2)
    // rho_j = sum_i x_ij * (y_i - sum_{k!=j} x_ik beta_k)
    // beta_j = soft(rho_j, lambda) / z_j
    // Note: If using sklearn definition, objective has 1/(2n).
    // The soft threshold would be lambda * n?
    // Let's stick to: Minimize ||y - Xb||^2 + lambda ||b||_1
    // Then threshold is lambda/2.
    // Denominator is sum(x_ij^2).
    
    const XT = transpose(X);
    const z = XT.map(col => dot(col, col)); // sum of squares for each feature
    
    for (let iter = 0; iter < maxIter; iter++) {
        let maxChange = 0;
        
        for (let j = 0; j < p; j++) {
            const oldBeta = beta[j];
            
            // Calculate residual without feature j
            // r_min_j = y - X * beta + x_j * beta_j
            // This is expensive to compute full residual every time.
            // Better: keep track of current Residual r = y - X*beta
            // Then adding back feature j: r_new = r + x_j * beta_j
            // But doing it naively for now is fine for small p.
            
            let rho = 0;
            // Calculate dot product of column j with partial residual
            for(let i=0; i<n; i++) {
                let y_pred_no_j = 0;
                for(let k=0; k<p; k++) {
                    if(k !== j) {
                        y_pred_no_j += X[i][k] * beta[k];
                    }
                }
                rho += X[i][j] * (y[i] - y_pred_no_j);
            }
            
            // Soft threshold
            // Minimize Squared Error + lambda * |beta|
            // Threshold is lambda / 2
            const threshold = lambda / 2;
            
            let newBeta = 0;
            if (rho > threshold) {
                newBeta = (rho - threshold) / z[j];
            } else if (rho < -threshold) {
                newBeta = (rho + threshold) / z[j];
            } else {
                newBeta = 0;
            }
            
            beta[j] = newBeta;
            maxChange = Math.max(maxChange, Math.abs(newBeta - oldBeta));
        }
        
        if (maxChange < tol) break;
    }
    
    return beta;
};

// Generate synthetic data
export const generateData = (n_samples = 50, n_features = 5, noise = 5) => {
    const X = [];
    const true_coef = [];
    
    // Create sparse true coefficients: some are large, some 0
    // e.g. [10, -5, 0, 0, 2]
    for(let j=0; j<n_features; j++) {
        if (j % 2 === 0) true_coef.push((Math.random() - 0.5) * 20); // Large
        else true_coef.push(0); // Sparsity for Lasso to find
    }
    
    const y = [];
    
    for(let i=0; i<n_samples; i++) {
        const row = [];
        let y_val = 0;
        for(let j=0; j<n_features; j++) {
            const val = Math.random() * 10;
            row.push(val);
            y_val += val * true_coef[j];
        }
        y_val += (Math.random() - 0.5) * noise;
        X.push(row);
        y.push(y_val);
    }
    
    return { X, y, true_coef };
};
