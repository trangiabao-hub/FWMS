import {
  Avatar,
  Button,
  Col,
  DatePicker,
  Form,
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
  const [showPhieu, setShowPhieu] = useState(false);
  const [products, setProducts] = useState([]);
  const [goodDetail, setGoodDetail] = useState(null);
  const [paginationUser, setPaginationUser] = useState({});
  const [selectedPO, setSelectedPO] = useState();
  const [orderDetail, setOrderDetail] = useState([]);

  const onFinishPhieu = async (values) => {
    try {
      console.log("Received values:", values);
      const response = await api.post(
        `/good-receipt-note/${requestDetail.id}/request`,
        values
      );
      const good = response.data.goodReceipNoteDetails;
      console.log(good);
      formPhieu.resetFields();
      setShowPhieu(false);
      setRequestDetail({ ...requestDetail, status: "Done", good });
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
          const good = staffResponse.data.data[0].listGoodReceiptNote;
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

  const fetchUser = async (page = 0) => {
    const response = await api.get(`/user?PageIndex=${page}`);
    const user = await Promise.all(
      response.data.data.pagingData.map(async (item) => {
        const role = (await api.get(`/role/${item.roleId}`)).data.data;
        return {
          ...item,
          role: role.name,
        };
      })
    );

    setPaginationUser({
      ...pagination,
      total: response.data.data.totalCount,
      current: response.data.data.pageIndex,
      pageSize: response.data.data.pageSize,
    });
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

  const fetchOrderDetail = async () => {
    setOrderDetail([]);
    const response = await api.get(
      `/purchase-order-phase/${selectedPO}/purchase-order-phase-details`
    );
    console.log(response.data.data);
    setOrderDetail(response.data.data);
  };

  useEffect(() => {
    if (selectedPO) {
      fetchOrderDetail();
    }
  }, [selectedPO]);

  const onFinish = async (values) => {
    const poCode = orders.filter(
      (item) => item.id === values.relatedInformation
    )[0].poCode;
    console.log(values);
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
  };

  const fetchPurchaseOrder = async () => {
    console.log(requestDetail);
    const response = await api.get(
      `request/${requestDetail.id}/relate-infomation/${requestDetail.relatedInformation}`
    );
    console.log(response.data.data);
    setPurchaseOrder(response.data.data[0]);
  };

  const fetchPurchaseOrderDetail = async () => {
    console.log(requestDetail);
    const response = await api.get(
      `/purchase-order/${purchaseOrder.id}/purchase-order-details`
    );

    setProducts(response.data.data);
  };

  useEffect(() => {
    if (purchaseOrder) {
      fetchPurchaseOrderDetail();
    } else {
      setProducts([]);
    }
  }, [purchaseOrder]);

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

  const handleApprove = async (id) => {
    const response = await api.put(`/request/${id}/approve`, {
      isApproved: true,
    });

    console.log(response);
    fetchRequest(pagination.current);

    toast.success("Successfully approve request");
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
              console.log(record.uri);
              window.open(record.uri, "_blank");
            }}
          >
            Download
          </Button>
          <Button
            onClick={() => {
              console.log(value);
              setGoodDetail(value);
            }}
          >
            Show Detail
          </Button>
        </>
      ),
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

            <Button
              onClick={() => {
                console.log(record);
                setRequestDetail(record);
              }}
            >
              Show Detail
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={() => {
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
                      label: `Phase ${item.phase} (${dayjs(
                        item.expectedDate
                      ).format("DD/MM/YYYY")})`,
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
          columns={userColumns}
          dataSource={users}
          pagination={paginationUser}
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
          requestDetail?.status !== "Done" && (
            <Button
              type="primary"
              key="Download"
              onClick={() => {
                setShowPhieu(true);
                console.log(purchaseOrder);
                console.log(products[0].listDetails);
                formPhieu.setFieldsValue(purchaseOrder);
                formPhieu.setFieldValue(
                  "goodReceipNoteDetails",
                  products[0].listDetails
                );
              }}
            >
              Create phiếu
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

        <Table columns={goodColums} dataSource={requestDetail?.good} />
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
    </div>
  );
};
