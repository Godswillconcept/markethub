import { Link } from "react-router-dom";

function Logo() {
  return (
    <Link to="/" className="block">
      <div className="mb-2 flex justify-center">
        <img src="/Logo.png" alt="Logo" />
      </div>
    </Link>
  );
}

export default Logo;
