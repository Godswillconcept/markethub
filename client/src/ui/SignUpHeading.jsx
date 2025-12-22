import Logo from "./Logo.jsx";

function SignUpHeading() {
  return (
    <div>
      {/* ✅ Progress Bar */}
      <div className="mb-6 h-1 w-40 rounded-full bg-gray-200">
        <div className="h-1 w-[45%] rounded-full bg-gray-900"></div>
      </div>
      <Logo />
    </div>
  );
}

export default SignUpHeading;

// <div className="mb-2 hidden w-24 rounded-full bg-gray-200 pt-14 md:block">

//   {/* <div className="h-1 w-12 rounded-full bg-indigo-600"></div> */}
// </div>