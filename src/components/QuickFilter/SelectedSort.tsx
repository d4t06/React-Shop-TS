import classNames from "classnames/bind";
import styles from "./BrandSort.module.scss";
import { price } from "@/assets/data";
import { useMemo } from "react";
import { FilterType } from "@/store/filtersSlice";
import { Brand } from "@/types";

const cx = classNames.bind(styles);

type Props = {
   // curCategory_id: number;
   data: FilterType;
   handleFilter: (filters: Brand[], by: keyof FilterType | "clear") => void;
};

export default function SelectedSort({ data, handleFilter }: Props) {
   const handleToggle = (brand: Brand) => {
      let newBrands = [...data.brands];

      newBrands = newBrands.filter((b) => b.brand_ascii !== brand.brand_ascii);
      handleFilter(newBrands, "brands");
   };

   // const priceList = price[(curCategory_id) as keyof typeof price];

   // const priceContent = priceList
   //    ? priceList.find((item) => JSON.stringify(item.array) === JSON.stringify(data.price))
   //    : {};

   const isShowClear = useMemo(() => data.brands.length >= 2, [data]);

   return (
      <>
         <h2 className="text-[16px]">Bộ lọc:</h2>
         {data.brands.map((item, index) => {
            return (
               <div onClick={() => handleToggle(item)} className={cx("filter-item")} key={index}>
                  <p>{item.brand_name}</p>
                  <i className="material-icons">delete</i>
               </div>
            );
         })}
         {/* {priceContent && !!data.price.length && (
            <span onClick={() => handleFilter([], "price")} className={cx("filter-item")}>
               {priceContent!.text || ""}
               <i className="material-icons">delete</i>
            </span>
         )} */}
         {isShowClear && (
            <button className={cx("clear-filter")} onClick={() => handleFilter([], "clear")}>
               <i className="material-icons">clear</i>
            </button>
         )}
      </>
   );
}
