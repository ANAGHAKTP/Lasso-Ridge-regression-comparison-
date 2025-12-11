# Deployment Instructions

## Local Deployment
The application is currently running locally. You can access it at:
http://localhost:5173

## Vercel Deployment
This project is configured for deployment on Vercel.

1. Install Vercel CLI (if not installed):
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Deploy to Production:
   ```bash
   vercel --prod
   ```

## Demonstration
The application demonstrates the difference between Lasso (L1) and Ridge (L2) regression:
- **Lasso**: Coefficients can become exactly zero (feature selection).
- **Ridge**: Coefficients shrink towards zero but rarely reach it.

Use the slider to change regularization strength (λ) and observe the "Current Coefficients" chart.
