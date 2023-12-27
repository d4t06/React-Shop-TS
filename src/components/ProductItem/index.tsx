import { Link } from "react-router-dom";
import classNames from "classnames/bind";
import styles from "./ProductItem.module.scss";
import { moneyFormat } from "../../utils/appHelper";
import { Product, ProductStorage } from "@/types";
import { useState } from "react";
//

const cx = classNames.bind(styles);

type Props = {
   data: Product;
   preview?: boolean;
};

const findActiveVar = (storages: ProductStorage[] | undefined) => {
   if (!storages) return undefined;
   return storages.find((v) => v.default);
};

export default function ProductItem({ data, preview }: Props) {
   const [activeVar, setActiveVar] = useState(findActiveVar(data.storages_data));

   // console.log('check data', data);
   

   return (
      <div className={cx("product-item")}>
         {/* preview in dashboard */}
         {preview ? (
            <div className={cx("product-item-frame")}>
               <img className={cx("product-item-image")} src={data.image_url || "https://placehold.co/300X400"} />
            </div>
         ) : (
            <Link
               to={`/${data.category_name_ascii}/${data.product_name_ascii}?${activeVar?.storage_ascii || ""}`}
               className={cx("product-item-frame")}
            >
               <img className={cx("product-item-image")} src={data.image_url || "https://placehold.co/300X400"} />
            </Link>
         )}
         {data.installment && (
            <div className={cx("product-item-installment")}>
               <span>Trả góp 0%</span>
            </div>
         )}
         <div className={cx("product-item-body")}>
            <h4 className={cx("product-item_name")}>{data.product_name || "Example"}</h4>

            {data.storages_data ? (
               <>
                  <ul className={cx("variant-box")}>
                     {data.storages_data.map((v, index) => (
                        <li
                           key={index}
                           className={cx({ active: activeVar?.storage_ascii === v.storage_ascii })}
                           onClick={() => setActiveVar(v)}
                        >
                           {v.storage}
                        </li>
                     ))}
                  </ul>
                  <div className={cx("product-item_price")}>
                     {/* <div className={cx("price-top")}>
                  {data.old_price && data.old_price > data.cur_price && (
                     <>
                        <span className={cx("product-item_price--old")}>
                           {data.old_price && moneyFormat(data.old_price) + "₫"}
                        </span>
                        <span className={cx("discount-percent")}>
                           -{(((data.old_price - data.cur_price) / data.old_price) * 100).toFixed(0)}%
                        </span>
                     </>
                  )}
               </div> */}

                     <h1 className={cx("product-item_price--current")}>{moneyFormat(activeVar!.base_price)}đ</h1>
                  </div>
               </>
            ) : (
               <div className={cx("product-item_price")}>
                  <h1 className={cx("product-item_price--current")}>Contact</h1>
               </div>
            )}
         </div>
      </div>
   );
}