// function AuthButtons() {
//   return (
//     <div className="flex items-center gap-3">
//       <a
//         href="#login"
//         className="rounded-xl px-3 py-2 text-[16px] font-semibold text-neutral-900 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40"
//       >
//         Login
//       </a>
//       <a
//         href="#signup"
//         className="inline-flex h-11 items-center justify-center rounded-2xl bg-black px-5 text-[16px] font-semibold text-white shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40"
//       >
//         Sign Up
//       </a>
//     </div>
//   );
// }
// export default AuthButtons;
function AuthButtons() {
  return (
    <div className="flex items-center gap-3">
      <a
        href="/login"
        className="rounded-xl px-3 py-2 text-[16px] font-semibold text-neutral-900 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40"
      >
        Login
      </a>
      <a
        href="/signup"
        className="inline-flex h-11 items-center justify-center rounded-2xl bg-black px-5 text-[16px] font-semibold text-white shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40"
      >
        Sign Up
      </a>
    </div>
  );
}

export default AuthButtons;
