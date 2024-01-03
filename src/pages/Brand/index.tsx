import classNames from "classnames/bind";
import styles from "./Brand.module.scss";
import { useEffect, useMemo, useRef, useState } from "react";
import { Brand, Category, GetArrayType } from "@/types";
import { usePrivateRequest } from "@/hooks";
import { Modal, Empty } from "@/components";
import { inputClasses } from "@/components/ui/Input";
import { generateId } from "@/utils/appHelper";
import AddItemMulti from "@/components/Modal/AddItemMulti";
import { useToast } from "@/store/ToastContext";
import OverlayCTA from "@/components/ui/OverlayCTA";
import ConfirmModal from "@/components/Modal/Confirm";
import useBrandAction from "@/hooks/useBrand";
import EditBrand from "./child/EditBrand";
const cx = classNames.bind(styles);

const CAT_URL = "/app/categories";
const BRAND_URL = "/app/brands";
const CAT_FIELDS: ["Name", "Icon"] = ["Name", "Icon"];

type ModalTarget = "add-brand" | "add-category" | "edit-category" | "delete-category" | "delete-brand" | "edit-brand";

export default function CategoryBrand() {
   const [curCategoryId, setCurCategoryId] = useState(0);
   const [categories, setCategories] = useState<Category[]>([]);
   const [brands, setBrands] = useState<Brand[]>([]);
   const [isOpenModal, setIsOpenModal] = useState(false);

   const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

   const openModalTarget = useRef<ModalTarget | "">("");
   const ranUseEffect = useRef(false);
   const curCatIndex = useRef<number>(0);
   const curBrandIndex = useRef<number>();

   // hooks
   const { deleteBrand, deleteCategory, addCategory, addBrand, apiLoading } = useBrandAction({
      brands,
      setBrands,
      categories,
      setCategories,
      setIsOpenModal,
   });
   const privateRequest = usePrivateRequest();
   const { setErrorToast } = useToast();

   const handleOpenModal = (target: typeof openModalTarget.current, index?: number) => {
      openModalTarget.current = target;
      switch (target) {
         case "edit-category":
         case "delete-category":
            curCatIndex.current = index || 0;
            break;

         case "edit-brand":
         case "delete-brand":
            curBrandIndex.current = index || undefined;
            break;
      }
      setIsOpenModal(true);
   };

   const getFieldValue = (value: Record<string, string>, name: GetArrayType<typeof CAT_FIELDS>) => {
      return value[generateId(name)];
   };

   const handleAddCategory = async (value: Record<string, string>, type: "Add" | "Edit") => {
      if (!value[generateId("Name")].trim()) {
         setErrorToast();
         return;
      }

      const newCategory: Category = {
         category_name: getFieldValue(value, "Name"),
         category_ascii: generateId(getFieldValue(value, "Name")),
         icon: getFieldValue(value, "Icon"),
         id: type === "Add" ? undefined : (categories[curCatIndex.current].id as number),
      };

      await addCategory(newCategory, type, curCatIndex.current);
   };

   const handleDeleteCategory = async () => {
      await deleteCategory(categories[curCatIndex.current]);
   };

   const handleDeleteBrand = async () => {
      await deleteBrand(curBrandIndex.current);
   };

   const renderModal = useMemo(() => {
      if (!isOpenModal) return;
      switch (openModalTarget.current) {
         case "add-brand":
            return (
               <EditBrand
                  type={"Add"}
                  addBrand={addBrand}
                  apiLoading={apiLoading}
                  setIsOpenModalParent={setIsOpenModal}
                  catId={curCategoryId}
               />
            );
         case "add-category":
            return (
               <AddItemMulti
                  fields={CAT_FIELDS}
                  title="Add category"
                  cb={(value) => handleAddCategory(value, "Add")}
                  setIsOpenModal={setIsOpenModal}
               />
            );
         case "edit-brand":
            if (!curBrandIndex.current) return "Index not found";
            return (
               <EditBrand
                  type={"Edit"}
                  addBrand={addBrand}
                  apiLoading={apiLoading}
                  setIsOpenModalParent={setIsOpenModal}
                  curBrand={{ ...brands[curBrandIndex.current], curIndex: curBrandIndex.current }}
                  catId={curCategoryId}
               />
            );

         case "edit-category":
            return (
               <AddItemMulti
                  fields={CAT_FIELDS}
                  title="Edit category"
                  cb={(value) => handleAddCategory(value, "Edit")}
                  setIsOpenModal={setIsOpenModal}
                  intiFieldData={{
                     name: categories[curCatIndex.current].category_name,
                     icon: categories[curCatIndex.current].icon,
                  }}
               />
            );
         case "delete-category":
            return (
               <ConfirmModal
                  callback={handleDeleteCategory}
                  loading={apiLoading}
                  setOpenModal={setIsOpenModal}
                  label={`Delete category '${categories[curCatIndex.current].category_name}'`}
               />
            );
         case "delete-brand":
            if (!curBrandIndex.current) return "Index not found";

            return (
               <ConfirmModal
                  callback={handleDeleteBrand}
                  loading={apiLoading}
                  setOpenModal={setIsOpenModal}
                  label={`Delete brand '${brands[curBrandIndex.current].brand_name}'`}
               />
            );

         default:
            return <h1 className="text-3xl">Not thing to show</h1>;
      }
   }, [isOpenModal]);

   useEffect(() => {
      const getConfig = async () => {
         try {
            const categoriesRes = await privateRequest.get(CAT_URL);
            const categories = categoriesRes.data as Category[];

            if (categories.length > 0) {
               setCategories(categoriesRes.data || []);
               setCurCategoryId(categories[0].id || 0);
            }
            setStatus("success");
         } catch (error) {
            console.log({ message: error });
            setStatus("error");
         }
      };

      if (!ranUseEffect.current) {
         ranUseEffect.current = true;
         getConfig();
      }
   }, []);

   useEffect(() => {
      const getBrands = async () => {
         try {
            const brandsRes = await privateRequest.get(BRAND_URL + "?category_id=" + curCategoryId);
            const brandsData = brandsRes.data as Brand[];

            setBrands(brandsData);
         } catch (error) {
            console.log({ message: error });
         }
      };

      if (curCategoryId) {
         getBrands();
      }
   }, [curCategoryId]);

   if (status === "loading") return <h2>Loading...</h2>;

   if (status === "error") return <h1>Some thing went wrong</h1>;

   console.log("check brands", brands);

   return (
      <div className="pb-[30px]">
         <h1 className={cx("page-title")}>Category</h1>

         <div className={`row bg-white p-[20px] rounded-[8px] mb-[30px] ${apiLoading && "disable"}`}>
            {categories.map((item, index) => (
               <div key={index} className="col w-2/12">
                  <Empty className="group">
                     <span className="text-[16px] font-semibold">{item.category_name}</span>
                     <OverlayCTA
                        data={[
                           {
                              cb: () => handleOpenModal("delete-category", index),
                              icon: "delete",
                           },
                           {
                              cb: () => handleOpenModal("edit-category", index),
                              icon: "edit",
                           },
                        ]}
                     />
                  </Empty>
               </div>
            ))}
            <div className="col w-2/12">
               <Empty onClick={() => handleOpenModal("add-category")} />
            </div>
         </div>

         {/* <div className={cx("divide")}></div> */}

         <h1 className={cx("page-title")}>Brand</h1>
         {status === "success" && curCategoryId && (
            <div className="bg-[#fff]  rounded-[8px] p-[20px]">
               <div className="mb-[15px] flex items-center">
                  <p className={cx("input-label", "mr-[10px]")}>Category: </p>
                  <select
                     className={inputClasses.input}
                     name="category"
                     value={curCategoryId}
                     onChange={(e) => setCurCategoryId(+e.target.value)}
                  >
                     {!!categories.length &&
                        categories.map((category, index) => (
                           <option key={index} value={category.id}>
                              {category.category_name}
                           </option>
                        ))}
                  </select>
               </div>
               <div className={`row  ${apiLoading && "disable"}`}>
                  <div className="col col-9">
                     <div className="row">
                        {status === "success" &&
                           !!brands.length &&
                           brands.map((brand, index) => (
                              <div key={index} className="col col-2">
                                 <Empty>
                                    <div className="">
                                       <p className="text-[14px] text-center">{brand.brand_name}</p>
                                       <img src={brand.image_url} alt="" />
                                    </div>
                                    <OverlayCTA
                                       data={[
                                          {
                                             cb: () => handleOpenModal("delete-brand", index),
                                             icon: "delete",
                                          },
                                          {
                                             cb: () => handleOpenModal("edit-brand", index),
                                             icon: "edit",
                                          },
                                       ]}
                                    />
                                 </Empty>
                              </div>
                           ))}

                        <div className="col col-2">
                           <Empty onClick={() => handleOpenModal("add-brand")} />
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {isOpenModal && <Modal setShowModal={setIsOpenModal}>{renderModal}</Modal>}
      </div>
   );
}
