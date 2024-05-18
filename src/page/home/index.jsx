import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const Home = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/login");
  }, []);
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
