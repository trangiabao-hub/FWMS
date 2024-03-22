import { Button, Form, Modal, Table, Upload } from "antd";
import { useEffect, useState } from "react";
import api from "../../../config/axios";
import { formatDistance } from "date-fns";
import { useForm } from "antd/es/form/Form";
import { UploadOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
export const ManagePurchaseOrder = () => {
  const [orders, serOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form] = useForm();

  const fetchOrder = async () => {
    const response = await api.get("/purchase-order");
    const order = await Promise.all(
      response.data.data.pagingData.map(async (item) => {
        const user = (await api.get(`/user/${item.userId}`)).data.data;
        return {
          ...item,
          user: user.name,
        };
      })
    );
    console.log(order);
    serOrders(order);
  };

  useEffect(() => {
    fetchOrder();
  }, []);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "PO Code",
      dataIndex: "poCode",
      key: "poCode",
    },
    {
      title: "Supplier",
      dataIndex: "supplier",
      key: "supplier",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Fax",
      dataIndex: "fax",
      key: "fax",
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
    },
    {
      title: "Total Price",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (totalPrice) => totalPrice.toLocaleString(),
    },
    {
      title: "User",
      dataIndex: "user",
      key: "user",
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
      title: "Download",
      dataIndex: "uri",
      key: "uri",
      render: (value) => {
        return (
          <a href={value} target="_blank">
            Download
          </a>
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
      const response = await api.post("/purchase-order/excel-file", formData);
      console.log(response);
      form.resetFields();
      setShowModal(false);
      fetchOrder();
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
        Add new purchase order
      </Button>
      <Table columns={columns} dataSource={orders} />
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
