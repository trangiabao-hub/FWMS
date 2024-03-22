import { Avatar, Col, Row } from "antd";
import "./index.scss";
const Profile = () => {
  return (
    <div className="profile">
      <Row>
        <Col span={12}>
          <h1>Thông tin cơ bản</h1>
          <Row justify={"center"}>
            <Avatar
              size={300}
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=3560&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            />
          </Row>

          <div className="detail">
            <div className="row">
              <label htmlFor="">Họ và tên</label>
              <span>Trương Trong Kha</span>
            </div>
            <div className="row">
              <label htmlFor="">Giới tính</label>
              <span>Nam</span>
            </div>
            <div className="row">
              <label htmlFor="">Ngày sinh</label>
              <span>12/3/2000</span>
            </div>
            <div className="row">
              <label htmlFor="">SĐT</label>
              <span>0773760158</span>
            </div>
            <div className="row">
              <label htmlFor="">Địa chỉ</label>
              <span>23/12 Nguyễn Thị Định, P.5, Q.9</span>
            </div>
          </div>
        </Col>
        <Col span={12}>
          <h1>Thông tin chi tiết</h1>

          <div className="detail">
            <div className="row">
              <label htmlFor="">Mã ID</label>
              <span>SE11445666</span>
            </div>
            <div className="row">
              <label htmlFor="">Chức Vụ</label>
              <span>Staff</span>
            </div>
            <div className="row">
              <label htmlFor="">CCCD</label>
              <span>012345678</span>
            </div>
            <div className="row">
              <label htmlFor="">Email</label>
              <span>Demo@gmail.com</span>
            </div>
          </div>

          <h1 className="mt">Thông tin tài khoản</h1>
          <div className="detail">
            <div className="row">
              <label htmlFor="">Tài khoản</label>
              <span>SE11445666</span>
            </div>
            <div className="row">
              <label htmlFor="">Mật khẩu</label>
              <span>Staff</span>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;
