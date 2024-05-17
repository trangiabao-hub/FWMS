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
import "./index.css";
import { QuestionCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { formatVND } from "../../../utils/currency";
export const ManagePurchaseOrder = () => {
  const [orders, serOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form] = useForm();
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    const response = await api.get("/purchase-order");
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
    setLoading(false);
    serOrders(order);
  };

  useEffect(() => {
    fetchOrder();
  }, []);

  const columns = [
    {
      title: "STT(NO)",
      dataIndex: "id",
      key: "id",
      render: (value, record, index) => {
        return index + 1;
      },
    },
    {
      title: "PO Code",
      dataIndex: "poCode",
      key: "poCode",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
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
          <Button
            onClick={() => {
              window.open(value, "_blank");
            }}
          >
            Download
          </Button>
        );
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
                await api.delete(`/purchase-order/${value}`).then(() => {
                  toast.success("Order deleted");
                  fetchOrder();
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

  const handleSubmitFile = async (values) => {
    const formData = new FormData();
    formData.append(
      "file",
      values.file.file.originFileObj,
      "Purchase Order.xlsx"
    );
    try {
      const response = await api.post("/purchase-order/excel-file", formData);
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
      <Table
        loading={loading}
        columns={columns}
        dataSource={orders}
        expandedRowRender={(record) => {
          return <OrderDetail orderId={record.id} />;
        }}
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

// eslint-disable-next-line react/prop-types
export const OrderDetail = ({ orderId }) => {
  const [orderDetail, setOrderDetail] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrderDetailPhase = async () => {
    const arr = [];
    const response = await api.get(
      `/purchase-order-phase/${orderId}/purchase-order-phase-details`
    );
    const response2 = await api.get(
      `/purchase-order/${orderId}/purchase-order-details`
    );
    arr.push(response2.data.data[0]);
    arr.push(...response.data.data);
    setOrderDetail(arr);
    setLoading(false);
    // const arr = [...orderDetail];
    // console.log(arr);
    // arr.push(...response.data.data);
    // console.log(arr);
    // setOrderDetail(arr);
    // setLoading(false);
  };

  const columns = [
    {
      title: "Material Name",
      dataIndex: "materialName",
      key: "materialName",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Unit",
      dataIndex: "unit",
      key: "unit",
    },
    {
      title: "Unit Price",
      dataIndex: "unitPrice",
      key: "unitPrice",
      render: (text) => <div>{text.toLocaleString()}</div>,
    },
    {
      title: "Sub Total",
      dataIndex: "subTotal",
      key: "subTotal",
      render: (text) => <div>{text.toLocaleString()}</div>,
    },
  ];

  useEffect(() => {
    const fetch = async () => {
      await fetchOrderDetailPhase();
    };

    fetch();
  }, []);

  return (
    <div className="order-detail">
      <Tabs
        defaultActiveKey="1"
        items={orderDetail?.map((item, index) => {
          return {
            key: item.id,
            label:
              index === 0
                ? "PURCHASE ORDER  "
                : `Phase ${item.phase === 0 ? " bù" : item.phase} (${dayjs(
                    item.expectedDate
                  ).format("DD/MM/YYYY")})`,
            children: (
              <>
                <Descriptions title="Order Details">
                  <Descriptions.Item label="PO Code">
                    {item?.poCode}
                  </Descriptions.Item>
                  <Descriptions.Item label="Expected Date">
                    {dayjs(item.expectedDate).format("DD/MM/YYYY")}
                  </Descriptions.Item>
                  <Descriptions.Item label="Total Price">
                    {formatVND(item?.totalPrice)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Deliver">
                    {item?.deliver}
                  </Descriptions.Item>
                </Descriptions>
                <Table
                  loading={loading}
                  dataSource={item?.listDetails}
                  columns={columns}
                />
              </>
            ),
          };
        })}
      />
    </div>
  );
};

// eslint-disable-next-line react/prop-types
export const OrderDetailByPhase = ({ POPhase }) => {
  console.log(POPhase);
  const columns = [
    {
      title: "Material Name",
      dataIndex: "materialName",
      key: "materialName",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Unit",
      dataIndex: "unit",
      key: "unit",
    },
    {
      title: "Unit Price",
      dataIndex: "unitPrice",
      key: "unitPrice",
      render: (text) => <div>{text.toLocaleString()}</div>,
    },
    {
      title: "Sub Total",
      dataIndex: "subTotal",
      key: "subTotal",
      render: (text) => <div>{text.toLocaleString()}</div>,
    },
  ];

  return (
    <div className="order-detail">
      <Descriptions title="Order Details">
        <Descriptions.Item label="PO Code">{POPhase?.poCode}</Descriptions.Item>
        <Descriptions.Item label="Expected Date">
          {dayjs(POPhase?.expectedDate).format("DD/MM/YYYY")}
        </Descriptions.Item>
        <Descriptions.Item label="Total Price">
          {formatVND(POPhase?.totalPrice)}
        </Descriptions.Item>
        <Descriptions.Item label="Deliver">
          {POPhase?.deliver}
        </Descriptions.Item>
      </Descriptions>
      <Table dataSource={POPhase?.listDetails} columns={columns} />
    </div>
  );
};
