
import "./App.css";

import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import DashboardLayout from "./components/ui/DashboardLayout";

import AddProduct from "./pages/AddProduct";
import ProductList from "./pages/ProductList";
import EditProduct from "./pages/EditProduct";

import AddUser from "./pages/AddUser";
import UserList from "./pages/UserList";
import EditUser from "./pages/EditUser";

import AddCollection from "./pages/AddCollection";

import { Toaster } from "./components/ui/toast";
import { AuthProvider } from "./context/AuthContext";

import ProtectedRoute from "./authentication/ProtectedRoute";
import PermissionRoute from "./authentication/PermissionRoute";

const router = createBrowserRouter([
  // Root URL
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },

  // Login page
  {
    path: "/login",
    element: <Login />,
  },

  // Authentication protection
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/dashboard",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <div>Welcome to Dashboard</div>,
          },

          // Products
          {
            path: "addproduct",
            element: (
              <PermissionRoute
                resource="PRODUCTS"
                action="CREATE"
              >
                <AddProduct />
              </PermissionRoute>
            ),
          },
          {
            path: "productlist",
            element: (
              <PermissionRoute
                resource="PRODUCTS"
                action="READ"
              >
                <ProductList />
              </PermissionRoute>
            ),
          },
          {
            path: "editproduct/:id",
            element: (
              <PermissionRoute
                resource="PRODUCTS"
                action="UPDATE"
              >
                <EditProduct />
              </PermissionRoute>
            ),
          },

          // Collections
          {
            path: "addcollection",
            element: (
              <PermissionRoute
                resource="COLLECTION"
                action="CREATE"
              >
                <AddCollection />
              </PermissionRoute>
            ),
          },

          // Users
          {
            path: "adduser",
            element: (
              <PermissionRoute
                resource="USER"
                action="CREATE"
              >
                <AddUser />
              </PermissionRoute>
            ),
          },
          {
            path: "userlist",
            element: (
              <PermissionRoute
                resource="USER"
                action="READ"
              >
                <UserList />
              </PermissionRoute>
            ),
          },
          {
            path: "edituser/:id",
            element: (
              <PermissionRoute
                resource="USER"
                action="UPDATE"
              >
                <EditUser />
              </PermissionRoute>
            ),
          },
        ],
      },
    ],
  },

  // Unknown URLs
  {
    path: "*",
    element: <div className="p-6">404 - Page Not Found</div>,
  },
]);

function App() {
  return (
    <AuthProvider>
      <Toaster>
        <RouterProvider router={router} />
      </Toaster>
    </AuthProvider>
  );
}

export default App;
