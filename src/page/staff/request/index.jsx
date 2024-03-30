import {
  Avatar,
  Button,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Table,
  Tooltip,
  Upload,
} from "antd";
import "./index.css";
import { useEffect, useState } from "react";
import api from "../../../config/axios";
import { formatDistance } from "date-fns";
import { UploadOutlined } from "@ant-design/icons";
import { useForm } from "antd/es/form/Form";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
const props = {
  name: "file",
};
export const ManageRequest = () => {
  const [form] = useForm();
  const [warehouse, setWarehouse] = useState([]);
  const [request, setRequest] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [orders, serOrders] = useState([]);
  const [pagination, setPagination] = useState({});
  const user = useSelector((store) => store.user);
  const [users, setUsers] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [assignStaff, setAssignStaff] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState();
  const [loading, setLoading] = useState(true);
  const fetchWarehouse = async (page = 0) => {
    const response = await api.get(`/warehouse?PageIndex=${page}`);
    setWarehouse(response.data.data.pagingData);
  };

  const fetchRequest = async (page = 0) => {
    try {
      const response = await api.get(`/request?PageIndex=${page}`);

      // Fetching request details for each item
      const requestsWithDetails = await Promise.all(
        response.data.data.pagingData.map(async (item) => {
          const staffResponse = await api.get(
            `/request/${item.id}/request-detail`
          );
          const staff = staffResponse.data.data[0].listMembers;
          return {
            ...item,
            staff, // assuming you want to add staff data to each item
          };
        })
      );

      // Updating state with fetched data
      setRequest(requestsWithDetails);

      setPagination({
        ...pagination,
        total: response.data.data.totalCount,
        current: response.data.data.pageIndex,
        pageSize: response.data.data.pageSize,
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching request:", error);
      // Handle error
    }
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
    console.log(user);
    setUsers(user);
  };

  const fetchOrder = async (page = 0) => {
    const response = await api.get(`/purchase-order?PageIndex=${page}`);
    const order = await Promise.all(
      response.data.data.pagingData.map(async (item) => {
        const user = (await api.get(`/user/${item.userId}`)).data.data;
        return {
          ...item,
          user: user.name,
          key: item.id,
        };
      })
    );
    serOrders(order);
  };

  const onFinish = async (values) => {
    console.log(values);
    const formApi = new FormData();
    formApi.append("Title", values.title);
    formApi.append("Description", values.description);
    formApi.append("RelatedInformation", values.relatedInformation);
    formApi.append("WarehouseId", values.warehouseId);
    if (values?.relatedInformation?.file) {
      formApi.append(
        "Attachment",
        values.relatedInformation.file.originFileObj
      );
    }

    await api.post("request", formApi);
    fetchRequest(pagination.current);
    toast.success("Successfully create new request");
    form.resetFields();
    setShowModal(false);
  };

  useEffect(() => {
    fetchWarehouse();
    fetchOrder();
    fetchRequest(pagination.current);
    fetchUser();
  }, []);

  const handleApprove = async (id) => {
    const response = await api.put(`/request/${id}/approve`, {
      isApproved: true,
    });

    console.log(response);
    fetchRequest(pagination.current);

    toast.success("Successfully approve request");
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Member",
      dataIndex: "staff",
      key: "staff",
      render: (value) => (
        <Avatar.Group>
          {value.map((item) => {
            return (
              <Tooltip
                key={item.id}
                title={`${item.staffName} (${item.roleRelate})`}
                placement="top"
              >
                <Avatar
                  style={{ backgroundColor: "#87d068" }}
                  src={
                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=3560&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  }
                />
              </Tooltip>
            );
          })}
        </Avatar.Group>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Create At",
      dataIndex: "dateCreate",
      key: "dateCreate",
      render: (value) =>
        formatDistance(new Date(value), new Date(), { addSuffix: true }),
    },
    {
      title: "Action",
      dataIndex: "id",
      key: "id",
      render: (value, record) => {
        return user.role === "Manage warehouse department" ? (
          <>
            {record.status === "Pending" && (
              <Button type="primary" onClick={() => handleApprove(value)}>
                Approve
              </Button>
            )}
            {record.status === "InProgress" && (
              <Button
                type="primary"
                onClick={() => {
                  setSelectedRequest(record.id);
                  setAssignStaff(true);
                }}
              >
                Assign Staff
              </Button>
            )}
            {record.status === "InProgress" && (
              <Button
                type="primary"
                onClick={() => {
                  setSelectedRequest(record.id);
                  setAssignStaff(true);
                }}
              >
                Create
              </Button>
            )}
          </>
        ) : (
          <></>
        );
      },
    },
  ];

  const handleTableChange = (pagination) => {
    fetchRequest(pagination.current);
  };

  return (
    <div>
      <Button
        type="primary"
        style={{
          marginBottom: 10,
        }}
        onClick={() => setShowModal(true)}
      >
        Add new request
      </Button>
      <Table
        loading={loading}
        pagination={pagination}
        dataSource={request}
        columns={columns}
        onChange={handleTableChange}
      />
      <Modal
        open={showModal}
        title="Create request"
        onCancel={() => setShowModal(false)}
        onOk={() => form.submit()}
      >
        <Form
          form={form}
          onFinish={onFinish}
          labelCol={{
            span: 24,
          }}
        >
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Please input title!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "Please input description!" }]}
          >
            <Input />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                label="Related Information"
                name="relatedInformation"
                rules={[
                  {
                    required: true,
                    message: "Please input the relatedInformation!",
                  },
                ]}
              >
                <Select
                  options={orders.map((item) => {
                    return {
                      value: item.id,
                      label: item.poCode,
                    };
                  })}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Warehouse"
                name="warehouseId"
                rules={[
                  { required: true, message: "Please input the warehouse!" },
                ]}
              >
                <Select
                  options={warehouse.map((item) => {
                    return {
                      value: item.id,
                      label: item.name,
                    };
                  })}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Attachment"
            name="Attachment"
            // rules={[
            //   { required: true, message: "Please input the attachment!" },
            // ]}
          >
            <Upload {...props}>
              <Button icon={<UploadOutlined />}>Click to Upload</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Assign Staff"
        open={assignStaff}
        width={800}
        onOk={async () => {
          await api.post(
            `request/${selectedRequest}/user?userId=${selectedStaff}`
          );
          setAssignStaff(false);
          setSelectedStaff(null);
          setSelectedRequest(null);
          fetchRequest(pagination.current);
        }}
        onCancel={() => {
          setSelectedStaff(null);
          setAssignStaff(false);
        }}
      >
        <Row gutter={[12, 12]}>
          {users.map((user) => {
            return (
              <Col span={6} key={user.id}>
                <div
                  className={`user ${
                    user.id === selectedStaff ? "active" : ""
                  }`}
                  onClick={() => {
                    setSelectedStaff(user.id);
                  }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=3560&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt=""
                  />
                  <span>{user.name}</span>
                </div>
              </Col>
            );
          })}
        </Row>
      </Modal>
    </div>
  );
};
