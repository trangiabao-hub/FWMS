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
} from "antd";
import { useEffect, useState } from "react";
import api from "../../../config/axios";
import { formatDistance } from "date-fns";
import { useForm } from "antd/es/form/Form";
import { toast } from "react-toastify";
import { QuestionCircleOutlined } from "@ant-design/icons";
export const ManageMaterial = () => {
  const [material, setMaterial] = useState([]);
  const [categoies, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(-2);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [warehouse, setWarehouse] = useState([]);

  const [form] = useForm();
  const fetchMaterial = async (page = 0) => {
    const response = await api.get(`/material?PageIndex=${page}`);
    setMaterial(response.data.data.pagingData);
    console.log(
      Math.ceil(response.data.data.totalCount / response.data.data.pageSize)
    );
    setPagination({
      ...pagination,
      total: response.data.data.totalCount,
      current: response.data.data.pageIndex,
      pageSize: response.data.data.pageSize,
    });
    setLoading(false);
  };

  const fetchCategory = async (page = 0) => {
    const response = await api.get(`/category?PageIndex=${page}`);
    setCategories(response.data.data.pagingData);
  };

  const fetchWarehouse = async (page = 0) => {
    const response = await api.get(`/warehouse?PageIndex=${page}`);
    setWarehouse(response.data.data.pagingData);
  };

  useEffect(() => {
    fetchMaterial();
    fetchCategory();
    fetchWarehouse();
  }, []);

  const columns = [
    {
      title: "Id",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <div
          style={{
            maxWidth: 200,
          }}
        >
          {text}
        </div>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text) => (
        <div
          style={{
            maxWidth: 400,
          }}
        >
          {text}
        </div>
      ),
    },
    {
      title: "Create at",
      dataIndex: "dateCreate",
      key: "dateCreate",
      render: (value) =>
        formatDistance(new Date(value), new Date(), { addSuffix: true }),
    },
    {
      title: "Update at",
      dataIndex: "dateUpdate",
      key: "dateUpdate",
      render: (value) =>
        formatDistance(new Date(value), new Date(), { addSuffix: true }),
    },
    {
      title: "Action",
      dataIndex: "id",
      key: "id",
      render: (value, record, index) => (
        <Row>
          <Button
            style={{
              marginRight: 10,
            }}
            type="primary"
            onClick={() => {
              setShowModal(index);
            }}
          >
            Edit
          </Button>
          <Popconfirm
            placement="rightBottom"
            title="Delete the order"
            description="Are you sure to delete this order?"
            icon={<QuestionCircleOutlined style={{ color: "red" }} />}
            onConfirm={async () => {
              await api.delete(`/material/${value}`).then(() => {
                toast.success("material deleted");
                fetchMaterial(pagination.current);
              });
            }}
          >
            <Button danger type="primary">
              Delete
            </Button>
          </Popconfirm>
        </Row>
      ),
    },
  ];

  const onSubmit = async (values) => {
    if (material[showModal]) {
      await api.put(`/material/${material[showModal].id}`, values);
      toast.success("Successfully update material");
    } else {
      await api.post("/material", values);
      toast.success("Successfully created new material");
    }
    form.resetFields();
    setShowModal(-2);
    fetchMaterial(pagination.current);
  };

  const handleTableChange = (pagination) => {
    fetchMaterial(pagination.current);
  };

  useEffect(() => {
    console.log(showModal);
    if (showModal >= 0) {
      console.log(material[showModal]);
      form.setFieldsValue(material[showModal]);
    } else {
      form.resetFields();
    }
  }, [showModal]);

  return (
    <div>
      <Button
        type="primary"
        style={{
          marginBottom: 10,
        }}
        onClick={() => setShowModal(-1)}
      >
        Add new material
      </Button>
      <Table
        loading={loading}
        dataSource={material}
        columns={columns}
        pagination={pagination}
        onChange={handleTableChange}
      />
      <Modal
        open={showModal !== -2}
        title="Add material"
        onOk={() => form.submit()}
        onCancel={() => setShowModal(-2)}
      >
        <Form onFinish={onSubmit} form={form} labelCol={{ span: 24 }}>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please input name!" }]}
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
                label="Unit"
                name="unit"
                rules={[{ required: true, message: "Please input the unit!" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Unit Price"
                name="unitPrice"
                rules={[
                  { required: true, message: "Please input the unit price!" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                label="Category"
                name="categoryId"
                rules={[
                  { required: true, message: "Please input the category!" },
                ]}
              >
                <Select
                  options={categoies?.map((item) => {
                    return {
                      value: item.id,
                      label: item.name,
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
        </Form>
      </Modal>
    </div>
  );
};
