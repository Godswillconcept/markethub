import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css/bundle";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function NewCaro({
  items,
  renderItem,
  slidesPerView = 4,
  spaceBetween = 8,
  loop = false,
  showNav = true,
  showPagination = false,
  className = "",
}) {
  return (
    <div className="relative w-full">
      <Swiper
        modules={[Navigation, Pagination]}
        slidesPerView={slidesPerView}
        spaceBetween={spaceBetween}
        // centeredSlides={false}
        slidesPerGroup={1}
        style={{
          "--swiper-navigation-size": "24px",
          "--swiper-theme-color": "#000",
        }}
        loop={loop}
        navigation={showNav}
        pagination={showPagination ? { clickable: true } : false}
        className={`w-full !overflow-visible ${className}`}
        breakpoints={{
          0: {
            slidesPerView: 1,
            spaceBetween: 8,
          },
          480: {
            slidesPerView: 2,
            spaceBetween: 10,
          },
          640: {
            slidesPerView: 2,
            spaceBetween: 12,
          },
          768: {
            slidesPerView: 3,
            spaceBetween: 12,
          },
          1024: {
            slidesPerView: 4,
            spaceBetween: 16,
          },
        }}
      >
        {items.map((item, idx) => (
          <SwiperSlide key={idx} className="flex-0-0-auto h-auto">
            <div className="h-full w-full">{renderItem(item)}</div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
