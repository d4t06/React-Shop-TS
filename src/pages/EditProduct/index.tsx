import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import classNames from "classnames/bind";
import styles from "../Login/Login.module.scss";

import { generateId, initColorObject, initStorageObject, moneyFormat, sleep } from "@/utils/appHelper";
import usePrivateRequest from "@/hooks/usePrivateRequest";
import ProductConfig, { ConfigRef } from "@/components/ProductConfig";
import { Product, ProductColor, ProductCombine, ProductCombineSchema, ProductStorage } from "@/types";
import Empty from "@/components/ui/Empty";
import { Button, Modal } from "@/components";
import ProductDataProvider from "@/store/ProductDataContext";
import {
   findMinCombineOfStorage,
   initCombinesForInsert,
   initProductSlidersForInsert,
   trackingColors,
   trackingStorages,
} from "@/utils/productHelper";
import { useToast } from "@/store/ToastContext";
import AddItem from "@/components/Modal/AddItem";
import OverlayCTA from "@/components/ui/OverlayCTA";
import useVariantAction from "@/hooks/useVariantAction";
import ConfirmModal from "@/components/Modal/Confirm";

type ModelTarget = "add-storage" | "edit-storage" | "add-color" | "edit-color" | "delete-storage" | "delete-color";

const cx = classNames.bind(styles);
const MAX_VAL = 999999999;
const STORAGE_URL = "/storage-management/storages";
// const COLOR_URL = "/color-management/colors";
const PRODUCT_SLIDER_URL = "/product-slider-management/product-sliders";
const COMBINE_URL = "/combine-management/combines";
const PRODUCT_URL = "/product-management/products";

function EditProduct() {
   const [productData, setProductData] = useState<Product>();

   const [storages, setStorages] = useState<ProductStorage[]>([]);
   const [colors, setColors] = useState<ProductColor[]>([]);
   const [isOpenModal, setIsOpenModal] = useState(false);
   const addItemModalTarget = useRef<ModelTarget | "">("");

   const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

   const ranUseEffect = useRef(false);
   const ProductConfigRef = useRef<ConfigRef>(null);
   const curColorIndex = useRef<number | undefined>();
   const curStorageIndex = useRef<number | undefined>();

   // use hook
   const { id } = useParams();
   const { setSuccessToast, setErrorToast } = useToast();
   const privateRequest = usePrivateRequest();
   const { addColor, addStorage, apiLoading, deleteColor, deleteStorage } = useVariantAction({
      colors,
      setColors,
      setStorages,
      setIsOpenModal,
      storages,
   });

   const handleOpenModal = (type: typeof addItemModalTarget.current, curIndex?: number) => {
      addItemModalTarget.current = type;
      switch (type) {
         case "add-color":
         case "edit-color":
         case "delete-color":
            curColorIndex.current = curIndex;
            break;

         case "add-storage":
         case "edit-storage":
         case "delete-storage":
            curStorageIndex.current = curIndex;
            break;
      }
      setIsOpenModal(true);
   };

   const handleAddColor = async (type: "Add" | "Edit", value: string, id?: number) => {
      const newColor = initColorObject({
         color: value,
         color_ascii: generateId(value),
         product_name_ascii: productData?.product_name_ascii,
      });

      await addColor(newColor, type, curColorIndex.current, id);
   };

   const handleAddStorage = async (type: "Add" | "Edit", value: string, id?: number) => {
      const newStorage = initStorageObject({
         storage: value,
         storage_ascii: generateId(value),
         product_name_ascii: productData?.product_name_ascii,
      });

      await addStorage(newStorage, type, curStorageIndex.current, id);
   };

   const handleDeleteColor = async () => {
      await deleteColor(curColorIndex.current);
   };

   const handleDeleteStorage = async () => {
      await deleteStorage(curStorageIndex.current);
   };

   const initStockProductData = (
      type: "color" | "storage",
      storagesData: ProductStorage[],
      colorsData: ProductColor[]
   ) => {
      switch (type) {
         case "storage":
            setStorages(storagesData);
            break;
         case "color":
            setColors(colorsData);
      }
   };

   // const submitStorage = async (newStorages: ProductStorage[], removeStorages: ProductStorage[]) => {
   //    const removedStoragesAscii: string[] = [];
   //    let storagesRes: ProductStorage[] = [];

   //    if (removeStorages.length) {
   //       for await (const item of removeStorages) {
   //          removedStoragesAscii.push(item.storage_ascii);
   //          await privateRequest.delete(`${STORAGE_URL}/${item.id}`);
   //       }
   //    }

   //    if (newStorages.length) {
   //       const res = await privateRequest.post(STORAGE_URL, newStorages, {
   //          headers: { "Content-Type": "application/json" },
   //       });
   //       storagesRes = res.data;
   //    }

   //    return { removedStoragesAscii, storagesRes };
   // };
   const submitSlider = async () => {
      // >>> tracking and submit slider and slider images
      const newSlidersSchema = await ProductConfigRef.current!.submitSliders();

      if (colors.length) {
         // >>> api add new products sliders
         if (newSlidersSchema.length) {
            const data = initProductSlidersForInsert(
               newSlidersSchema,
               colors,
               productData?.product_name_ascii as string
            );
            if (!data.length) {
               throw new Error("product slider error");
            }
            await privateRequest.post(PRODUCT_SLIDER_URL, data, {
               headers: { "Content-Type": "application/json" },
            });
         }
      }
   };

   const submitCombines = async (newCombines: ProductCombine[], updateCombines: ProductCombine[]) => {
      let newCombinesRes: ProductCombine[] = [];

      if (newCombines.length) {
         const storageIdObject: Record<string, number> = {};
         storages.forEach((item) => {
            storageIdObject[item.storage_ascii] = item.id as number;
         });

         const colorIdObject: Record<string, number> = {};
         [...colors].forEach((item) => (colorIdObject[item.color_ascii] = item.id as number));

         const combinesSchema = initCombinesForInsert(newCombines, colorIdObject, storageIdObject);

         const res = await privateRequest.post(COMBINE_URL, combinesSchema, {
            headers: { "Content-Type": "application/json" },
         });
         const data = res.data as ProductCombine[];

         newCombinesRes = data;
      }

      if (updateCombines.length) {
         const combinesSchema = updateCombines.map((cb) => {
            let combineSchema: ProductCombineSchema & { id: number };
            const { color_data, storage_data, ...schema } = cb;
            combineSchema = schema as ProductCombineSchema & { id: number };
            return combineSchema;
         });

         // >>> api update combine
         for await (const item of combinesSchema) {
            await privateRequest.put(`${COMBINE_URL}/${item.id}`, item, {
               headers: { "Content-Type": "application/json" },
            });
         }
      }

      return newCombinesRes;
   };

   const updateStorageBasePrice = async (mergedCombines: ProductCombine[]) => {
      let minCB: ProductCombine | undefined;
      let prevDefaultCb: ProductCombine | undefined;
      let minPriceOfProduct = MAX_VAL;

      for await (const storageItem of storages) {
         // loop not removed storage items
         if (storageItem.id === undefined) {
            console.log("no found storage id");
            break;
         }

         const { cb, minPrice, defaultCB } = findMinCombineOfStorage(storageItem, mergedCombines);

         console.log("check minPrice", minPrice, ",min cb", cb?.id, "default", defaultCB?.id);

         if (defaultCB) prevDefaultCb = defaultCB;
         if (minPriceOfProduct > minPrice) {
            minPriceOfProduct = minPrice;
            minCB = cb;
         }

         // when init, record.base_price = 0
         if (!storageItem.base_price || storageItem.base_price !== minPrice) {
            // assign base price
            storageItem.base_price = minPrice;
            // >>> api update storage
            await privateRequest.put(`${STORAGE_URL}/${storageItem.id}`, storageItem, {
               headers: { "Content-Type": "application/json" },
            });
         }
      }

      return { minCB, prevDefaultCb };
   };

   const updateDefaultCombine = async (minCB: ProductCombine, prevDefaultCb: ProductCombine | undefined) => {
      const updateNewDefaultCB = async () => {
         privateRequest.put(
            `${COMBINE_URL}/${minCB!.id}`,
            { default: true },
            {
               headers: { "Content-Type": "application/json" },
            }
         );
      };

      if (!productData?.combines_data.length) {
         await updateNewDefaultCB();
      } else {
         if (!prevDefaultCb || !prevDefaultCb?.id) throw new Error("Update default error");

         if (prevDefaultCb.id !== minCB.id) {
            await privateRequest.put(
               `${COMBINE_URL}/${prevDefaultCb.id}`,
               { default: false },
               { headers: { "Content-Type": "application/json" } }
            );

            await updateNewDefaultCB();
         }
      }
   };

   const handleSubmit = async () => {
      try {
         if (!productData || !productData.product_name_ascii) return;

         ProductConfigRef.current?.validate();

         // const { newStorages, removedStorages } = trackingStorages(stockStorages.current, storages);
         // const { newColors, removedColorIds } = trackingColors(stockColors.current, colors);

         // >>> submit storage
         // const { storagesRes, removedStoragesAscii } = await submitStorage();
         // >>> submit color and slider
         await submitSlider();

         const { newCombines, updateCombines } = ProductConfigRef.current!.trackingCombine();

         // >>> submit combine
         const newCombinesRes = await submitCombines(newCombines, updateCombines);

         const isUpdateOrAddNewCombine = !!newCombines.length || !!updateCombines.length;
         if (isUpdateOrAddNewCombine) {
            const combinesObject: Record<number, ProductCombine> = {};
            [...productData.combines_data, ...newCombinesRes, ...updateCombines].map((cb) => {
               if (!cb.id) return;
               combinesObject[cb.id] = cb;
            });
            const mergedCombines = Object.entries(combinesObject).map(([_key, cb]) => cb);
            // >>> submit update storage base_price
            const { minCB, prevDefaultCb } = await updateStorageBasePrice(mergedCombines);

            if (!minCB) throw new Error("Min cb error");
            // >>> submit update default combine
            await updateDefaultCombine(minCB, prevDefaultCb);
         }

         setSuccessToast("Edit product successful");
      } catch (error) {
         console.log({ message: error });
         setErrorToast("Error when edit product");
      }
   };

   const renderModal = useMemo(() => {
      if (!isOpenModal) return;

      switch (addItemModalTarget.current) {
         case "add-color":
            return (
               <AddItem
                  loading={apiLoading}
                  title={"Add color"}
                  cbWhenSubmit={(value) => handleAddColor("Add", value)}
                  setIsOpenModal={setIsOpenModal}
               />
            );
         case "edit-color":
            if (curColorIndex.current !== undefined) {
               const currentColor = colors[curColorIndex.current];
               return (
                  <AddItem
                     loading={apiLoading}
                     title={"Edit color"}
                     cbWhenSubmit={(value) => handleAddColor("Edit", value, currentColor.id)}
                     setIsOpenModal={setIsOpenModal}
                     initValue={currentColor.color}
                  />
               );
            }
            return <h1 className="text-2xl">Cur index not found</h1>;
         case "add-storage":
            return (
               <AddItem
                  loading={apiLoading}
                  title={"Add storage"}
                  cbWhenSubmit={(value) => handleAddStorage("Add", value)}
                  setIsOpenModal={setIsOpenModal}
               />
            );
         case "edit-storage":
            if (curStorageIndex.current !== undefined) {
               const curStorage = storages[curStorageIndex.current];
               return (
                  <AddItem
                     loading={apiLoading}
                     title={"Edit storage"}
                     cbWhenSubmit={(value) => handleAddStorage("Edit", value, curStorage.id)}
                     setIsOpenModal={setIsOpenModal}
                     initValue={curStorage.storage}
                  />
               );
            }
            break;
         case "delete-color":
            if (curColorIndex.current === undefined) return <h1 className="text-2xl">Cur index not found</h1>;
            return (
               <ConfirmModal
                  label={`Delete color '${colors[curColorIndex.current].color} ?'`}
                  loading={apiLoading}
                  callback={handleDeleteColor}
                  setOpenModal={setIsOpenModal}
               />
            );
         case "delete-storage":
            if (curStorageIndex.current === undefined) return <h1 className="text-2xl">Cur index not found</h1>;
            return (
               <ConfirmModal
                  label={`Delete storage '${storages[curStorageIndex.current].storage} ?'`}
                  loading={apiLoading}
                  callback={handleDeleteStorage}
                  setOpenModal={setIsOpenModal}
               />
            );
      }
   }, [isOpenModal, apiLoading]);

   useEffect(() => {
      const getProductDetail = async () => {
         try {
            if (!id) throw new Error("missing params");
            if (import.meta.env.DEV) await sleep(300);

            const res = await privateRequest.get(`${PRODUCT_URL}/${id}`);
            const data = res.data as Product;

            setProductData(data);
            const storagesData = data.storages_data as ProductStorage[];
            const colorsData = data.colors_data as ProductColor[];
            if (storagesData.length) {
               initStockProductData("storage", storagesData, []);
            }

            if (colorsData.length) {
               initStockProductData("color", [], colorsData);
            }

            if (import.meta.env.DEV) {
               await sleep(300);
            }

            setStatus("success");
         } catch (error) {
            setStatus("error");
         }
      };

      if (!ranUseEffect.current) {
         getProductDetail();
         ranUseEffect.current = true;
      }
   }, []);

   if (status === "loading") return <i className="material-icons animate-spin">sync</i>;
   if ((!productData && status === "success") || status === "error") return <h1>Some thing went wrong</h1>;

   return (
      <>
         <h1 className="text-[30px] font-[900] mb-[30px]">{productData?.product_name}</h1>

         <div className="pb-[30px]">
            <div className="row mb-[30px]">
               <div className="col col-6 ">
                  <h5 className={cx("label")}>Storage</h5>
                  <div className="flex bg-[#fff] rounded-[8px] p-[20px]">
                     {!!storages.length &&
                        storages.map((item, index) => {
                           return (
                              <div key={index} className="col col-3">
                                 <Empty className="group">
                                    <span className="text-center font-semibold text-[16px]">{item.storage}</span>
                                    <OverlayCTA
                                       data={[
                                          { cb: () => handleOpenModal("edit-storage", index), icon: "edit" },
                                          { cb: () => handleOpenModal("delete-storage", index), icon: "delete" },
                                       ]}
                                    />
                                 </Empty>
                              </div>
                           );
                        })}
                     <div className="col col-3">
                        <Empty onClick={() => handleOpenModal("add-storage")} />
                     </div>
                  </div>
               </div>
               <div className="col col-6">
                  <h5 className={cx("label")}>Color</h5>
                  <div className="row bg-[#fff] rounded-[8px] p-[20px]">
                     {!!colors.length &&
                        colors.map((item, index) => (
                           <div key={index} className="col col-3">
                              <Empty>
                                 <span className="font-semibold text-[16px]">{item.color}</span>
                                 <OverlayCTA
                                    data={[
                                       { cb: () => handleOpenModal("edit-color", index), icon: "edit" },
                                       { cb: () => handleOpenModal("delete-color", index), icon: "delete" },
                                    ]}
                                 />
                              </Empty>
                           </div>
                        ))}
                     <div className="col col-3">
                        <Empty onClick={() => handleOpenModal("add-color")} />
                     </div>
                  </div>
               </div>
            </div>

            {productData && (
               <ProductDataProvider initialState={productData}>
                  <ProductConfig
                     ref={ProductConfigRef}
                     sliders={productData.sliders_data}
                     colors={colors}
                     storages={storages}
                  />
               </ProductDataProvider>
            )}

            <p className="text-center">
               <Button onClick={handleSubmit} primary className={cx("mt-15")}>
                  <i className="material-icons">save</i> Save
               </Button>
            </p>
         </div>

         {isOpenModal && <Modal setShowModal={setIsOpenModal}>{renderModal}</Modal>}
      </>
   );
}

export default EditProduct;
