import classNames from "classnames/bind";
import styles from "./ProductDetail.module.scss";
import { ImageSlider, Cart, Modal, Button } from "../../components";

import ProductVariantList from "@/components/ProductVariantList";

import { useEffect, useState } from "react";
import { Detail, Product } from "@/types";
import { useParams } from "react-router-dom";
const cx = classNames.bind(styles);

type Props = {
   data: Product & Detail;
};

function DetailProductItem({ data }: Props) {
   const [showModal, setShowModal] = useState(false);
   const [sliderImages, setSliderImages] = useState<string[]>([]);

   const {st} = useParams()

   useEffect(() => {
      window?.scroll({
         behavior: "smooth",
         top: 0,
      });
   }, []);


   console.log('check params', st);
   

   return (
      <>
         <div className={cx("row", "main-contain")}>
            <div className={cx("col-large col-6", "box_left")}>
               {!!sliderImages.length && <ImageSlider data={sliderImages} />}
            </div>   
            <div className={cx("col-large col-6", "box_right")}>
               <h1 className={cx("product-name")}>{data.product_name}</h1>

               <ProductVariantList
                  setSliderImages={setSliderImages}
                  colors={data.colors_data}
                  combines={data.combines_data}
                  storages={data.storages_data}
                  sliders={data.sliders_data}
                  query={st as string}
               />
               <div className={cx("product-cta")}>
                  <Button className="w-[100%]" onClick={() => setShowModal(true)}>
                     Mua Ngay
                  </Button>
               </div>
               <div className={cx("product-policy")}>
                  <h1 className={cx("policy-title")}>Chính Sách Bảo Hành</h1>
                  <ul>
                     <li>
                        <div className={cx("icon-frame")}>
                           <div className={cx("policy-icon", "icon-doimoi")}></div>
                        </div>
                        <span>Hư gì đổi nấy 12 tháng tại 3384 siêu thị toàn quốc</span>
                     </li>
                     <li>
                        <div className={cx("icon-frame")}>
                           <div className={cx("policy-icon", "icon-baohanh")}></div>
                        </div>
                        <span>Bảo hành chính hãng điện thoại 12 tháng tại các trung tâm bảo hành hãng</span>
                     </li>
                     <li>
                        <div className={cx("icon-frame")}>
                           <div className={cx("policy-icon", "icon-box")}></div>
                        </div>
                        <span>Bộ sản phẩm gồm: Hộp, Sách hướng dẫn, Cây lấy sim, Cáp Type C</span>
                     </li>
                  </ul>
               </div>
            </div>
         </div>
         {showModal && (
            <Modal setShowModal={setShowModal}>
               <Cart data={data} onClose={() => setShowModal(false)} />
            </Modal>
         )}
      </>
   );
}

export default DetailProductItem;
