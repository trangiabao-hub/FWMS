import { useNavigate } from "react-router-dom";

export const Home = () => {
  const navigate = useNavigate();
  return (
    <h1
      onClick={() => {
        navigate("/login");
      }}
    >
      <button>login</button>
    </h1>
  );
};
