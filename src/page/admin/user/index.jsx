import {
  Button,
  Col,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Table,
  Upload,
} from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { Option } from "antd/es/mentions";
import { useEffect, useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { useForm } from "antd/es/form/Form";
import api from "../../../config/axios";
import uploadFile from "../../../utils/upload";
import { formatDistance } from "date-fns";
import { toast } from "react-toastify";
export const ManageUser = () => {
  const [showModal, setShowModal] = useState(false);
  const [form] = useForm();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [fileList, setFileList] = useState([]);
  const [roles, setRoles] = useState([]);
  const [user, setUser] = useState([]);
  const [loading, setLoading] = useState(true);
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Username",
      dataIndex: "userName",
      key: "userName",
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "roleId",
    },
    {
      title: "Date Created",
      dataIndex: "dateCreate",
      key: "dateCreate",
      render: (value) => {
        return formatDistance(new Date(value), new Date(), { addSuffix: true });
      },
    },
    {
      title: "Date Updated",
      dataIndex: "dateUpdate",
      key: "dateUpdate",
      render: (value) => {
        return formatDistance(new Date(value), new Date(), { addSuffix: true });
      },
    },
    {
      title: "Action",
      dataIndex: "id",
      key: "id",
      render: (value) => {
        return (
          <>
            <Popconfirm
              placement="rightBottom"
              title="Delete the order"
              description="Are you sure to delete this order?"
              icon={<QuestionCircleOutlined style={{ color: "red" }} />}
              onConfirm={async () => {
                await api.delete(`/user/${value}`).then(() => {
                  toast.success("User deleted");
                  fetchUser();
                });
              }}
            >
              <Button danger type="primary">
                Delete
              </Button>
            </Popconfirm>
          </>
        );
      },
    },
  ];
  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  const handleCancel = () => setPreviewOpen(false);
  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
    setPreviewTitle(
      file.name || file.url.substring(file.url.lastIndexOf("/") + 1)
    );
  };
  const handleChange = ({ fileList: newFileList }) => setFileList(newFileList);
  const uploadButton = (
    <button
      style={{
        border: 0,
        background: "none",
      }}
      type="button"
    >
      <PlusOutlined />
      <div
        style={{
          marginTop: 8,
        }}
      >
        Upload
      </div>
    </button>
  );

  const onFinish = async (values) => {
    console.log("Received values:", values);
    if (values?.avatar?.file) {
      const url = await uploadFile(values.avatar.file.originFileObj);
      values.avatar = url;
    }

    try {
      const response = await api.post("/user", values);
      form.resetFields();
      setShowModal(false);
      console.log(response.data);
      fetchUser();
      toast.success("Successfully created purchase order");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const fetchRole = async () => {
    const response = await api.get("/role");
    setRoles(response.data.data.pagingData);
  };

  const fetchUser = async () => {
    const response = await api.get("/user");
    const user = await Promise.all(
      response.data.data.pagingData.map(async (item) => {
        const role = (await api.get(`/role/${item.roleId}`)).data.data;
        return {
          ...item,
          role: role.name,
        };
      })
    );
    setLoading(false);
    console.log(user);
    setUser(user);
  };

  useEffect(() => {
    fetchRole();
    fetchUser();
  }, []);

  return (
    <div>
      <Button
        type="primary"
        onClick={() => {
          setShowModal(true);
        }}
      >
        Add new user
      </Button>
      <Table loading={loading} columns={columns} dataSource={user} />;
      <Modal
        open={showModal}
        onOk={() => {
          form.submit();
        }}
        onCancel={() => {
          setShowModal(false);
        }}
      >
        <Form
          form={form}
          name="basic"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          labelCol={{
            span: 24,
          }}
        >
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                label="Name"
                name="name"
                rules={[{ required: true, message: "Please input your name!" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Username"
                name="userName"
                rules={[
                  { required: true, message: "Please input your username!" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Gender"
                name="gender"
                rules={[
                  { required: true, message: "Please select your gender!" },
                ]}
              >
                <Select>
                  <Option value={0}>Male</Option>
                  <Option value={1}>Female</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Role ID"
                name="roleId"
                rules={[
                  { required: true, message: "Please input your role ID!" },
                ]}
              >
                <Select>
                  {roles.map((role) => {
                    return (
                      <Option key={role.id} value={role.id}>
                        {role.name}
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Password"
                name="password"
                rules={[
                  { required: true, message: "Please input your password!" },
                ]}
              >
                <Input.Password />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Re-Password"
                name="repassword"
                rules={[
                  { required: true, message: "Please input your password!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("The two passwords do not match!")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password />
              </Form.Item>
            </Col>
          </Row>

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
            rules={[{ required: true, message: "Please input your address!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Avatar"
            name="avatar"
            // rules={[
            //   { required: true, message: "Please input your avatar URL!" },
            // ]}
          >
            <Upload
              action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
              listType="picture-card"
              fileList={fileList}
              onPreview={handlePreview}
              onChange={handleChange}
              maxCount={1}
            >
              {fileList.length >= 8 ? null : uploadButton}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={handleCancel}
      >
        <img
          alt="example"
          style={{
            width: "100%",
          }}
          src={previewImage}
        />
      </Modal>
    </div>
  );
};
