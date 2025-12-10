# Lasso vs Ridge Regression Comparison

This Streamlit application demonstrates the effect of L1 (Lasso) and L2 (Ridge) regularization on regression coefficients.

## Features
- **Interactive Data Generation**: Control sample size, feature count, and noise.
- **Shrinkage Path Visualization**: See how coefficients shrink as regularization strength increases.
- **Performance Metrics**: Compare MSE and R2 scores for Lasso and Ridge at specific alpha values.

## How to Run

1.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

2.  **Run the Application**:
    ```bash
    streamlit run app.py
    ```

3.  **Explore**:
    -   Adjust the **Alpha** slider to see how model performance changes.
    -   Observe the **Coefficient Shrinkage Paths** to see Lasso selecting features (coefficients becoming 0).
