import classNames from "classnames/bind";

import styles from "@/pages/Login/Login.module.scss";
import stylesMain from "@/pages/AddProduct/AddProduct.module.scss";
import { Ref, forwardRef, useImperativeHandle, useRef } from "react";
import { initCombineData } from "@/utils/appHelper";
import {
   ProductColor,
   ProductCombine,
   ProductSlider,
   ProductStorage,
   Slider,
   // SliderRaw,
   SliderSchema,
} from "@/types";
import { useProductContext } from "@/store/ProductDataContext";
import SliderGroup, { SliderRef } from "./child/SliderGroup";
import InputGroup, { CombineRef } from "./child/CombineGroup";

const cy = classNames.bind(stylesMain);
const cx = classNames.bind(styles);

type Props = {
   colors: (ProductColor & { id?: number })[];
   storages: (ProductStorage & { id?: number })[];
   sliders: ProductSlider[];
};

export type ConfigRef = {
   submitSliders: () => Promise<(SliderSchema & { id: number; color_ascii: string })[]>;
   trackingCombine: () => { newCombines: ProductCombine[]; updateCombines: ProductCombine[] };
   validate: () => void;
};

const getExistCombine = (
   combines: ProductCombine[],
   colorItem: ProductColor & { id?: number },
   storageItem: ProductStorage & { id?: number },
   product_name_ascii: string
) => {
   let isExits = true;
   let existCombine = combines.find((item) => item.color_id === colorItem.id && item.storage_id === storageItem.id);

   if (!existCombine) {
      isExits = false;
      existCombine = initCombineData(
         {
            product_name_ascii,
         },
         colorItem.color,
         storageItem.storage
      );
   }

   return { existCombine, isExits };
};

const getExistSlider = (
   sliders: ProductSlider[] | undefined,
   colorItem: ProductColor & { id?: number },
   product_name: string
) => {
   const initSlider: Slider = {
      images: [],
      id: 0,
      slider_name: `slider for ${product_name} ${colorItem.color_ascii}`,
   };
   if (!sliders) {
      return { existSlider: initSlider, isExits: false };
   } else {
      const productSlider = sliders.find((sliderItem) => sliderItem.color_id === colorItem.id);
      if (!productSlider?.slider_data) return { existSlider: initSlider, isExits: false };

      return { existSlider: productSlider.slider_data, isExits: true };
   }
};

function ProductConfig({ colors, storages, sliders }: Props, ref: Ref<ConfigRef>) {
   const { combines_data, product_name_ascii, product_name } = useProductContext();

   const sliderRefs = useRef<(SliderRef | undefined)[]>([]);
   const combineRefs = useRef<(CombineRef | undefined)[]>([]);

   // const submitSliderList = sliderRefs.current.map((item) => item.submit);
   // const submitCombines = useMemo(() => combineRefs.current.map((item) => item.submit), [colors, storages]);

   const submitSliders = async () => {
      console.log(">>> submit slider");
      let newSliders = [];
      for (let sliderItem of sliderRefs!.current) {
         if (typeof sliderItem?.submit === "function") {
            const newSlider = await sliderItem.submit();
            if (newSlider) {
               newSliders.push(newSlider);
            }
         }
      }

      return newSliders;
   };

   const validate = () => {
      let isError = false;
      for (let sliderItem of sliderRefs!.current) {
         if (typeof sliderItem?.validate === "function") {
            if (sliderItem.validate()) isError = true;
         }
      }

      for (let combineItem of combineRefs!.current) {
         if (typeof combineItem?.validate === "function") {
            if (combineItem.validate()) isError = true;
         }
      }

      if (isError) {
         throw new Error("Input field missing");
      }
   };

   const trackingCombine: ConfigRef["trackingCombine"] = () => {
      console.log(">>> tracking combine");

      let newCombines: ProductCombine[] = [];
      let updateCombines: ProductCombine[] = [];
      for (let combineItem of combineRefs!.current) {
         if (typeof combineItem?.submit === "function") {
            const cb = combineItem.submit();
            if (cb) {
               const { data, type } = cb;
               switch (type) {
                  case "new":
                     newCombines.push(data);
                     break;
                  case "update":
                     updateCombines.push(data);
                     break;
               }
            }
         }
      }

      return { newCombines, updateCombines };
   };

   useImperativeHandle(ref, () => ({
      trackingCombine,
      submitSliders,
      validate,
   }));

   return (
      <>
         <div className={cx("label")}>Product Slider</div>
         {!!colors.length && (
            <div className="mb-[30px] bg-[#fff] rounded-[8px] p-[20px] flex flex-col gap-[40px]">
               {colors.map((item, index) => {
                  const { existSlider, isExits } = getExistSlider(sliders, item, product_name);
                  return (
                     <div key={index} className="row items-center">
                        <div key={index} className="col col-3">
                           <div className={cx("label", "text-center")}>{item.color}</div>
                        </div>
                        <SliderGroup
                           color_ascii={item.color_ascii}
                           ref={(ref) => (sliderRefs.current[index] = ref!)}
                           initSlider={existSlider}
                           isExist={isExits}
                        />
                     </div>
                  );
               })}
            </div>
         )}

         <div className="mb-[30px]">
            <div className={cx("label")}>Quantity & Price</div>
            {!!storages.length && (
               <div className={`bg-[#fff] rounded-[8px] p-[20px]`}>
                  {storages.map((storageItem, i) =>
                     colors.map((colorItem, j) => {
                        const { existCombine, isExits } = getExistCombine(
                           combines_data,
                           colorItem,
                           storageItem,
                           product_name_ascii
                        );
                        const key = storageItem.storage_ascii + colorItem.color_ascii;
                        const index = !i ? j : i * (j + colors.length);
                        // 0 1 2 3 4 5
                        // 0 1 2

                        return (
                           <div key={key} className="row items-center w-full">
                              <div className={`${cx("col col-6", "label", "min", "center")} ${cy("config-item")}`}>
                                 {storageItem.storage} / {colorItem.color}
                                 {/* {existCombine.default && "(default)"} */}
                              </div>
                              <InputGroup
                                 ref={(ref) => (combineRefs.current[index] = ref!)}
                                 initCombine={existCombine}
                                 isExist={isExits}
                              />
                           </div>
                        );
                     })
                  )}
               </div>
            )}
         </div>
      </>
   );
}
export default forwardRef(ProductConfig);
