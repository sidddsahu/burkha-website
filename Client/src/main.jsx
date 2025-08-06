// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.jsx'

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )



import { createRoot } from 'react-dom/client';
import './index.css'; // Ensure your CSS file is correctly linked
import App from './App.jsx'; // Adjust the import path if necessary
import { Provider } from 'react-redux';
// import './App.css';
import store from './components/Store/store.jsx'; // Adjust the import path to your store

// Create a root for the React application
const root = createRoot(document.getElementById('root'));

// Render the application wrapped in the Redux Provider
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);