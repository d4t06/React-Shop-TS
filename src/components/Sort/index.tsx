import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { SortType, selectedAllFilter, storingFilters } from "../../store/filtersSlice";
import classNames from "classnames/bind";
import styles from "./ProductSort.module.scss";

// import { getAll, getSearchPage } from '../../store/actions';
import { fetchProducts } from "../../store/productsSlice";
import { AppDispatch } from "@/store/store";
const cx = classNames.bind(styles);

const continents = [
   {
      id: 1,
      value: "Mới nhất",
      column: "",
      type: "asc",
   },
   {
      id: 2,
      value: "Giá thấp",
      column: "price",
      type: "asc",
   },
   {
      id: 3,
      value: "Giá cao",
      column: "price",
      type: "desc",
   },
   {
      id: 4,
      value: "Trả góp 0%",
      column: "installment",
      type: "asc",
   },
];

function ProductSort({ category_id, loading }: { category_id: number; loading: boolean }) {
   const dispatch = useDispatch<AppDispatch>();
   const { filters } = useSelector(selectedAllFilter);
   const [checked, setChecked] = useState(1);

   useEffect(() => {
      if (checked === 1) return;
      setChecked(1);
   }, [category_id]);

   const handleSort = (id: number) => {
      const newSort: SortType = {
         column: "",
         type: "acs",
      };
      if (id) {
         setChecked(id);

         newSort.column = continents[id - 1].column;
         newSort.type = continents[id - 1].type as SortType["type"];

         dispatch(storingFilters({ filters, sort: newSort }));
         dispatch(fetchProducts({ page: 1, category_id, filters, sort: newSort }));
      }
   };

   const handleToggle = (id: number) => {
      console.log("checked = ", checked);
      if (id !== checked) {
         handleSort(id);
      }
   };

   return (
      <div className={cx("product-sort")}>
         <h1 className="text-3xl">Xem theo</h1>
         <ul className={cx("btn-group", { disable: loading })}>
            {continents.map((item, index) => {
               return (
                  <li
                     className={cx("sort-btn", index + 1 === checked ? "active" : "")}
                     key={item.id}
                     onClick={() => handleToggle(item.id)}
                  >
                     {item.value}
                  </li>
               );
            })}
         </ul>
      </div>
   );
}

export default ProductSort;
