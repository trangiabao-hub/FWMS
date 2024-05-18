import {
  Avatar,
  Button,
  Col,
  DatePicker,
  Form,
  Image,
  Input,
  InputNumber,
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
import moment from "moment";
import { formatVND } from "../../../utils/currency";
import dayjs from "dayjs";
import { OrderDetail, OrderDetailByPhase } from "../order";
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
  const [requestDetail, setRequestDetail] = useState(null);
  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [formPhieu] = Form.useForm();
  const [formQualityCheck] = Form.useForm();
  const [showPhieu, setShowPhieu] = useState(false);
  const [goodDetail, setGoodDetail] = useState(null);
  const [selectedPO, setSelectedPO] = useState();
  const [orderDetail, setOrderDetail] = useState([]);
  const [showPO, setShowPO] = useState(null);
  const [openCheckQuality, setOpenCheckQuality] = useState(false);

  const [currentCreateQR, setCurrentCreateQR] = useState(null);
  const [loadUser, setLoadUser] = useState(true);

  const [formQR] = useForm();

  const onFinishQR = async (values) => {
    console.log(currentCreateQR);
    console.log(values);

    try {
      const quantityId = requestDetail.listQualityControlReportData[0].id;
      const response = await api.post(
        `/QualityControlReport/${quantityId}/material/${currentCreateQR}/qr-code`,
        values
      );

      formQR.resetFields();
      setCurrentCreateQR(null);
      setRequestDetail(null);
      fetchRequest();
      console.log(response);
      toast.success("Successfully created QR");
    } catch (err) {
      toast.error(err.response.data.message);
    }
  };

  const onFinishPhieu = async (values) => {
    try {
      console.log("Received values:", values);
      const response = await api.post(
        `/good-receipt-note/${requestDetail.id}/request`,
        { ...values, phase: requestDetail.phase }
      );
      const good = response.data.goodReceipNoteDetails;
      console.log(good);
      formPhieu.resetFields();
      setShowPhieu(false);
      console.log({ ...requestDetail, status: "Done", good });
      setRequestDetail({ ...requestDetail, status: "Done", good });
      fetchOrderDetail();
      setRequestDetail(null);
      fetchRequest();
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };
  const fetchWarehouse = async (page = 0) => {
    const response = await api.get(`/warehouse?PageIndex=${page}`);
    setWarehouse(response.data.data.pagingData);
  };

  const fetchRequest = async (page = 0) => {
    try {
      const response = await api.get(
        `/request?PageIndex=${page}&OrderBy=DateCreate%20desc`
      );

      // Fetching request details for each item
      const requestsWithDetails = await Promise.all(
        response.data.data.pagingData.map(async (item) => {
          const staffResponse = await api.get(
            `/request/${item.id}/request-detail`
          );
          const poResponse = await api.get(
            `request/${item.id}/relate-infomation/${item.relatedInformation}`
          );
          const good = staffResponse.data.data[0].listGoodReceiptNote;
          const listQualityControlReportData =
            staffResponse.data.data[0].listQualityControlReportData;

          const listQualityControlReportDataFull =
            staffResponse.data.data[0].listQualityControlReportData[0];
          console.log(good);
          const staff = staffResponse.data.data[0].listMembers;
          const warehouseResponse = await api.get(
            `/warehouse/${item.warehouseId}`
          );
          const warehouse = warehouseResponse.data.data;
          return {
            ...item,
            staff, // assuming you want to add staff data to each item
            warehouse,
            good,
            listQualityControlReportData,
            listQualityControlReportDataFull,
            po: poResponse.data.data[0],
          };
        })
      );

      // Updating state with fetched data
      setRequest(requestsWithDetails);
      console.log(requestsWithDetails);

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

  const fetchUser = async (url) => {
    setLoadUser(true);
    const response = await api.get(url ? url : `/user/warehouse-staff`);
    setUsers(response.data.data);
    setLoadUser(false);
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

  const fetchOrderDetail = async (id) => {
    setOrderDetail([]);
    const response = await api.get(
      `/purchase-order-phase/${
        id ? id : selectedPO
      }/purchase-order-phase-details`
    );
    if (id) {
      return response.data.data;
    }
    setOrderDetail(response.data.data);
    console.log(response.data.data);
  };

  useEffect(() => {
    console.log(selectedPO);
    if (selectedPO) {
      fetchOrderDetail();
    }
  }, [selectedPO]);

  const onFinish = async (values) => {
    const poCode = orders.filter(
      (item) => item.id === values.relatedInformation
    )[0].poCode;
    const formApi = new FormData();
    formApi.append("Title", values.title);
    formApi.append("Description", values.description);
    formApi.append("RelatedInformation", poCode);
    formApi.append("WarehouseId", values.warehouseId);
    formApi.append("Phase", values.phase);
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
    selectedRequest({ ...selectedRequest, status: "Done" });
    setRequestDetail(null);
    fetchRequest();
  };

  const fetchPurchaseOrder = async () => {
    const response = await api.get(
      `request/${requestDetail.id}/relate-infomation/${requestDetail.relatedInformation}`
    );
    setPurchaseOrder(response.data.data[0]);
  };

  // const fetchPurchaseOrderDetail = async () => {
  //   const response = await api.get(
  //     `/purchase-order/${purchaseOrder.id}/purchase-order-details`
  //   );

  //   setProducts(response.data.data);
  // };

  // useEffect(() => {
  //   if (purchaseOrder) {
  //     fetchPurchaseOrderDetail();
  //   } else {
  //     setProducts([]);
  //   }
  // }, [purchaseOrder]);

  useEffect(() => {
    if (requestDetail) {
      fetchPurchaseOrder();
    } else {
      setPurchaseOrder(null);
    }
  }, [requestDetail]);

  useEffect(() => {
    fetchWarehouse();
    fetchOrder();
    fetchRequest(pagination.current);
    fetchUser();
  }, []);

  const handleApprove = async (id, isApproved) => {
    const response = await api.put(`/request/${id}/approve`, {
      isApproved,
    });

    fetchRequest(pagination.current);

    toast.success(`Successfully ${isApproved ? "approve" : "reject"} request`);
  };

  const userColumns = [
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
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Action",
      dataIndex: "id",
      key: "id",
      render: (value) => (
        <Button
          onClick={async () => {
            await api.post(`request/${selectedRequest}/user?userId=${value}`);
            setAssignStaff(false);
            setSelectedStaff(null);
            setSelectedRequest(null);
            fetchRequest(pagination.current);
          }}
        >
          Assign
        </Button>
      ),
    },
  ];

  const goodColums = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
    },
    {
      title: "PO Code",
      dataIndex: "poCode",
      key: "poCode",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      render: (total) => `${formatVND(total)}`,
    },
    {
      title: "Action",
      dataIndex: "goodReceiptNoteDetails",
      key: "goodReceiptNoteDetails",
      render: (value, record) => (
        <>
          <Button
            style={{
              marginRight: 10,
            }}
            onClick={() => {
              window.open(record.uri, "_blank");
            }}
          >
            Download
          </Button>
          <Button
            onClick={() => {
              setGoodDetail(value);
            }}
          >
            Show Detail
          </Button>
        </>
      ),
    },
  ];

  const materialColumns = [
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
      title: "Action",
      dataIndex: "unit",
      key: "unit",
    },
    {
      title: "Action",
      dataIndex: "materialId",
      key: "materialId",
      render: (value, record) => {
        return record?.qrCode ? (
          <Image src={record.qrCode.image} width={100} />
        ) : (
          <Button
            onClick={() => {
              setCurrentCreateQR(value);
            }}
          >
            Create QR
          </Button>
        );
      },
    },
  ];

  const goodDetailColumns = [
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
      render: (value) => <span>{value?.toLocaleString()} đ</span>,
    },
    {
      title: "Sub Total",
      dataIndex: "subTotal",
      key: "subTotal",
      render: (value) => <span>{value?.toLocaleString()} đ</span>,
    },
  ];

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      filters: [
        {
          text: "Quality Control Request",
          value: "QualityControlRequest",
        },
        {
          text: "Order Confirmation Request",
          value: "OrderConfirmationRequest",
        },
        {
          text: "Outbound Shipment Request",
          value: "OutboundShipmentRequest",
        },
        {
          text: "Inbound Shipment Request",
          value: "InboundShipmentRequest",
        },
      ],
      onFilter: (value, record) => record.title === value,
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
        return user.role === "Manage warehouse department" ||
          user.role === "Admin" ? (
          <>
            {record.status === "Pending" && (
              <>
                <Button
                  type="primary"
                  onClick={() => handleApprove(value, true)}
                >
                  Approve
                </Button>
                <Button
                  type="primary"
                  danger
                  onClick={() => handleApprove(value, false)}
                >
                  Reject
                </Button>
              </>
            )}
            {record.status === "InProgress" && (
              <Button
                type="primary"
                onClick={() => {
                  setSelectedRequest(record.id);
                  if (record.title === "QualityControlRequest") {
                    fetchUser(
                      "/role/9fd3d274-1a09-42c8-9f52-e435406d071d/users"
                    );
                  } else {
                    fetchUser();
                  }
                  setAssignStaff(true);
                }}
              >
                Assign Staff
              </Button>
            )}

            <Button
              onClick={() => {
                setRequestDetail(record);
                console.log(record);
              }}
            >
              Show Detail
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={() => {
                console.log(request);
                console.log(record);
                setRequestDetail(record);
              }}
            >
              Show Detail
            </Button>
          </>
        );
      },
    },
  ];

  const handleTableChange = (pagination) => {
    fetchRequest(pagination.current);
  };

  const handleUserChange = (pagination) => {
    fetchUser(pagination.current);
  };

  const onFinishQualityCheck = async (values) => {
    console.log(values);
    console.log(requestDetail);
    try {
      const response = await api.post(
        `/QualityControlReport/${requestDetail.id}/request`,
        values
      );
      formQualityCheck.resetFields();
      toast.success("Successfully create new quality check");
      console.log(response);
    } catch (err) {
      console.log(err);
      toast.error(err.response.data.message);
    }
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
            <Select
              options={[
                {
                  value: "OrderConfirmationRequest",
                  label: "Order Confirmation Request",
                },
                {
                  value: "InboundShipmentRequest",
                  label: "Inbound Shipment Request",
                },
                {
                  value: "OutboundShipmentRequest",
                  label: "Outbound Shipment Request",
                },
                {
                  value: "QualityControlRequest",
                  label: "Quality Control Request",
                },
              ]}
            />
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
                  onChange={(value) => {
                    setSelectedPO(value);
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Phase"
                name="phase"
                rules={[
                  {
                    required: true,
                    message: "Please input the phase!",
                  },
                ]}
              >
                <Select
                  disabled={orderDetail.length === 0}
                  options={orderDetail.map((item) => {
                    console.log(item);
                    return {
                      value: item.phase,
                      label: `Phase ${
                        item.phase === 0 ? "bù" : item.phase
                      } (${dayjs(item.expectedDate).format("DD/MM/YYYY")})`,
                    };
                  })}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
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
                      label: `${item.type} Warehouse`,
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
        width={1000}
        footer={[]}
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
        <Table
          loading={loadUser}
          columns={userColumns}
          dataSource={users}
          onChange={handleUserChange}
        />
        {/* <Row gutter={[12, 12]}>
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
                    onError={(e) => {
                      e.target.src =
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ26FR7gGjhpxw9N7wfgdU2JT92Z3G1jvFI5A&usqp=CAU";
                    }}
                    src={
                      user.avatar
                        ? user.avatar
                        : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ26FR7gGjhpxw9N7wfgdU2JT92Z3G1jvFI5A&usqp=CAU"
                    }
                    alt=""
                  />
                  <span>{user.name}</span>
                </div>
              </Col>
            );
          })}
        </Row> */}
      </Modal>

      <Modal
        title="Request Detail"
        open={requestDetail}
        onCancel={() => setRequestDetail(null)}
        className="request-detail"
        width={1000}
        footer={[
          <Button
            key="Cancel"
            onClick={() => {
              setRequestDetail(null);
            }}
          >
            Cancel
          </Button>,
          requestDetail?.attachment && (
            <Button
              type="primary"
              key="Download"
              onClick={() => setRequestDetail(null)}
            >
              Download
            </Button>
          ),
          requestDetail?.status !== "Done" &&
            requestDetail?.title === "OrderConfirmationRequest" && (
              <Button
                type="primary"
                key="nhapkho"
                onClick={() => {
                  setShowPhieu(true);
                  console.log(purchaseOrder);
                  formPhieu.setFieldsValue(purchaseOrder);
                  formPhieu.setFieldValue(
                    "goodReceipNoteDetails",
                    purchaseOrder.listDetails
                  );
                }}
              >
                Create phiếu
              </Button>
            ),
          requestDetail?.status !== "Done" &&
            requestDetail?.title === "QualityControlRequest" && (
              <Button
                type="primary"
                key="kiemdinh"
                onClick={() => {
                  setOpenCheckQuality(true);
                  formQualityCheck.setFieldsValue(purchaseOrder);
                  formQualityCheck.setFieldValue(
                    "qualityControlReportDetails",
                    purchaseOrder.listDetails
                  );
                }}
              >
                Create phiếu kiểm định
              </Button>
            ),
        ]}
      >
        <p>
          <span className="tag">Warehouse Name</span>{" "}
          <span className="content">{requestDetail?.warehouse.name}</span>
        </p>
        <p>
          <span className="tag">Request name:</span>{" "}
          <span className="content">{requestDetail?.title}</span>
        </p>
        <p>
          <span className="tag">Related Information:</span>{" "}
          <span className="content">{requestDetail?.relatedInformation}</span>
        </p>
        <p>
          <span className="tag">Purchase Order:</span>{" "}
          <span className="content">
            <Button
              type="primary"
              onClick={() => {
                setShowPO(purchaseOrder);
              }}
            >
              Show PO
            </Button>
          </span>
        </p>
        <p>
          <span className="tag">Description:</span>{" "}
          <span className="content">{requestDetail?.description}</span>
        </p>
        <p>
          <span className="tag">Status:</span>{" "}
          <span className="content">{requestDetail?.status}</span>
        </p>
        <p>
          <span className="tag">Date Created:</span>{" "}
          <span className="content">
            {new Date(requestDetail?.dateCreate).toLocaleString()}
          </span>
        </p>
        <p>
          <span className="tag">Date Updated:</span>{" "}
          <span className="content">
            {new Date(requestDetail?.dateUpdate).toLocaleString()}
          </span>
        </p>
        {requestDetail?.staff.map((staffMember, index) => (
          <div key={index} className="staff">
            <p>
              <span className="tag">Staff name:</span>
              <span className="content">{staffMember.staffName}</span>
            </p>
            <p>
              <span className="tag">Role</span>
              <span className="content">{staffMember.roleRelate}</span>
            </p>
          </div>
        ))}
        {requestDetail?.attachment && (
          <div>
            <a
              href={requestDetail?.attachment}
              target="_blank"
              rel="noopener noreferrer"
            >
              Attachment
            </a>
          </div>
        )}

        {requestDetail?.good?.length > 0 && (
          <Table columns={goodColums} dataSource={requestDetail?.good} />
        )}

        {requestDetail?.listQualityControlReportData[0] && (
          // <Table
          //   columns={materialColumns}
          //   dataSource={
          //     requestDetail?.listQualityControlReportData[0]
          //       ?.qualityControlReportDetails
          //   }
          // />
          <QualityTable
            data={
              requestDetail?.listQualityControlReportData[0]
                ?.qualityControlReportDetails
            }
            detail={requestDetail}
            openModal={setCurrentCreateQR}
          />
        )}
      </Modal>

      <Modal
        title="Create phieu"
        open={showPhieu}
        onCancel={() => {
          setShowPhieu(null);
          formPhieu.resetFields();
        }}
        width={1300}
        okText="Create"
        onOk={() => formPhieu.submit()}
      >
        <Form
          form={formPhieu}
          layout="vertical"
          onFinish={onFinishPhieu}
          initialValues={{
            date: moment(),
          }}
        >
          {/* <Form.Item
            label="URI"
            name="uri"
            rules={[{ required: true, message: "Please input URI!" }]}
          >
            <Input />
          </Form.Item> */}
          <Form.Item
            label="NO"
            name="no"
            rules={[{ required: true, message: "Please input NO!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please input name!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="PO Code"
            name="poCode"
            rules={[{ required: true, message: "Please input PO code!" }]}
          >
            <Input />
          </Form.Item>
          {/* <Form.Item
            label="Date"
            name="date"
            rules={[{ required: true, message: "Please select date!" }]}
          >
            <DatePicker />
          </Form.Item> */}
          <Form.List name="goodReceipNoteDetails">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, fieldKey, ...restField }, index) => (
                  <div key={key}>
                    <Row gutter={12} justify="space-between" align="middle">
                      <Col span={4}>
                        <Form.Item
                          {...restField}
                          label="Material Name"
                          name={[name, "materialName"]}
                          fieldKey={[fieldKey, "materialName"]}
                        >
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col span={3}>
                        <Form.Item
                          {...restField}
                          label="Quantity"
                          name={[name, "quantity"]}
                          fieldKey={[fieldKey, "quantity"]}
                        >
                          <InputNumber style={{ width: "100%" }} />
                        </Form.Item>
                      </Col>
                      <Col span={3}>
                        <Form.Item
                          {...restField}
                          label="Import Quantity"
                          name={[name, "importQuantity"]}
                          fieldKey={[fieldKey, "importQuantity"]}
                          rules={[
                            {
                              required: true,
                              message: "Please input import quantity!",
                            },
                          ]}
                        >
                          <InputNumber style={{ width: "100%" }} />
                        </Form.Item>
                      </Col>
                      <Col span={3}>
                        <Form.Item
                          {...restField}
                          label="Unit"
                          name={[name, "unit"]}
                          fieldKey={[fieldKey, "unit"]}
                        >
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col span={3}>
                        <Form.Item
                          {...restField}
                          label="Unit Price"
                          name={[name, "unitPrice"]}
                          fieldKey={[fieldKey, "unitPrice"]}
                        >
                          <InputNumber style={{ width: "100%" }} />
                        </Form.Item>
                      </Col>
                      <Col span={3}>
                        <Form.Item
                          {...restField}
                          label="SubTotal"
                          name={[name, "subTotal"]}
                          fieldKey={[fieldKey, "subTotal"]}
                        >
                          <InputNumber style={{ width: "100%" }} />
                        </Form.Item>
                      </Col>
                      <Col span={3}>
                        <Button
                          type="primary"
                          danger
                          onClick={() => remove(name)}
                          style={{ marginLeft: 8 }}
                        >
                          Remove
                        </Button>
                      </Col>
                    </Row>
                  </div>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block>
                    Add Detail
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>

      <Modal open={goodDetail} onCancel={() => setGoodDetail(null)}>
        <Table
          columns={goodDetailColumns}
          dataSource={goodDetail}
          pagination={{
            pageSize: 5,
          }}
        />
      </Modal>

      <Modal
        width={800}
        title="Purchase Order"
        open={showPO}
        onCancel={() => setShowPO(null)}
      >
        <OrderDetailByPhase POPhase={showPO} />
      </Modal>

      <Modal
        open={openCheckQuality}
        width={1000}
        onCancel={() => {
          setOpenCheckQuality(false);
        }}
        onOk={() => formQualityCheck.submit()}
      >
        <Form
          labelCol={{
            span: 24,
          }}
          form={formQualityCheck}
          onFinish={onFinishQualityCheck}
          initialValues={{
            phase: 0,
            conclude: 0,
          }}
        >
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="uri" label="URI">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="poCode" label="PO Code">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="poFax" label="PO Fax">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="supplier" label="Supplier">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="licensePlate" label="License Plate">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="conclude" label="Conclude">
                <Select
                  options={[
                    { value: 0, label: "Obtain" },
                    { value: 1, label: "NotAchieved" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="inspectionDate" label="Inspection Date">
                <DatePicker
                  showTime
                  style={{
                    width: "100%",
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="receiptDate" label="Receipt Date">
                <DatePicker
                  showTime
                  style={{
                    width: "100%",
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="phase" label="Phase">
                <Input type="number" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="comments" label="Comments">
            <Input.TextArea />
          </Form.Item>
          <Form.List name="qualityControlReportDetails">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, fieldKey, ...restField }) => (
                  <Form.Item
                    {...restField}
                    key={key}
                    label={`Material ${name + 1}`}
                  >
                    <Input.Group compact>
                      <Form.Item
                        name={[name, "materialName"]}
                        noStyle
                        rules={[
                          {
                            required: true,
                            message: "Material name is required",
                          },
                        ]}
                      >
                        <Input
                          style={{ width: "40%" }}
                          placeholder="Material Name"
                        />
                      </Form.Item>
                      <Form.Item
                        name={[name, "quantity"]}
                        noStyle
                        rules={[
                          { required: true, message: "Quantity is required" },
                        ]}
                      >
                        <Input
                          style={{ width: "20%" }}
                          type="number"
                          placeholder="Quantity"
                        />
                      </Form.Item>
                      <Form.Item
                        name={[name, "unit"]}
                        noStyle
                        rules={[
                          { required: true, message: "Unit is required" },
                        ]}
                      >
                        <Input style={{ width: "30%" }} placeholder="Unit" />
                      </Form.Item>
                      <Button danger type="link" onClick={() => remove(name)}>
                        Remove
                      </Button>
                    </Input.Group>
                  </Form.Item>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    style={{ width: "100%" }}
                  >
                    Add Material
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={currentCreateQR}
        onOk={() => {
          formQR.submit();
        }}
        onCancel={() => {
          formQR.resetFields();
          setCurrentCreateQR(null);
        }}
      >
        <Form
          labelCol={{
            span: 24,
          }}
          form={formQR}
          onFinish={onFinishQR}
          initialValues={{ isQualityChecked: 0 }}
        >
          <Row gutter={[12, 12]}>
            <Col span={8}>
              <Form.Item name="length" label="Length">
                <InputNumber
                  style={{
                    width: "100%",
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="lengthUnit" label="Length Unit">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="width" label="Width">
                <InputNumber
                  style={{
                    width: "100%",
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="widthUnit" label="Width Unit">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="grossWeight" label="Gross Weight">
                <InputNumber
                  style={{
                    width: "100%",
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="grossWeightUnit" label="Gross Weight Unit">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="netWeight" label="Net Weight">
                <InputNumber
                  style={{
                    width: "100%",
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="netWeightUnit" label="Net Weight Unit">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="attribute" label="Attribute">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="isQualityChecked" label="Quality Checked">
                <Select>
                  <Select.Option value={0}>No</Select.Option>
                  <Select.Option value={1}>Yes</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="color" label="Color">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="image" label="Image URL">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

const QualityTable = ({ data, detail, openModal }) => {
  console.log(detail);
  return (
    <table
      border={1}
      style={{
        width: "fit-content",
        overflow: "auto",
        borderCollapse: "collapse",
      }}
    >
      <tr>
        <th colSpan="3">
          PO: <strong>{detail.relatedInformation}</strong>
        </th>
        <th colSpan="4">
          Supplier:{" "}
          <strong>{detail.listQualityControlReportDataFull.supplier}</strong>
        </th>
        <th colSpan="4">
          Inspection date:
          <strong>
            {dayjs(
              detail.listQualityControlReportDataFull.inspectionDate
            ).format("DD/MM/YYYY")}
          </strong>
        </th>
        <th rowSpan={4} style={{ textAlign: "center" }}>
          Action
        </th>
      </tr>
      <tr>
        <th colSpan="3">
          POFAX:{" "}
          <strong>{detail.listQualityControlReportDataFull.poFax}</strong>
        </th>
        <th colSpan="4">
          Liscence Plate{" "}
          <strong>
            {detail.listQualityControlReportDataFull.licensePlate}
          </strong>
        </th>
        <th colSpan="4">
          Receipt date:{" "}
          <strong>
            {dayjs(detail.listQualityControlReportDataFull.receiptDate).format(
              "DD/MM/YYYY"
            )}
          </strong>
        </th>
      </tr>
      <tr>
        <td rowSpan="2" colSpan="1">
          No
        </td>
        <td rowSpan="2">MaterialName</td>
        <td rowSpan="2">Quantity</td>
        <td rowSpan="2">Unit</td>
        <td rowSpan="2">Number of check</td>
        <td rowSpan="2">Inspection Method</td>
        <td rowSpan="2">Size</td>
        <td rowSpan="2">Quantitative</td>
        <td rowSpan="2">External Inspection</td>
        <td rowSpan="1" colSpan="2">
          Evaluate
        </td>
      </tr>
      <tr>
        <td>Quantity achieved</td>
        <td>Quantity not reached</td>
      </tr>
      {/* eslint-disable-next-line react/prop-types */}
      {data.map((item, index) => {
        return (
          // eslint-disable-next-line react/jsx-key
          <tr>
            <td>{index + 1}</td>
            <td>{item.materialName}</td>
            <td>{item.quantity}</td>
            <td>{item.unit}</td>
            <td>{item.numberOfCheck}</td>
            <td>{item.inspectionMethod}</td>
            <td>{item.size}</td>
            <td>{item.quantitative}</td>
            <td>{item.externalInspection}</td>
            <td>{item.quantityAchieved}</td>
            <td>{item.quantityNotReached}</td>
            <td>
              {item?.qrCode ? (
                <Image src={item?.qrCode.image} width={100} />
              ) : (
                <Button onClick={() => openModal(item.materialId)}>
                  Create QR
                </Button>
              )}
            </td>
          </tr>
        );
      })}
      <tr>
        <td colSpan="2">Conclude: </td>
        <td colSpan="4">Achieved</td>
        <td colSpan="6">Not Reached</td>
      </tr>
      <tr>
        <td colSpan="8" rowSpan="2">
          Note: {detail.description}
        </td>
        <td colSpan="4">Inspectation Staff</td>
      </tr>
      <tr>
        <td colSpan="3" rowSpan="2">
          Empty
        </td>
      </tr>
    </table>
  );
};
