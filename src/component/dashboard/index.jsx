import { useEffect, useState } from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  PicRightOutlined,
  AlignLeftOutlined,
  PieChartOutlined,
  PullRequestOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Button, theme, Row, Col, Dropdown, Avatar } from "antd";
const { Header, Sider, Content } = Layout;
import "./index.scss";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/features/user";
const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [dashboardItem, setDashboardItem] = useState([]);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = [
    {
      key: "1",
      label: <Link to={"/dashboard/profile"}>Thông tin cá nhân</Link>,
    },
    {
      key: "2",
      label: (
        <span
          onClick={() => {
            dispatch(logout());
            navigate("/login");
          }}
        >
          Đăng xuất
        </span>
      ),
    },
  ];
  const location = useLocation();
  const arr = location.pathname.split("/");
  const uri = arr[arr.length - 1];

  useEffect(() => {
    if (user) {
      const { role } = user;
      if (role === "Admin") {
        setDashboardItem([
          {
            key: "user",
            icon: <UserOutlined />,
            label: <Link to={"user"}>Manage User</Link>,
          },
          {
            key: "category",
            icon: <AlignLeftOutlined />,
            label: <Link to={"category"}>Manage category</Link>,
          },
          {
            key: "material",
            icon: <PieChartOutlined />,
            label: <Link to={"material"}>Manage material</Link>,
          },
        ]);
      } else if (role === "Purchasing staff") {
        setDashboardItem([
          {
            key: "order",
            icon: <PicRightOutlined />,
            label: <Link to={"order"}>Manage Purchase Order</Link>,
          },
        ]);
      } else if (role === "Warehouse staff") {
        setDashboardItem([
          {
            key: "order",
            icon: <PicRightOutlined />,
            label: <Link to={"order"}>Manage Purchase Order</Link>,
          },
          {
            key: "request",
            icon: <PullRequestOutlined />,
            label: <Link to={"request"}>Manage request</Link>,
          },
        ]);
      } else if (role === "Manage warehouse department") {
        setDashboardItem([
          {
            key: "order",
            icon: <PicRightOutlined />,
            label: <Link to={"order"}>Manage Purchase Order</Link>,
          },
          {
            key: "request",
            icon: <PullRequestOutlined />,
            label: <Link to={"request"}>Manage request</Link>,
          },
        ]);
      }
    }
  }, [user]);

  return (
    <Layout
      style={{
        height: "100vh",
      }}
    >
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          backgroundColor: "#E6F2EA",
        }}
      >
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["1"]}
          selectedKeys={[uri]}
          items={dashboardItem}
          style={{
            backgroundColor: "#E6F2EA",
          }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            paddingLeft: 30,
            background: "#359567",
          }}
        >
          <Row justify={"space-between"}>
            <Col>
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  fontSize: "16px",
                  width: 64,
                  height: 64,
                }}
              />
            </Col>
            <Col>
              <Dropdown menu={{ items }} placement="bottomRight">
                <Row align={"middle"} gutter={12}>
                  <Col>
                    <Avatar
                      size={40}
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKJQp8ndvEkIa-u1rMgJxVc7BBsR11uSLHGA&usqp=CAU"
                    />
                  </Col>
                  <Col>
                    <span
                      style={{
                        fontSize: 18,
                      }}
                    >
                      {user.name}
                    </span>
                  </Col>
                </Row>
              </Dropdown>
            </Col>
          </Row>
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            maxHeight: "100%",
            overflow: "auto",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
export default Dashboard;
