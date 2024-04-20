import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Login } from "./page/login";
import { ConfigProvider } from "antd";
import { SignUp } from "./page/signup";
import Dashboard from "./component/dashboard";
import Profile from "./page/profile";
import { ManageUser } from "./page/admin/user";
import { ManagePurchaseOrder } from "./page/staff/order";
import { Home } from "./page/home";
import { ManageCategory } from "./page/admin/category";
import { ManageMaterial } from "./page/admin/material";
import { ManageRequest } from "./page/staff/request";
import { ManageProduct } from "./page/staff/product";
function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/signup",
      element: <SignUp />,
    },
    {
      path: "/dashboard",
      element: <Dashboard />,
      children: [
        { path: "profile", element: <Profile /> },
        { path: "user", element: <ManageUser /> },
        { path: "order", element: <ManagePurchaseOrder /> },
        { path: "category", element: <ManageCategory /> },
        { path: "material", element: <ManageMaterial /> },
        { path: "request", element: <ManageRequest /> },
        { path: "product", element: <ManageProduct /> },
      ],
    },
  ]);

  return (
    <ConfigProvider
      theme={{
        token: {
          // Seed Token
          colorPrimary: "#359567",
          borderRadius: 4,

          // Alias Token
          colorBgContainer: "#fff",
        },
      }}
    >
      <RouterProvider router={router} />
    </ConfigProvider>
  );
}

export default App;
