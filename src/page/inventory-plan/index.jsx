import { useEffect, useState } from "react";
import api from "../../config/axios";
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Space,
  Table,
  Tag,
} from "antd";
import { useForm } from "antd/es/form/Form";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
function InventoryPlan() {
  const [form] = useForm();
  const [formReport] = useForm();
  const [currentPlan, setCurrentPlan] = useState(-2);
  const [currentPlanReport, setCurrentPlanReport] = useState();
  const [inventoryPlan, setInventoryPlan] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const { RangePicker } = DatePicker;
  const [reportDetail, setReportDetail] = useState();

  const fetchReport = async () => {
    const response = await api.get(`/inventory-report/${currentPlanReport}`);
    console.log(response.data.data);
    setReportDetail(response.data.data);
    fetchInventoryPlan();
    toast.success("Successfully created inventory report");
  };

  useEffect(() => {
    if (currentPlanReport) {
      fetchReport();
    }
  }, [currentPlanReport]);

  const fetchInventoryPlan = async () => {
    setLoading(true);
    const response = await api.get(`/inventory-plan`);
    console.log(response.data.data);
    setInventoryPlan(response.data.data.pagingData);
    setPagination({
      ...pagination,
      total: response.data.data.totalCount,
      current: response.data.data.pageIndex,
      pageSize: response.data.data.pageSize,
    });
    setLoading(false);
  };

  const onFinishReport = async (values) => {
    console.log(values);
    const response = await api.post(
      `/inventory-report/${currentPlanReport}`,
      values.materials
    );
    formReport.resetFields();
    setCurrentPlanReport(null);
    console.log(response);
  };

  const onFinish = async (values) => {
    values = {
      ...values,
      startDate: values.Date[0],
      endDate: values.Date[1],
    };

    await api.post("/inventory-plan", values);
    fetchInventoryPlan();
    form.resetFields();
    toast.success("Successfully created inventory plan");
    setCurrentPlan(-2);
  };

  useEffect(() => {
    fetchInventoryPlan();
  }, []);

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = status === "Unfinished" ? "volcano" : "green";
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
    },
    {
      title: "End Date",
      dataIndex: "endDate",
      key: "endDate",
    },
    {
      title: "Date Created",
      dataIndex: "dateCreate",
      key: "dateCreate",
    },
    {
      title: "Date Updated",
      dataIndex: "dateUpdate",
      key: "dateUpdate",
    },
    {
      title: "Is Deleted",
      dataIndex: "isDeleted",
      key: "isDeleted",
      render: (isDeleted) => (isDeleted ? "Yes" : "No"),
    },
    {
      title: "Action",
      dataIndex: "id",
      key: "id",
      render: (value, record) => (
        <>
          {record.uri ? (
            <Button
              onClick={() => {
                window.open(record.uri, "_blank");
              }}
            >
              Download
            </Button>
          ) : (
            <Button type="primary" onClick={() => setCurrentPlanReport(value)}>
              Create report
            </Button>
          )}
        </>
      ),
    },
  ];

  return (
    <div>
      <Button
        onClick={() => {
          setCurrentPlan(-1);
        }}
      >
        Add new plan
      </Button>
      <Table
        columns={columns}
        dataSource={inventoryPlan}
        pagination={pagination}
        loading={loading}
      />

      <Modal
        open={currentPlan !== -2}
        onCancel={() => {
          setCurrentPlan(-2);
        }}
        onOk={() => form.submit()}
      >
        <Form
          onFinish={onFinish}
          form={form}
          labelCol={{
            span: 24,
          }}
        >
          <Form.Item name="name" label="Name">
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="Date" label="Start Date">
            <RangePicker showTime />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Create report"
        open={currentPlanReport}
        onOk={() => formReport.submit()}
        onCancel={() => {
          setCurrentPlanReport(null);
          formReport.resetFields();
        }}
      >
        <Form
          form={formReport}
          name="dynamic_form_nest_item"
          onFinish={onFinishReport}
          autoComplete="off"
          labelCol={{
            span: 24,
          }}
        >
          <Form.List name="materials">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, fieldKey, ...restField }) => (
                  <Row key={name} gutter={12}>
                    <Col span={12}>
                      <Form.Item
                        {...restField}
                        name={[name, "materialId"]}
                        fieldKey={[fieldKey, "materialId"]}
                        label="Material ID"
                        rules={[
                          { required: true, message: "Missing Material ID" },
                        ]}
                      >
                        <Input placeholder="Material ID" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        {...restField}
                        name={[name, "materialName"]}
                        fieldKey={[fieldKey, "materialName"]}
                        label="Material Name"
                        rules={[
                          { required: true, message: "Missing Material Name" },
                        ]}
                      >
                        <Input placeholder="Material Name" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        {...restField}
                        name={[name, "unit"]}
                        fieldKey={[fieldKey, "unit"]}
                        label="Unit"
                        rules={[{ required: true, message: "Missing Unit" }]}
                      >
                        <Input placeholder="Unit" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        {...restField}
                        name={[name, "unitPrice"]}
                        fieldKey={[fieldKey, "unitPrice"]}
                        label="Unit Price"
                        rules={[
                          { required: true, message: "Missing Unit Price" },
                        ]}
                      >
                        <InputNumber
                          style={{
                            width: "100%",
                          }}
                          placeholder="Unit Price"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        {...restField}
                        name={[name, "totalIncomingQuantity"]}
                        fieldKey={[fieldKey, "totalIncomingQuantity"]}
                        label="Total Incoming Quantity"
                        rules={[
                          {
                            required: true,
                            message: "Missing Total Incoming Quantity",
                          },
                        ]}
                      >
                        <InputNumber
                          style={{
                            width: "100%",
                          }}
                          placeholder="Total Incoming Quantity"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        {...restField}
                        name={[name, "subTotalIncoming"]}
                        fieldKey={[fieldKey, "subTotalIncoming"]}
                        label="Sub Total Incoming"
                        rules={[
                          {
                            required: true,
                            message: "Missing Sub Total Incoming",
                          },
                        ]}
                      >
                        <InputNumber
                          style={{
                            width: "100%",
                          }}
                          placeholder="Sub Total Incoming"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        {...restField}
                        name={[name, "totalOutgoingQuantity"]}
                        fieldKey={[fieldKey, "totalOutgoingQuantity"]}
                        label="Total Outgoing Quantity"
                        rules={[
                          {
                            required: true,
                            message: "Missing Total Outgoing Quantity",
                          },
                        ]}
                      >
                        <InputNumber
                          style={{
                            width: "100%",
                          }}
                          placeholder="Total Outgoing Quantity"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        {...restField}
                        name={[name, "subTotalOutgoing"]}
                        fieldKey={[fieldKey, "subTotalOutgoing"]}
                        label="Sub Total Outgoing"
                        rules={[
                          {
                            required: true,
                            message: "Missing Sub Total Outgoing",
                          },
                        ]}
                      >
                        <InputNumber
                          style={{
                            width: "100%",
                          }}
                          placeholder="Sub Total Outgoing"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        {...restField}
                        name={[name, "totalInventoryQuantity"]}
                        fieldKey={[fieldKey, "totalInventoryQuantity"]}
                        label="Total Inventory Quantity"
                        rules={[
                          {
                            required: true,
                            message: "Missing Total Inventory Quantity",
                          },
                        ]}
                      >
                        <InputNumber
                          style={{
                            width: "100%",
                          }}
                          placeholder="Total Inventory Quantity"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        {...restField}
                        name={[name, "subTotalInventory"]}
                        fieldKey={[fieldKey, "subTotalInventory"]}
                        label="Sub Total Inventory"
                        rules={[
                          {
                            required: true,
                            message: "Missing Sub Total Inventory",
                          },
                        ]}
                      >
                        <InputNumber
                          style={{
                            width: "100%",
                          }}
                          placeholder="Sub Total Inventory"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        {...restField}
                        name={[name, "totalActualQuantity"]}
                        fieldKey={[fieldKey, "totalActualQuantity"]}
                        label="Total Actual Quantity"
                        rules={[
                          {
                            required: true,
                            message: "Missing Total Actual Quantity",
                          },
                        ]}
                      >
                        <InputNumber
                          style={{
                            width: "100%",
                          }}
                          placeholder="Total Actual Quantity"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        {...restField}
                        name={[name, "subTotalActual"]}
                        fieldKey={[fieldKey, "subTotalActual"]}
                        label="Sub Total Actual"
                        rules={[
                          {
                            required: true,
                            message: "Missing Sub Total Actual",
                          },
                        ]}
                      >
                        <InputNumber
                          style={{
                            width: "100%",
                          }}
                          placeholder="Sub Total Actual"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Button
                        icon={<MinusCircleOutlined />}
                        onClick={() => remove(name)}
                        danger
                        type="primary"
                        style={{
                          width: "100%",
                          marginBottom: 20,
                        }}
                      >
                        Remove
                      </Button>
                    </Col>
                  </Row>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add Material
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
}

export default InventoryPlan;
