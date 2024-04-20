import {
  Button,
  Descriptions,
  Form,
  Modal,
  Popconfirm,
  Table,
  Tabs,
  Upload,
} from "antd";
import { useEffect, useState } from "react";
import api from "../../../config/axios";
import { formatDistance } from "date-fns";
import { useForm } from "antd/es/form/Form";
import { UploadOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { QuestionCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { formatVND } from "../../../utils/currency";
export const ManageProduct = () => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form] = useForm();
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});

  const fetchProduct = async () => {
    const response = await api.get("/production-plan");
    setPagination({
      ...pagination,
      total: response.data.data.totalCount,
      current: response.data.data.pageIndex,
      pageSize: response.data.data.pageSize,
    });
    setProducts(response.data.data.pagingData);
    console.log(response.data.data.pagingData);
    setLoading(false);
  };

  useEffect(() => {
    fetchProduct();
  }, []);

  const columns = [
    {
      title: "Lot No",
      dataIndex: "lotNo",
      key: "lotNo",
    },
    {
      title: "Lot Name",
      dataIndex: "lotName",
      key: "lotName",
    },
    {
      title: "Total Phase",
      dataIndex: "totalPhase",
      key: "totalPhase",
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "User ID",
      dataIndex: "userId",
      key: "userId",
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
                await api.delete(`/production-plan/${value}`).then(() => {
                  toast.success("Order deleted");
                });
                fetchProduct();
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

  const handleSubmitFile = async (values) => {
    const formData = new FormData();
    formData.append(
      "file",
      values.file.file.originFileObj,
      "Purchase Order.xlsx"
    );
    try {
      const response = await api.post("/production-plan/excel-file", formData);
      form.resetFields();
      setShowModal(false);
      toast.success("Successfully created purchase order");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  return (
    <div>
      <Button
        onClick={() => {
          setShowModal(true);
        }}
        type="primary"
      >
        Add new product plan
      </Button>
      <Table
        loading={loading}
        columns={columns}
        dataSource={products}
        pagination={pagination}
      />
      <Modal
        open={showModal}
        onCancel={() => {
          setShowModal(false);
        }}
        onOk={() => {
          form.submit();
        }}
      >
        <Form
          form={form}
          labelCol={{
            span: 24,
          }}
          onFinish={handleSubmitFile}
        >
          <Form.Item label="File" name="file">
            <Upload
              action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
              listType="picture"
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Upload Purchase Order</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
