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
import useAppConfig from "@/hooks/useAppConfig";
import { useApp } from "@/store/AppContext";
const cx = classNames.bind(styles);

const CAT_URL = "/app/categories";
const BRAND_URL = "/app/brands";
const CAT_FIELDS: ["Name", "Icon"] = ["Name", "Icon"];

type ModalTarget = "add-brand" | "add-category" | "edit-category" | "delete-category" | "delete-brand" | "edit-brand";

export default function CategoryBrand() {
   // const [curCategoryId, setCurCategoryId] = useState<number | undefined>();
   const [curCategory, setCurCategory] = useState<Category | undefined>();
   // const [categories, setCategories] = useState<Category[]>([]);
   // const [brands, setBrands] = useState<Brand[]>([]);
   const [isOpenModal, setIsOpenModal] = useState(false);

   // const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

   const openModalTarget = useRef<ModalTarget | "">("");
   const ranUseEffect = useRef(false);
   const curCatIndex = useRef<number>();
   const curBrandIndex = useRef<number>();

   // hooks
   const { categories, initLoading } = useApp();
   const { status: appConfigStatus, curBrands } = useAppConfig({ curCategory: curCategory, autoRun: true });
   const { deleteBrand, deleteCategory, addCategory, addBrand, apiLoading } = useBrandAction({
      setIsOpenModal,
      curCategory,
      curBrands,
   });
   // const privateRequest = usePrivateRequest();
   const { setErrorToast } = useToast();

   const handleOpenModal = (target: typeof openModalTarget.current, index?: number) => {
      openModalTarget.current = target;
      if (target === "add-brand" && curCatIndex === undefined) return;
      switch (target) {
         case "edit-category":
         case "delete-category":
            curCatIndex.current = index ?? undefined;
            break;

         case "edit-brand":
         case "delete-brand":
            curBrandIndex.current = index ?? undefined;
            break;
      }
      setIsOpenModal(true);
   };

   const getFieldValue = (value: Record<string, string>, name: GetArrayType<typeof CAT_FIELDS> | "default") => {
      return value[generateId(name)];
   };

   const handleAddCategory = async (value: Record<string, string>, type: "Add" | "Edit") => {
      if (!value[generateId("Name")].trim()) {
         setErrorToast("Must have category name");
         return;
      }

      const newCategory: Category = {
         category_name: getFieldValue(value, "Name"),
         category_ascii: generateId(getFieldValue(value, "Name")),
         icon: getFieldValue(value, "Icon"),
         id: undefined,
         default: !!getFieldValue(value, "default"),
      };

      if (type === "Edit") {
         if (curCatIndex.current === undefined) {
            setErrorToast("Current index not found");
            return;
         }
         newCategory.id = categories[curCatIndex.current].id;
      }

      await addCategory(newCategory, type, curCatIndex.current);
   };

   const handleDeleteCategory = async () => {
      if (curCatIndex.current === undefined) return setErrorToast();
      await deleteCategory(categories[curCatIndex.current]);
   };

   const handleDeleteBrand = async () => {
      await deleteBrand(curBrandIndex.current);
   };

   const renderModal = useMemo(() => {
      if (!isOpenModal) return;
      switch (openModalTarget.current) {
         case "add-brand":
            if (curCategory?.id === undefined) return <h1 className="text-[18px]">Category not define</h1>;
            console.log(curCategory);

            return (
               <EditBrand
                  type={"Add"}
                  addBrand={addBrand}
                  apiLoading={apiLoading}
                  setIsOpenModalParent={setIsOpenModal}
                  catId={curCategory.id}
               />
            );
         case "add-category":
            return (
               <AddItemMulti
                  loading={apiLoading}
                  fields={CAT_FIELDS}
                  title="Add category"
                  cb={(value) => handleAddCategory(value, "Add")}
                  setIsOpenModal={setIsOpenModal}
               />
            );
         case "edit-brand":
            if (curBrandIndex.current === undefined || curBrands === undefined || curCategory?.id === undefined)
               return "Index not found";
            return (
               <EditBrand
                  type={"Edit"}
                  addBrand={addBrand}
                  apiLoading={apiLoading}
                  setIsOpenModalParent={setIsOpenModal}
                  curBrand={{ ...curBrands[curBrandIndex.current], curIndex: curBrandIndex.current }}
                  catId={curCategory?.id}
               />
            );

         case "edit-category":
            if (curCatIndex.current === undefined) return "Index not found";
            return (
               <AddItemMulti
                  loading={apiLoading}
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
            if (curCatIndex.current === undefined) return "Index not found";

            return (
               <ConfirmModal
                  callback={handleDeleteCategory}
                  loading={apiLoading}
                  setOpenModal={setIsOpenModal}
                  label={`Delete category '${categories[curCatIndex.current].category_name}'`}
               />
            );
         case "delete-brand":
            if (curBrandIndex.current === undefined || curBrands === undefined) return "Index not found";

            return (
               <ConfirmModal
                  callback={handleDeleteBrand}
                  loading={apiLoading}
                  setOpenModal={setIsOpenModal}
                  label={`Delete brand '${curBrands[curBrandIndex.current].brand_name}'`}
               />
            );

         default:
            return <h1 className="text-3xl">Not thing to show</h1>;
      }
   }, [isOpenModal, apiLoading]);

   const content = (
      <>
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

         <h1 className={cx("page-title")}>Brand</h1>

         <div className="bg-[#fff]  rounded-[8px] p-[20px]">
            <div className="mb-[15px] flex items-center">
               <p className={cx("input-label", "mr-[10px]")}>Category: </p>
               <select
                  disabled={!categories.length}
                  className={`${inputClasses.input} min-w-[100px]`}
                  name="category"
                  onChange={(e) => setCurCategory(categories[+e.target.value as number])}
               >
                  <option value={undefined}>---</option>
                  {!!categories.length &&
                     categories.map((category, index) => (
                        <option key={index} value={index}>
                           {category.category_name}
                        </option>
                     ))}
               </select>
            </div>
            <div className={`row  ${appConfigStatus === "loading" || apiLoading ? "disable" : ""}`}>
               {curBrands &&
                  curBrands.map((brand, index) => (
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
      </>
   );

   // useEffect(() => {
   //    if (initLoading) return;

   //    if (!ranUseEffect.current) {
   //       if (appConfigStatus === "success") {
   //          ranUseEffect.current = true;
   //          console.log("check cat", categories);

   //          const homeCat = categories.find((c) => c.category_ascii === "home");
   //          console.log("check home", homeCat, categories, appConfigStatus);
   //          if (!homeCat) handleAddCategory({ name: "Home", default: "saljfksjd" }, "Add");
   //          else console.log("already added home category");
   //       }
   //    }
   // }, [initLoading, appConfigStatus]);

   return (
      <div className="pb-[30px]">
         <h1 className={cx("page-title")}>Category</h1>

         {initLoading && <i className="material-icons animate-spin">sync</i>}

         {!initLoading && content}

         {appConfigStatus === "error" && <h1 className="text-[18px]">Some thing went wrong</h1>}

         {isOpenModal && <Modal setShowModal={setIsOpenModal}>{renderModal}</Modal>}
      </div>
   );
}
