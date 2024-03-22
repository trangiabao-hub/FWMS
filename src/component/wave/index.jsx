import "./index.scss";
export const Wave = ({ children }) => {
  return (
    <div className="wave">
      <img src="/wave.svg" alt="" />
      <div className="content">{children}</div>
      <div className="space"></div>
      <img src="/wave-bottom.svg" alt="" />
    </div>
  );
};
