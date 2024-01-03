import classNames from "classnames/bind";
import styles from "./BrandSort.module.scss";

import { useState } from "react";
import { FilterType } from "@/store/filtersSlice";
import { Brand } from "@/types";
// import useStore from '../../hooks/useStore';
// import {getAll} from '../../store/actions'

const cx = classNames.bind(styles);

type Props = {
   data: Brand[];
   filtersInStore?: FilterType;
   admin?: boolean;
   handleFilter: (filters: Brand[], by: keyof FilterType | "clear") => void;
};

function BrandList({ data, handleFilter, filtersInStore, admin }: Props) {
   const handleToggle = (brand: Brand) => {
      if (admin) {
         // *** filterInStore will pass with admin
         const newBrands = [...filtersInStore!.brands, brand];
         return handleFilter(newBrands, "brands");
      }

      return handleFilter([brand], "brands");
   };

   if (!data) return;

   return (
      <>
         {data.map((item, index) => {
            return (
               <div
                  key={index}
                  className={cx("sort-item", { "no-image": !item.image_url })}
                  onClick={() => handleToggle(item)}
               >
                  {item.image_url ? <img src={item.image_url} alt="" /> : <p className="text-[18px]">{item.brand_name}</p>}
               </div>
            );
         })}
      </>
   );
}

export default BrandList;
