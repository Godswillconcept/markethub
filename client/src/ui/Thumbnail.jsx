import clsx from "clsx";

const Thumbnail = ({ src, alt, isActive, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "focus:ring-accent aspect-square h-20 w-20 overflow-hidden rounded-md transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:outline-none lg:h-24 lg:w-24",
        {
          "ring-accent ring-2 ring-offset-2": isActive, // Active state
          "opacity-60 hover:opacity-100": !isActive, // Inactive state with hover effect
        },
      )}
    >
      <img src={src} alt={alt} className="h-full w-full object-cover" />
    </button>
  );
};

export default Thumbnail;
