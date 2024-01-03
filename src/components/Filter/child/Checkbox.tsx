import classNames from "classnames/bind";
import styles from "../ProductFilter.module.scss";
import { FilterType } from "@/store/filtersSlice";
import { useMemo } from "react";
import { useApp } from "@/store/AppContext";
import { Brand } from "@/types";

const cx = classNames.bind(styles);

type Props = {
   handleFilter: (brand: any) => void;
   filters: FilterType;
   category: string;
};

export default function Checkbox({ handleFilter, filters, category }: Props) {
   const { brands } = useApp();
   const brandList = useMemo(() => brands[category], [category]);

   const handleToggle = (value: Brand) => {
      let newBrands = [...filters.brands];

      if (!value) newBrands = [];
      else {
         const index = newBrands.indexOf(value);

         if (index === -1) newBrands.push(value);
         else newBrands.splice(index, 1);
      }

      handleFilter(newBrands);
   };

   if (!brandList) return "Data it not array";

   return (
      <>
         {brandList.map((item, index) => {
            const isChecked = false
               // filters.brands.indexOf(item.brand_ascii) !== -1 || (!item.brand_ascii && !filters.brand.length);
            return (
               <div key={index} className={cx("filter-item")}>
                  <input
                     id={item.brand_ascii}
                     type="checkbox"
                     checked={isChecked}
                     onChange={() => handleToggle(item)}
                  />
                  <label htmlFor={item.brand_ascii} className={cx("label")}>
                     {item.brand_name}
                  </label>
               </div>
            );
         })}
      </>
   );
}
