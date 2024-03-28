import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Login } from "./page/login";
import { ConfigProvider } from "antd";
import { SignUp } from "./page/signup";
import Dashboard from "./component/dashboard";
import Profile from "./page/profile";
import { ManageUser } from "./page/admin/user";
import { ManagePurchaseOrder } from "./page/staff/order";
function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <h1>home</h1>,
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
