import { Button, Form, Input, Row } from "antd";
import { Wave } from "../../component/wave";
import "./index.scss";
import api from "../../config/axios";
import { useDispatch } from "react-redux";
import { login } from "../../redux/features/user";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const onFinish = async (values) => {
    try {
      const response = await api.post("/user/login", values);
      dispatch(login(response.data.data));
      localStorage.setItem("token", response.data.data.tokenString);
      if (
        response.data.data.role === "Admin" ||
        response.data.data.role === "Purchasing staff" ||
        response.data.data.role === "Manage warehouse department" ||
        response.data.data.role === "Warehouse staff" ||
        response.data.data.role === "Quality inspection staff"
      ) {
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error(err.response.data.message);
    }
  };
  return (
    <Wave>
      <div className="login">
        <div className="login__form">
          <h1>Login</h1>

          <Form
            onFinish={onFinish}
            labelCol={{
              span: 24,
            }}
            style={{
              width: 500,
            }}
          >
            <Form.Item
              label="Username"
              name="username"
              rules={[
                {
                  required: true,
                  message: "Please input your username!",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Password"
              name="password"
              rules={[
                {
                  required: true,
                  message: "Please input your password!",
                },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item>
              <Row justify={"center"}>
                <Button
                  style={{
                    width: 120,
                  }}
                  type="primary"
                  htmlType="submit"
                >
                  Login
                </Button>
              </Row>
            </Form.Item>
          </Form>
        </div>
      </div>
    </Wave>
  );
};
