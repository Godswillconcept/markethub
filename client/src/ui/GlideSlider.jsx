import { Swiper, SwiperSlide } from "swiper/react";
import {
  EffectCoverflow,
  Pagination,
  Navigation,
  Autoplay,
} from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";

const GlideSlider = () => {
  return (
    <div className="flex justify-center py-3">
      <div className="mx-auto w-full max-w-6xl">
        <Swiper
          modules={[EffectCoverflow, Pagination, Navigation, Autoplay]}
          effect={"coverflow"}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={"auto"}
          loop={true}
          autoplay={{
            delay: 3000, // 3 seconds
            disableOnInteraction: false, // keeps autoplay even after interaction
          }}
          coverflowEffect={{
            rotate: -10, // Rotation angle of slides
            stretch: -45, // Space between slides (can make it "wider")
            depth: 90, // Depth offset in px
            modifier: 1, // Multiplier for effect
            slideShadows: true,
          }}
          // pagination={{ clickable: true }}
          // navigation={true}
          className="mySwiper"
        >
          <SwiperSlide className="flex !h-80 !w-64 items-center justify-center rounded-xl shadow-lg">
            <img
              src="/productImg/productImg.png"
              alt="Fashion product showcase"
            />
          </SwiperSlide>
          <SwiperSlide className="flex !h-80 !w-64 items-center justify-center rounded-xl shadow-lg">
            <img
              src="/productImg/productImg2.png"
              alt="Fashion product showcase"
            />
          </SwiperSlide>
          <SwiperSlide className="flex !h-80 !w-64 items-center justify-center rounded-xl shadow-lg">
            <img
              src="/productImg/productImg3.png"
              alt="Fashion product showcase"
            />
          </SwiperSlide>
          <SwiperSlide className="flex !h-80 !w-64 items-center justify-center rounded-xl shadow-lg">
            <img
              src="/productImg/productImg4.png"
              alt="Fashion product showcase"
            />
          </SwiperSlide>
          <SwiperSlide className="flex !h-80 !w-64 items-center justify-center rounded-xl shadow-lg">
            <img
              src="/productImg/productImg5.png"
              alt="Fashion product showcase"
            />
          </SwiperSlide>
          <SwiperSlide className="flex !h-80 !w-64 items-center justify-center rounded-xl shadow-lg">
            <img
              src="/productImg/productImg6.png"
              alt="Fashion product showcase"
            />
          </SwiperSlide>
          <SwiperSlide className="flex !h-80 !w-64 items-center justify-center rounded-xl shadow-lg">
            <img
              src="/productImg/productImg7.png"
              alt="Fashion product showcase"
            />
          </SwiperSlide>
          <SwiperSlide className="flex !h-80 !w-64 items-center justify-center rounded-xl shadow-lg">
            <img
              src="/productImg/productImg8.png"
              alt="Fashion product showcase"
            />
          </SwiperSlide>
          <SwiperSlide className="flex !h-80 !w-64 items-center justify-center rounded-xl shadow-lg">
            <img
              src="/productImg/productImg9.png"
              alt="Fashion product showcase"
            />
          </SwiperSlide>
          <SwiperSlide className="flex !h-80 !w-64 items-center justify-center rounded-xl shadow-lg">
            <img
              src="/productImg/productImg10.png"
              alt="Fashion product showcase"
            />
          </SwiperSlide>
          <SwiperSlide className="flex !h-80 !w-64 items-center justify-center rounded-xl shadow-lg">
            <img
              src="/productImg/productImg11.png"
              alt="Fashion product showcase"
            />
          </SwiperSlide>
          <SwiperSlide className="flex !h-80 !w-64 items-center justify-center rounded-xl shadow-lg">
            <img
              src="/productImg/productImg12.png"
              alt="Fashion product showcase"
            />
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
  );
};

export default GlideSlider;
