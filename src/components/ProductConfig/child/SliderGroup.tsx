import { Ref, forwardRef, useImperativeHandle, useRef, useState } from "react";

import Empty from "@/components/ui/Empty";
import { Slider, SliderImage, SliderImageSchema, SliderSchema } from "@/types";

import { usePrivateRequest } from "@/hooks";
import { Gallery, Modal } from "@/components";
import { useToast } from "@/store/ToastContext";
import OverlayCTA from "@/components/ui/OverlayCTA";
// import { sleep } from "@/utils/appHelper";
// import { sleep } from "@/utils/appHelper";

// const cy = classNames.bind(stylesMain);

const SLIDER_URL = "/slider-management/sliders";

type SliderGroupProps = {
   initSlider: Slider;
   isExist: boolean;
   color_ascii: string;
};

export type SliderRef = {
   submit: () => Promise<(SliderSchema & { id: number; color_ascii: string }) | undefined>;
   validate: () => boolean;
};

function SliderGroup({ initSlider, isExist, color_ascii }: SliderGroupProps, ref: Ref<SliderRef>) {
   const [sliderImages, setSlideImages] = useState<SliderImage[]>(initSlider.images || []);
   const [isOpenModal, setIsOpenModal] = useState(false);
   const [error, setError] = useState(false);
   const curIndex = useRef(0);
   const openGalleryType = useRef<"add" | "change">("add");

   // hooks
   const { setErrorToast } = useToast();
   const privateRequest = usePrivateRequest();

   const handleOpenModal = (type: typeof openGalleryType.current, i?: number) => {
      openGalleryType.current = type;
      curIndex.current = i || 0;
      setIsOpenModal(true);
   };
   const checkDuplicate = (image_url: string) => {
      return !!sliderImages.find((sImg) => sImg.image_url === image_url);
   };

   const handleAddSliderImage = (imageUrl: string) => {
      if (checkDuplicate(imageUrl)) {
         setErrorToast("Image duplicate");
         return;
      }
      switch (openGalleryType.current) {
         case "add":
            setSlideImages((prev) => [...prev, { image_url: imageUrl, slider_id: 0, id: 0 }]);
            setError(false);
            break;
         case "change":
            const newImages = [...sliderImages];
            newImages[curIndex.current].image_url = imageUrl;
            setSlideImages(newImages);
      }
   };

   const handleRemoveSliderImage = (imageUrl: string) => {
      const newImages = sliderImages.filter((item) => item.image_url != imageUrl);
      setSlideImages(newImages);
   };

   const trackingSliderImages = () => {
      let newSliderImages: SliderImage[] = [];
      if (!initSlider.images.length) newSliderImages = sliderImages;
      else
         sliderImages.forEach((UKImage) => {
            const exist = initSlider.images.find((existImage) => existImage.image_url === UKImage.image_url);
            if (!exist) newSliderImages.push(UKImage);
         });

      let removeSliderImages: number[] = [];
      if (initSlider.images.length) {
         // slider image alway include id when have init sliderI images
         initSlider.images.forEach((existImage) => {
            const exist = sliderImages.find((UKImage) => existImage.image_url === UKImage.image_url);
            if (!exist) removeSliderImages.push(existImage.id as number);
         });
      }

      return { newSliderImages, removeSliderImages };
   };

   const validate = () => {
      if (!sliderImages.length) {
         setError(true);
         return true;
      } else return false;
   };

   const submit = async () => {
      try {
         const sliderData: SliderSchema = {
            slider_name: initSlider.slider_name,
         };

         let sliderDataToReturn: (SliderSchema & { id: number; color_ascii: string }) | undefined = undefined;

         if (!isExist) {
            const res = await privateRequest.post(SLIDER_URL, sliderData, {
               headers: { "Content-Type": "application/json" },
            });

            const sliderRes = res.data as SliderSchema & { id: number };
            sliderDataToReturn = { ...sliderData, id: sliderRes.id, color_ascii: color_ascii };
         }

         const { newSliderImages, removeSliderImages } = trackingSliderImages();
         // console.log("check image new =", newSliderImages, "remove =", removeSliderImages);

         if (newSliderImages.length) {
            const slider_id = isExist ? initSlider?.id : sliderDataToReturn?.id;
            if (!slider_id) {
               setErrorToast("Error when add slider images");
               return;
            }

            const sliderImages: SliderImageSchema[] = newSliderImages.map((image) => ({
               image_url: image.image_url,
               slider_id,
            }));

            await privateRequest.post(SLIDER_URL + "/images", sliderImages, {
               headers: { "Content-Type": "application/json" },
            });
         }

         if (removeSliderImages.length) {
         }

         return sliderDataToReturn;
      } catch (error) {
         console.log({ message: error });
         throw new Error("error");
      }
   };

   useImperativeHandle(ref, () => ({
      submit,
      validate,
   }));

   return (
      <>
         <div className="col col-9">
            <div className="row">
               {sliderImages.map((SliderImage, index) => (
                  <div key={index} className="col col-2">
                     <div className="relative border rounded-[8px] overflow-hidden group">
                        <img src={SliderImage.image_url} alt="" />
                        <OverlayCTA
                           data={[
                              {
                                 cb: () => handleRemoveSliderImage(SliderImage.image_url),
                                 icon: "delete",
                              },
                              {
                                 cb: () => handleOpenModal("change", index),
                                 icon: "sync",
                              },
                           ]}
                        />
                     </div>
                  </div>
               ))}
               <div className="col col-2">
                  <Empty className={`${error ? "bg-red-200" : ""}`} onClick={() => handleOpenModal("add")} />
               </div>
            </div>
         </div>

         {isOpenModal && (
            <Modal setShowModal={setIsOpenModal}>
               <Gallery setImageUrl={handleAddSliderImage} setIsOpenModal={setIsOpenModal} />
            </Modal>
         )}
      </>
   );
}

export default forwardRef(SliderGroup);
