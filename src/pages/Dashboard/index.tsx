import { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { moneyFormat } from "@/utils/appHelper";

import { Button, Input, Modal, QuickFilter } from "@/components";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, getMoreProducts, selectedAllFilter, selectedAllProduct, storingFilters } from "@/store";
import { AppDispatch } from "@/store/store";
import Table from "@/components/Table";
import { Category, Product } from "@/types";
import ConfirmModal from "@/components/Modal/Confirm";
import AddProductModal from "@/components/Modal/AddProductModal";
import { useApp } from "@/store/AppContext";
import useAppConfig from "@/hooks/useAppConfig";
import useProductAction from "@/hooks/useProductAction";

type ModelTarget = "Delete" | "Add" | "Edit";

function Dashboard() {
   const dispatch = useDispatch<AppDispatch>();

   const [isOpenModal, setIsOpenModal] = useState(false);
   const [curCategory, setCurCategory] = useState<Category>();

   const curPro = useRef<Product & { curIndex: number }>();
   const firstTimeRender = useRef(true);
   const openModalTarget = useRef<ModelTarget | "">("");

   // hooks
   const {
      page,
      productState: { count, products },
      status,
      category_id,
   } = useSelector(selectedAllProduct);
   const { filters, sort } = useSelector(selectedAllFilter);
   const { categories, brands } = useApp();
   const { status: appConfigStatus } = useAppConfig({ curCategory });
   const { deleteProduct, apiLoading } = useProductAction({ setIsOpenModal });

   const remaining = useMemo(() => count - products.length, [products]);

   const handleGetMore = () => {
      // if (!curCategory) return;
      dispatch(getMoreProducts({ category_id, sort, filters, page: page + 1, admin: true }));
   };

   const handleDeleteProduct = async () => {
      await deleteProduct(curPro.current);
   };

   const handleOpenModal = (type: ModelTarget, product?: Product & { curIndex: number }) => {
      curPro.current = product;
      openModalTarget.current = type;
      setIsOpenModal(true);
   };

   const renderProducts = (
      <Table colList={["Name", "Storage", "Color", "Price", "Quantity", "Installment", ""]}>
         {status !== "loading" && (
            <>
               {!!products.length ? (
                  <>
                     {products.map((productItem, index) => {
                        return (
                           <tr key={index}>
                              <td>{productItem.product_name}</td>
                              {/* loop here */}
                              <td>
                                 {productItem.combines_data.map((item, index) => (
                                    <span key={index}>
                                       {item.storage_data?.storage}
                                       <br className="my-[10px]" />
                                    </span>
                                 ))}
                              </td>
                              <td>
                                 {productItem.combines_data.map((cb, index) => (
                                    <span key={index}>
                                       {cb.color_data?.color}
                                       <br className="my-[10px]" />
                                    </span>
                                 ))}
                              </td>

                              <td>
                                 {productItem.combines_data.map((cb, index) => (
                                    <span key={index}>
                                       {moneyFormat(cb.price)} đ
                                       <br className="my-[10px]" />
                                    </span>
                                 ))}
                              </td>
                              <td>
                                 {productItem.combines_data.map((cb, index) => (
                                    <span key={index}>
                                       {cb.quantity}
                                       <br className="my-[10px]" />
                                    </span>
                                 ))}
                              </td>
                              <td>{productItem.installment ? "Yes" : ""}</td>
                              <td>
                                 <div className="flex gap-[6px]">
                                    <Button
                                       onClick={() => handleOpenModal("Edit", { ...productItem, curIndex: index })}
                                       circle
                                       className="bg-black/10 hover:bg-[#cd1818] hover:text-white"
                                    >
                                       <i className="material-icons">edit</i>
                                    </Button>
                                    <Link to={`product/edit/${productItem.product_name_ascii}`}>
                                       <Button circle className="bg-black/10 hover:bg-[#cd1818] hover:text-white">
                                          <i className="material-icons">settings</i>
                                       </Button>
                                    </Link>
                                    <Button
                                       onClick={() => handleOpenModal("Delete", { ...productItem, curIndex: index })}
                                       circle
                                       className="bg-black/10 hover:bg-[#cd1818] hover:text-white"
                                    >
                                       <i className="material-icons">delete</i>
                                    </Button>
                                 </div>
                              </td>
                           </tr>
                        );
                     })}
                  </>
               ) : (
                  <tr>
                     <td>
                        <h1>No product jet...</h1>
                     </td>
                  </tr>
               )}
            </>
         )}
      </Table>
   );

   const renderModal = useMemo(() => {
      if (!isOpenModal) return;
      switch (openModalTarget.current) {
         case "Add":
            return <AddProductModal openType="Add" curCategory={curCategory} setIsOpenModalParent={setIsOpenModal} />;
         case "Edit":
            return (
               <AddProductModal
                  openType="Edit"
                  curCategory={curCategory}
                  curProduct={curPro.current}
                  setIsOpenModalParent={setIsOpenModal}
               />
            );
         case "Delete":
            return (
               <ConfirmModal
                  label={`Delete '${curPro.current?.product_name}'`}
                  loading={apiLoading}
                  setOpenModal={setIsOpenModal}
                  callback={handleDeleteProduct}
               />
            );
         default:
            return <h1 className="text-2xl">Noting to show</h1>;
      }
   }, [isOpenModal]);

   useEffect(() => {
      dispatch(fetchProducts({ category_id: curCategory?.id || undefined, filters, page: 1, sort, admin: true }));

      return () => {
         dispatch(storingFilters());
      };
   }, [curCategory]);

   useEffect(() => {
      if (!categories.length) return;

      if (firstTimeRender.current) {
         firstTimeRender.current = false;
         setCurCategory(categories[0]);
      }
   }, []);

   const classes = {
      button: "border-b-[4px] py-[4px] px-[16px] hover:brightness-100",
      disableButton: "border-transparent text-[20px] hover:border-[#cd1818]",
      activeButton: "border-[#cd1818] text-[30px]",
   };

   if (status === "error") return <h1 className="text-2xl">Some thing went wrong</h1>;

   return (
      <>
         <div className="flex gap-[8px] mb-[10px]">
            <Button
               onClick={() => setCurCategory(undefined)}
               className={`${classes.button} ${
                  curCategory === undefined ? classes.activeButton : classes.disableButton
               }`}
            >
               All
            </Button>
            {categories.map((cat, index) => {
               const active = curCategory?.category_ascii === cat.category_ascii;
               return (
                  <Button
                     key={index}
                     onClick={() => setCurCategory(cat)}
                     className={`${classes.button} ${active ? classes.activeButton : classes.disableButton}`}
                  >
                     {cat.category_name}
                     {status === "successful" && active && " (" + count + ")"}
                  </Button>
               );
            })}
         </div>

         {curCategory && (
            <>
               <QuickFilter
                  curCategory={curCategory}
                  admin
                  loading={appConfigStatus === "loading"}
                  brands={brands[curCategory.category_ascii]}
               />
            </>
         )}

         <div className="flex justify-between mt-[10px]">
            <div className="flex">
               <Input placeholder="Product..." cb={(key) => console.log(key)} />
               <Button primary className="ml-[8px]">
                  Search
               </Button>
            </div>

            <Button onClick={() => handleOpenModal("Add")} primary>
               <i className="material-icons mr-[4px]">add</i>
               Add product
            </Button>
         </div>

         <div className="mt-[30px]">
            {renderProducts}
            {status === "loading" && <h1 className="text-3xl text-center">Loading...</h1>}
            {status !== "loading" && !!products.length && (
               <p className="text-center my-[15px]">
                  <Button
                     disable={remaining === 0 || status === "more-loading"}
                     primary
                     isLoading={status === "more-loading"}
                     onClick={() => handleGetMore()}
                  >
                     Xem thêm {remaining} sản phẩm
                  </Button>
               </p>
            )}
         </div>

         {isOpenModal && <Modal setShowModal={setIsOpenModal}>{renderModal}</Modal>}
      </>
   );
}
export default Dashboard;
