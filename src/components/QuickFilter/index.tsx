import { useMemo } from "react";

import classNames from "classnames/bind";
import styles from "./BrandSort.module.scss";

import BrandList from "./BrandList";
import SelectedSort from "./SelectedSort";

import { useDispatch, useSelector } from "react-redux";
import { selectedAllProduct, selectedAllFilter, fetchProducts, storingFilters } from "../../store";
import { FilterType } from "@/store/filtersSlice";
import { AppDispatch } from "@/store/store";
import { Brand, Category } from "@/types";
import Skeleton from "../Skeleton";

const cx = classNames.bind(styles);

type Props = { admin?: boolean; brands: Brand[]; loading: boolean; curCategory: Category };

export default function QuickFilter({ brands, admin, loading, curCategory }: Props) {
   const dispatchRedux = useDispatch<AppDispatch>();
   const { page, category_id } = useSelector(selectedAllProduct);
   const { filters: filtersInStore, sort } = useSelector(selectedAllFilter);

   const isFiltered = useMemo(() => !!filtersInStore?.brands.length, [filtersInStore]);

   const showFilteredResults = (filters: FilterType) => {
      dispatchRedux(fetchProducts({ page, sort, category_id, filters, admin }));
   };

   const handleFilter = (filters: Brand[], by: keyof FilterType | "clear") => {
      let newFilters: FilterType = { ...filtersInStore };

      if (by === "clear") {
         newFilters.brands = [];
         // newFilters.price = [];
      } else {
         newFilters[by] = filters;
      }

      // >>> api
      showFilteredResults(newFilters);
      // >>> local
      dispatchRedux(storingFilters({ sort, filters: newFilters }));
   };

   const BrandSkeleton = useMemo(() => {
      return [...Array(5).keys()].map((index) => <Skeleton key={index} className="brand-skeleton" />);
   }, []);

   const BrandsRemaining = useMemo(() => {
      if (loading || !brands) return [];
      if (!admin) return brands;

      return brands.filter((b) => {
         const existing = filtersInStore.brands.map((e) => e.brand_ascii);
         return !existing.includes(b.brand_ascii);
      });
   }, [curCategory, filtersInStore, loading]);

   return (
      <>
         <div className={cx("container", { disable: loading, admin })}>
            {loading && <div className={cx("brand-list")}>{BrandSkeleton}</div>}

            {!loading && brands && (
               <>
                  {!admin && (
                     <div className={cx("brand-list")}>
                        {isFiltered ? (
                           <SelectedSort
                              // curCategory_id={curCategory_id
                              data={filtersInStore}
                              handleFilter={handleFilter}
                           />
                        ) : (
                           <BrandList data={BrandsRemaining} handleFilter={handleFilter} />
                        )}
                     </div>
                  )}

                  {admin && (
                     <>
                        {isFiltered && (
                           <div className={cx("brand-list")}>
                              <SelectedSort data={filtersInStore} handleFilter={handleFilter} />
                           </div>
                        )}
                        {!!BrandsRemaining.length && (
                           <div className={cx("brand-list")}>
                              <BrandList
                                 admin
                                 filtersInStore={filtersInStore}
                                 data={BrandsRemaining}
                                 handleFilter={handleFilter}
                              />
                           </div>
                        )}
                     </>
                  )}
               </>
            )}
         </div>
      </>
   );
}
