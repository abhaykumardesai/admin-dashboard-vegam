# Vegam Admin Dashboard - Frontend Assignment

This project is a fully functional and responsive admin dashboard for managing users, built as a take-home assignment for Vegam. It features a modern, metadata-driven data grid with real-time search and optimistic UI updates.

**Live Demo:** [https://vegam-dashboard.onrender.com/](https://vegam-dashboard.onrender.com/)


## Core Features Implemented

- ✅ **Metadata-Driven Table:** The data grid columns, widths, and custom cell rendering are all dynamically generated from a central JSON configuration (`column-metadata.json`), making the table highly maintainable.

- ✅ **Mock API with MSW:** Utilizes Mock Service Worker (MSW) to simulate a complete backend, providing realistic data fetching, searching, and patching without needing a live server.

- ✅ **Optimistic UI Updates:** When activating or deactivating a user, the UI updates instantly for a seamless and fast user experience. The change is then synchronized with the mock API in the background.

- ✅ **Fully Responsive Design:** The dashboard is designed to be usable across all devices. Non-essential columns are automatically hidden on mobile and tablet screens to prevent horizontal scrolling and maintain a clean layout.

- ✅ **Debounced Server-Side Search:** A search bar allows filtering users by name or email. The search query is debounced to prevent excessive API calls, ensuring efficient data fetching as the user types.

- ✅ **Performance-Optimized:** Implements `react-query` for efficient data caching and `material-react-table`'s row virtualization to ensure smooth performance, even with hundreds of rows.

- ✅ **Modern Tech Stack:** Built with the latest industry-standard tools including React 18, TypeScript, Vite, and Material UI.

## Tech Stack

- **Framework:** React 18 + TypeScript  
- **Build Tool:** Vite  
- **Component Library:** Material UI & Material React Table  
- **Data Fetching & State Management:** TanStack Query (React Query)  
- **Mock API:** Mock Service Worker (MSW)  
- **Utilities:** Faker.js (for data generation), date-fns (for date formatting)  
- **Linting & Formatting:** ESLint + Prettier  

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)  
- npm or yarn  

### Installation & Setup

1. Clone the repository:

```bash
git clone https://github.com/your-username/vegam-frontend-assignment.git
cd vegam-frontend-assignment
```
2. **Install dependencies**
   ```bash
   npm install
3. **Run the development server**
   ```bash
   npm run dev
4. **Open http://localhost:5173 in your browser to view the app.**
