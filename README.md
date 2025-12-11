# 📊 Lasso vs Ridge Regression Visualizer

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![React](https://img.shields.io/badge/React-19.0-61dafb.svg?logo=react) ![Vite](https://img.shields.io/badge/Vite-Fast-646cff.svg?logo=vite) ![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8.svg?logo=tailwindcss)

> **A premium interactive tool to visualize and understand the impact of L1 and L2 regularization on regression coefficients.**

---

## 🌟 Overview

Understanding the nuanced differences between **Lasso (L1)** and **Ridge (L2)** regularization is crucial for machine learning practitioners. This application provides a real-time, interactive environment to observe how these techniques handle coefficient shrinkage and feature selection.

Interact with the regularization strength ($\lambda$) and watch as:
- **Ridge** gracefully shrinks coefficients towards zero, keeping all features in the model.
- **Lasso** aggressively forces less important coefficients to **exactly zero**, effectively performing automatic feature selection.

---

## 🚀 Key Features

- **🔥 Real-time Interaction**: Adjust the regularization parameter ($\lambda$) instantly via a precision slider.
- **📈 Dynamic Path Plots**: Visualize the entire "regularization path" to see how coefficients evolve from unregularized ($\lambda=0$) to highly constrained states.
- **📊 Comparative Analysis**: Side-by-side bar charts comparing True coefficients vs. Ridge and Lasso estimates.
- **🎲 Synthetic Data Generator**: Instantly generate new datasets with sparse ground-truth coefficients to test model robustness.
- **🧮 Custom Math Engine**: Built-from-scratch implementations of **Coordinate Descent** (for Lasso) and **Normal Equation** solvers (for Ridge) running directly in the browser.

---

## 🛠️ Tech Stack

- **Frontend Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) for blazing fast performance.
- **Visualization**: [Recharts](https://recharts.org/) for responsive and beautiful data storytelling.
- **Mathematics**: [Math.js](https://mathjs.org/) for matrix operations and linear algebra.
- **Styling**: [TailwindCSS](https://tailwindcss.com/) for a modern, glassmorphic dark-mode aesthetic.
- **Icons**: [Lucide React](https://lucide.dev/) for crisp, consistent iconography.

---

## 🧠 The Theory Checklist

| Feature | **Lasso (L1)** | **Ridge (L2)** |
| :--- | :--- | :--- |
| **Penalty Term** | Absolute value of coefficients $\sum \|w_i\|$ | Square of coefficients $\sum w_i^2$ |
| **Effect** | Can output sparse models (coefficients = 0) | Shrinks coefficients but rarely to 0 |
| **Use Case** | Feature Selection, Sparse Data | Prevent Overfitting, Collinear Data |
| **Solution Method** | Iterative (e.g., Coordinate Descent) | Closed Form (Normal Equation) |

---

## 💻 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SudoAnirudh/Lasso-Ridge-regression_comparison.git
   cd Lasso-Ridge-regression_comparison
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Launch**
   Open your browser and navigate to `http://localhost:5173` to start exploring!

---

## 📷 Usage Guide

1.  **Generate Data**: Click the **New Data** button to create a random dataset where some "True" coefficients are explicitly set to zero.
2.  **Adjust Lambda**: Drag the slider to change the regularization strength. Low $\lambda$ means less bias (closer to standard Linear Regression), while high $\lambda$ increases bias to reduce variance.
3.  **Observe Sparsity**: Look at the **Lasso Path**. Notice how some lines hit the x-axis (0) and stay there? That's identifying the irrelevant features!
4.  **Compare**: Check the **Current Coefficients** chart to see how close the estimates are to the "True" values.

---

## 🤝 Contributing

Contributions are welcome! If you have ideas for more advanced visualizations (like Elastic Net) or optimization improvements, feel free to open a PR.

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
