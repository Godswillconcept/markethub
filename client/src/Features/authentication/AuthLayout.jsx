// import { Outlet } from "react-router";
// import AuthImage from "../../ui/AuthImage";
// import CheckEmail from "./CheckEmail";

// function AuthLayout() {
//   return (
//     <div className="flex h-screen">
//       <div className="hidden h-full w-1/3 md:block">
//         <AuthImage />
//       </div>

//       <div className="flex flex-1 items-center justify-center bg-gray-50 px-4 py-8">
//         <Outlet />
//       </div>
//     </div>
//   );
// }

// export default AuthLayout;

import { Outlet } from "react-router";
import AuthImage from "../../ui/AuthImage.jsx";

function AuthLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left side stays fixed */}
      <div className="hidden h-full w-1/3 md:block">
        <AuthImage />
      </div>

      {/* Right side scrolls if content is too much */}
      <div className="flex flex-1 items-center justify-center bg-gray-50 px-4 py-8 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}

export default AuthLayout;
