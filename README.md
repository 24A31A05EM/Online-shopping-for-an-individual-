# MAISON - Personal Boutique E-commerce App

MAISON is a beautifully crafted, fully functional front-end e-commerce application built with React, TypeScript, and Tailwind CSS. It features a dark luxury boutique theme, offering users a seamless and visually rich shopping experience.

## ✨ Features

*   **Product Discovery:** Browse products across various categories (Electronics, Beauty, Home, Jewellery, Fashion) with filtering and sorting capabilities.
*   **Interactive Product Modal:** View detailed product specifications, descriptions, and high-quality imagery in a smooth, animated modal.
*   **Shopping Cart:** Add items, adjust quantities, and remove products with a persistent cart panel.
*   **Wishlist (Favorites):** Save favorite items for later and easily move them to the cart.
*   **Multi-step Checkout:** A streamlined checkout flow including shipping details, payment method selection (mocked), promo code application, and order confirmation.
*   **Order History:** View past orders, track their status, and easily reorder items.
*   **User Authentication (Mocked):** Sign in or register to save preferences, addresses, and order history.
*   **Custom UI Elements:** Features a custom animated cursor, smooth page transitions, and toast notifications for user feedback.
*   **Responsive Design:** Fully responsive layout that adapts elegantly to mobile, tablet, and desktop screens.

## 🛠️ Tech Stack

*   **Framework:** [React 19](https://react.dev/)
*   **Build Tool:** [Vite](https://vitejs.dev/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) & Custom CSS
*   **Icons:** [Lucide React](https://lucide.dev/)
*   **State Management:** React Context API (`AppContext`) with `localStorage` persistence.

## 🚀 Getting Started

To run this project locally, follow these steps:

1.  **Clone the repository** (if applicable) or download the source code.
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Start the development server:**
    ```bash
    npm run dev
    ```
4.  Open your browser and navigate to `http://localhost:3000` (or the port specified by Vite).

## 📁 Project Structure

*   `/src/components/`: Reusable UI components (Header, Footer, CartPanel, ProductModal, ToastContainer, Cursor).
*   `/src/context/`: Global state management (`AppContext.tsx`).
*   `/src/data/`: Mock data for products and specifications (`products.ts`).
*   `/src/pages/`: Main application views (Home, Checkout, Favorites, Orders, Login).
*   `/src/styles/`: Custom CSS files for specific component styling and animations.
*   `/src/App.tsx`: Main application component handling routing and layout.
*   `/src/main.tsx`: Entry point for the React application.

## 🎨 Design Philosophy

MAISON embraces a "dark luxury" aesthetic, utilizing deep backgrounds (`#0d0b08`), warm cream text (`#f7f3ed`), and elegant gold/terracotta accents. The typography pairs a sophisticated serif (`Cormorant Garamond`) with clean sans-serif (`Outfit`) and monospace (`DM Mono`) fonts to create a modern, editorial feel. Smooth animations and a custom cursor enhance the premium interactive experience.
