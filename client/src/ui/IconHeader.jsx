function IconHeader({
  icon: Icon,
  bgColor = "bg-[#12778C33]",
  size = "w-15 h-15",
  iconSize = 24,
}) {
  return (
    <div
      className={`mb-6 flex items-center justify-center rounded-full ${bgColor} border-2 border-[#12778C] ${size} mx-auto`}
    >
      <Icon size={iconSize} className="block" />
    </div>
  );
}

export default IconHeader;
