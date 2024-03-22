import { Wave } from "../../component/wave";
import { Button, Form, Input, Select } from "antd";
import "./index.scss";
export const SignUp = () => {
  const onFinish = (values) => {
    console.log(values);
  };
  return (
    <Wave>
      <div className="login">
        <div className="login__form">
          <h1>Register</h1>
          <Form
            labelCol={{
              span: 24,
            }}
            style={{
              width: 500,
              height: 400,
              overflow: "auto",
            }}
            name="basic"
            initialValues={{ remember: true }}
            onFinish={onFinish}
          >
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: "Please input your name!" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Username"
              name="userName"
              rules={[
                { required: true, message: "Please input your username!" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              label="Gender"
              name="gender"
              rules={[
                { required: true, message: "Please select your gender!" },
              ]}
            >
              <Select>
                <Select.Option value={0}>Male</Select.Option>
                <Select.Option value={1}>Female</Select.Option>
                <Select.Option value={2}>Other</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Phone"
              name="phone"
              rules={[
                { required: true, message: "Please input your phone number!" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Address"
              name="address"
              rules={[
                { required: true, message: "Please input your address!" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Avatar"
              name="avatar"
              rules={[
                { required: true, message: "Please input your avatar URL!" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Role ID"
              name="roleId"
              rules={[
                { required: true, message: "Please input your Role ID!" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </Wave>
  );
};
