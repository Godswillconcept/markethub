function BrandMark({ size = "md" }) {
  const sizeClasses = {
    sm: "h-[25px] w-[50px]", // small logo
    md: "h-10 w-auto", // medium logo
    lg: "h-14 w-auto", // large logo
    xl: "h-20 w-auto", // extra large logo
  };

  return (
    <a href="#" aria-label="Stylay home" className="flex items-center gap-2">
      <img src="/navLogo.png" alt="Stylay" className={sizeClasses[size]} />
    </a>
  );
}

export default BrandMark;
