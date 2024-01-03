import { useSelector, useDispatch } from "react-redux";

import { fetchProducts, selectedAllProduct } from "../../store/productsSlice";
import { FilterType, selectedAllFilter, storingFilters } from "../../store/filtersSlice";

import classNames from "classnames/bind";
import styles from "./ProductFilter.module.scss";

import Checkbox from "./child/Checkbox";
import Radiobox from "./child/Radiobox";

import { AppDispatch } from "@/store/store";
import { useMemo } from "react";
import Skeleton from "../Skeleton";
import { Brand } from "@/types";

const cx = classNames.bind(styles);

type Props = { category: string; loading: boolean };

function ProductFilter({ category, loading }: Props) {
   const dispatch = useDispatch<AppDispatch>();
   const { sort, filters: filtersInStore } = useSelector(selectedAllFilter);
   const { status, category_id } = useSelector(selectedAllProduct);

   const showFilteredResults = (filters: FilterType) => {
      dispatch(fetchProducts({ page: 1, sort, category_id, filters }));
   };

   const handleFilter = (field: Brand[], by: keyof FilterType) => {
      let newFilters = { ...filtersInStore };

      newFilters[by] = field;

      // >>> api
      showFilteredResults(newFilters);
      // >>> local
      dispatch(storingFilters({ sort, filters: newFilters }));
   };

   const BrandSkeleton = useMemo(() => {
      return [...Array(5).keys()].map((index) => <Skeleton key={index} className="filter-brand-skeleton" />);
   }, []);

   const PriceSkeleton = useMemo(() => {
      return [...Array(5).keys()].map((index) => <Skeleton key={index} className="filter-price-skeleton" />);
   }, []);

   return (
      <div className={cx("col", "col-3")}>
         <div className={cx("product-filter", { disable: status === "loading" })}>
            <div className={cx("filter-section")}>
               <h1 className={cx("filter-title")}>Hãng sản xuất</h1>
               <div className={cx("filter-list")}>
                  {/* phai render data lay ra tu checkbox component
                  tại vì mỗi checkbook có một state riêng, state lấy dữ liệu từ nhiều item, nhưng không thể render nhiều checkbox
                  ban đầu render nhiều checkbox
                  fix: chỉ có mỗi checkbox nhưng trong checkbox có nhiều item */}
                  {loading ? (
                     BrandSkeleton
                  ) : (
                     <Checkbox
                        filters={filtersInStore}
                        handleFilter={(filters) => handleFilter(filters, "brands")}
                        category={category}
                     />
                  )}

                  {/* truyền handleFilter vào cop Checkbox, chực hiện sau trể về đối số là filter sau đó tt*/}
               </div>
            </div>
            <div className={cx("filter-section")}>
               <h1 className={cx("filter-title")}>Mức giá</h1>
               <div className={cx("filter-list", "price")}>
                  {/* {loading ? (
                     PriceSkeleton
                  ) : (
                     <Radiobox
                        filters={filtersInStore}
                        handleFilter={(filter) => handleFilter(filter, "")}
                        category={category}
                     />
                  )} */}
               </div>
            </div>
         </div>
      </div>
   );
}

export default ProductFilter;
