import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { moneyFormat } from "../../utils/appHelper";
import classNames from "classnames/bind";
import styles from "./Search.module.scss";
import searchService from "../../services/searchService";
import useDebounce from "../../hooks/useDebounce";
import Popup from "../ui/Popup";

import PopupStyles from "../ui/Popup/Popup.module.scss";

const cx = classNames.bind(styles);
// const  = classNames.bind(PopupStyles);

type Props = {
   setShowModal: Dispatch<SetStateAction<boolean>>;
};

function Search({ setShowModal }: Props) {
   const [loading, setLoading] = useState(false);
   const [query, setQuery] = useState("");
   const [searchResult, setSearchResult] = useState<{ products: any[] }>();
   const [show, setShow] = useState(false);

   // use hooks
   let debounceValue = useDebounce(query, 1000);
   const navigate = useNavigate();

   const handleSearchText = (e: any) => {
      handleShow(true);
      setQuery(e.target.value);
      if (!query) setSearchResult(undefined);
   };

   const handleClear = (e: any) => {
      e.stopPropagation();
      setQuery("");
      debounceValue = "";
      setSearchResult(undefined);
   };

   const handleShow = (value: any) => {
      setShow(value);
      setShowModal(value);
   };

   const handleDetailPage = (item: any) => {
      handleShow(false);
      navigate(`/${item.category_name}/${item.product_id}`);
   };

   const handleSubmit = () => {
      handleShow(false);
      navigate(`/search/${query}`);
   };

   const isShowResult = useMemo(() => !!query && !!searchResult && !!show, [show, searchResult, query]);

   useEffect(() => {
      if (!debounceValue.trim()) return;

      const fetchApi = async () => {
         try {
            console.log("get data");
            setLoading(true);
            const result = await searchService({ q: debounceValue });

            if (result) {
               setSearchResult(result);
            }
         } catch (error) {
            console.log(error);
         } finally {
            setLoading(false);
         }
      };

      fetchApi();
   }, [debounceValue]);

   // return;
   return (
      <Popup
         content={
            <div className={("wrap")}>
               <h2 className={("search-result-title")}>Sản phẩm được gợi ý</h2>
               <ul>
                  {searchResult &&
                     searchResult?.products.map((item) => {
                        return (
                           <li
                              onClick={() => handleDetailPage(item)}
                              className={("product-item")}
                              key={item.product_id}
                           >
                              <div className={("product-img")}>
                                 <img src={item.image_url} alt="" />
                              </div>
                              <div className={("product-info")}>
                                 <h2 className={("title")}>{item.name}</h2>
                                 {item.old_price && (
                                    <>
                                       <span className={("old_price")}>{moneyFormat(item?.old_price)}₫</span>
                                       <span className={("discount-percent")}>
                                          -{(((+item.old_price - +item.cur_price) / +item.old_price) * 100).toFixed(0)}%
                                       </span>
                                    </>
                                 )}
                                 <p className={("cur_price")}>{moneyFormat(item.cur_price)}₫</p>
                              </div>
                           </li>
                        );
                     })}
               </ul>
            </div>
         }
         opts={{
            visible: isShowResult,
            appendTo: () => document.body,
            onClickOutside: () => handleShow(false),
         }}
      >
         <div className={cx("wrap")}>
            <form className={cx("form")} onSubmit={handleSubmit}>
               <input
                  className={cx("input")}
                  type="text"
                  placeholder="Hôm nay bạn muốn tìm gì..."
                  value={query}
                  onChange={(e) => handleSearchText(e)}
                  onFocus={() => handleShow(true)}
                  onKeyDown={(e) => {
                     e.key === "Enter" && handleSubmit();
                  }}
               />
               {loading && query && (
                  <button className={cx("loading-btn", "btn")}>
                     <i className="material-icons">sync</i>
                  </button>
               )}
               {!loading && query && (
                  <button className={cx("clear-btn", "btn")} onClick={(e) => handleClear(e)}>
                     <i className="material-icons">clear</i>
                  </button>
               )}
               <button onClick={handleSubmit} className={cx("search-btn", "btn")}>
                  <i className="material-icons">search</i>
               </button>
            </form>
         </div>
      </Popup>
   );
}
export default Search;
