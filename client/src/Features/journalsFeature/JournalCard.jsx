import { useNavigate } from "react-router";
import { memo } from "react";

const JournalCard = memo(function JournalCard({ journal }) {
  const navigate = useNavigate();
  // const image = journal.featured_images?.[0] || "https://picsum.photos/300/300?random=9999990";
  const image = "https://picsum.photos/300/300?random=9999990";

  return (
    <div className="relative">
      <div
        aria-label={journal.title}
        className="group block aspect-[3/4] w-full overflow-hidden rounded-2xl bg-neutral-200 shadow-lg transition-all duration-300 hover:shadow-xl"
        onClick={() => navigate(`/journals/${journal.slug}`)}
      >
        <img
          src={image}
          alt={journal.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

        {/* Text */}
        <div className="absolute bottom-0 p-4 text-white md:p-6">
          <p className="text-xs opacity-80">{journal.date}</p>
          <h3 className="mt-1 text-lg font-semibold">{journal.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-cyan-200 opacity-90">
            {journal.excerpt}
          </p>
        </div>
      </div>
    </div>
  );
});

export default JournalCard;
