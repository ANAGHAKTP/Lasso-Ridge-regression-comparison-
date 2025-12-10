import streamlit as st
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.linear_model import Lasso, Ridge
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.datasets import make_regression
import warnings

# Suppress warnings
warnings.filterwarnings("ignore")

st.set_page_config(page_title="Lasso vs Ridge Regression", layout="wide")

st.title("Lasso vs Ridge Regression: Coefficient Shrinkage")
st.markdown("""
This application demonstrates the difference between **Lasso (L1 Regularization)** and **Ridge (L2 Regularization)** regression. 
Use the sidebar to adjust data generation parameters and observe how the coefficients behave as the regularization strength ($\alpha$) changes.
""")

# --- Sidebar Controls ---
st.sidebar.header("Data Generation Parameters")
n_samples = st.sidebar.slider("Number of Samples", 50, 1000, 200, step=50)
n_features = st.sidebar.slider("Number of Features", 2, 50, 20, step=1)
n_informative = st.sidebar.slider("Number of Informative Features", 1, n_features, max(1, n_features // 2), step=1)
noise = st.sidebar.slider("Noise Level", 0.0, 50.0, 10.0, step=1.0)
random_state = st.sidebar.number_input("Random State", value=42, step=1)

st.sidebar.header("Model Parameters")
selected_alpha = st.sidebar.select_slider(
    "Select Alpha for Detailed Metrics",
    options=[0.0001, 0.001, 0.01, 0.1, 1.0, 10.0, 100.0, 1000.0],
    value=1.0
)

# --- Data Generation ---
X, y, coef_true = make_regression(
    n_samples=n_samples, 
    n_features=n_features, 
    n_informative=n_informative, 
    noise=noise, 
    coef=True, 
    random_state=random_state
)

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=random_state)

# Display Data Info
col1, col2 = st.columns(2)
with col1:
    st.info(f"Generated Data: {n_samples} samples, {n_features} features ({n_informative} informative)")
with col2:
    st.info(f"Training shapes: X={X_train.shape}, y={y_train.shape}")

# --- compute_paths_and_metrics ---
def compute_paths(model_class, X_train, y_train, alphas):
    coefs = []
    for a in alphas:
        model = model_class(alpha=a, max_iter=10000)
        model.fit(X_train, y_train)
        coefs.append(model.coef_)
    return np.array(coefs)

alphas = np.logspace(-4, 4, 100)

lasso_coefs = compute_paths(Lasso, X_train, y_train, alphas)
ridge_coefs = compute_paths(Ridge, X_train, y_train, alphas)

# --- Plots ---
st.subheader("Coefficient Shrinkage Paths")
st.markdown("Observe how coefficients change as `alpha` increases. **Lasso** tends to force coefficients to exactly zero (feature selection), while **Ridge** shrinks them towards zero.")

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))

# Lasso Plot
ax1.plot(alphas, lasso_coefs)
ax1.set_xscale('log')
ax1.set_xlabel('Alpha (Log Scale)')
ax1.set_ylabel('Coefficients')
ax1.set_title('Lasso Coefficients (L1)')
ax1.axvline(selected_alpha, linestyle='--', color='k', label=f'Alpha={selected_alpha}')
ax1.legend().set_visible(False)
ax1.grid(True, linestyle='--', alpha=0.6)

# Ridge Plot
ax2.plot(alphas, ridge_coefs)
ax2.set_xscale('log')
ax2.set_xlabel('Alpha (Log Scale)')
ax2.set_title('Ridge Coefficients (L2)')
ax2.axvline(selected_alpha, linestyle='--', color='k', label=f'Alpha={selected_alpha}')
ax2.grid(True, linestyle='--', alpha=0.6)

st.pyplot(fig)

# --- Detailed Metrics for Selected Alpha ---
st.subheader(f"Model Performance at Alpha = {selected_alpha}")

def get_metrics(model_class, alpha, X_train, y_train, X_test, y_test):
    model = model_class(alpha=alpha, max_iter=10000)
    model.fit(X_train, y_train)
    y_pred_train = model.predict(X_train)
    y_pred_test = model.predict(X_test)
    
    mse_train = mean_squared_error(y_train, y_pred_train)
    mse_test = mean_squared_error(y_test, y_pred_test)
    r2_train = r2_score(y_train, y_pred_train)
    r2_test = r2_score(y_test, y_pred_test)
    non_zero = np.sum(model.coef_ != 0)
    
    return mse_train, mse_test, r2_train, r2_test, non_zero, model.coef_

l_mse_tr, l_mse_te, l_r2_tr, l_r2_te, l_nz, l_coef = get_metrics(Lasso, selected_alpha, X_train, y_train, X_test, y_test)
r_mse_tr, r_mse_te, r_r2_tr, r_r2_te, r_nz, r_coef = get_metrics(Ridge, selected_alpha, X_train, y_train, X_test, y_test)

metrics_df = pd.DataFrame({
    'Metric': ['Train MSE', 'Test MSE', 'Train R2', 'Test R2', 'Non-Zero Coeffs'],
    'Lasso': [f"{l_mse_tr:.4f}", f"{l_mse_te:.4f}", f"{l_r2_tr:.4f}", f"{l_r2_te:.4f}", f"{l_nz}/{n_features}"],
    'Ridge': [f"{r_mse_tr:.4f}", f"{r_mse_te:.4f}", f"{r_r2_tr:.4f}", f"{r_r2_te:.4f}", f"{r_nz}/{n_features}"]
})

st.table(metrics_df)

# --- Coefficient Comparison ---
st.subheader("Coefficient Value Comparison")
coef_df = pd.DataFrame({
    'Feature': [f"F{i}" for i in range(n_features)],
    'True Data Coeff': coef_true if n_features > 0 else [], # Handle case if 0 features technically allowed
    'Lasso Coeff': l_coef,
    'Ridge Coeff': r_coef
})
if n_features > 20:
    st.write("Showing first 20 coefficients:")
    st.dataframe(coef_df.head(20))
else:
    st.dataframe(coef_df)
