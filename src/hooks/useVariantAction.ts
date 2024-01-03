import { ProductColor, ProductStorage } from "@/types";
import { Dispatch, SetStateAction, useState } from "react";
import { usePrivateRequest } from ".";
import { useToast } from "@/store/ToastContext";
import { sleep } from "@/utils/appHelper";

type Props = {
   setColors: Dispatch<SetStateAction<ProductColor[]>>;
   setStorages: Dispatch<SetStateAction<ProductStorage[]>>;
   setIsOpenModal: Dispatch<SetStateAction<boolean>>;
   storages: ProductStorage[];
   colors: ProductColor[];
};
const STORAGE_URL = "/storage-management/storages";
const COLOR_URL = "/color-management/colors";

export default function useVariantAction({ colors, setColors, setIsOpenModal, setStorages, storages }: Props) {
   const [apiLoading, setApiLoading] = useState(false);

   const privateRequest = usePrivateRequest();
   const { setSuccessToast, setErrorToast } = useToast();

   const deleteStorage = async (curIndex?: number) => {
      try {
         if (curIndex === undefined) throw new Error("no have id");
         const curStorage = storages[curIndex];
         setApiLoading(true);

         if (import.meta.env.DEV) await sleep(300);
         await privateRequest.delete(`${STORAGE_URL}/${curStorage.id}`);

         const newStorages = storages.filter((c) => c.id !== curStorage.id);
         setStorages(newStorages);

         setSuccessToast(`Delete storage '${curStorage.storage}' successful`);
      } catch (error) {
         console.log({ message: error });
         setSuccessToast(`Delete storage fail`);
      } finally {
         setApiLoading(false);
         setIsOpenModal(false);
      }
   };

   const addStorage = async (storage: ProductStorage, type: "Add" | "Edit", curIndex?: number, id?: number) => {
      try {
         switch (type) {
            case "Add":
               setApiLoading(true);
               if (import.meta.env.DEV) await sleep(300);
               const res = await privateRequest.post(STORAGE_URL, storage);

               const newStorageData = res.data;
               setStorages((prev) => [...prev, newStorageData]);
               break;
            case "Edit":
               if (curIndex === undefined || id === undefined) throw new Error("missing current index");
               setApiLoading(true);

               if (import.meta.env.DEV) await sleep(300);
               await privateRequest.put(`${STORAGE_URL}/${id}`, storage);

               const newStorages = [...storages];
               newStorages[curIndex] = storage;
               setStorages(newStorages);
         }
         setSuccessToast(`${type} storage successful`);
      } catch (error) {
         console.log({ message: error });
         setErrorToast(`${type} storage fail`);
      } finally {
         setApiLoading(false);
         setIsOpenModal(false);
      }
   };

   const addColor = async (color: ProductColor, type: "Add" | "Edit", curIndex?: number, id?: number) => {
      try {
         switch (type) {
            case "Add":
               setApiLoading(true);

               if (import.meta.env.DEV) await sleep(300);
               const res = await privateRequest.post(COLOR_URL, color);

               const newColorData = res.data as ProductColor;
               setColors((prev) => [...prev, newColorData]);
               break;

            case "Edit":
               if (curIndex === undefined || id === undefined) throw new Error("missing current index");
               setApiLoading(true);

               if (import.meta.env.DEV) await sleep(300);
               await privateRequest.put(`${COLOR_URL}/${id}`, color);

               const newColors = [...colors];
               newColors[curIndex] = color;
               setColors(newColors);
         }
         setSuccessToast(`${type} Color successful`);
      } catch (error) {
         console.log({ message: error });
         setErrorToast(`${type} Color fail`);
      } finally {
         setApiLoading(false);
         setIsOpenModal(false);
      }
   };

   const deleteColor = async (curIndex?: number) => {
      try {
         if (curIndex === undefined) throw new Error("no have id");
         const targetColor = colors[curIndex];

         setApiLoading(true);
         if (import.meta.env.DEV) await sleep(300);
         await privateRequest.delete(`${COLOR_URL}/${targetColor.id}`);

         const newColors = colors.filter((c) => c.id !== targetColor.id);
         setColors(newColors);
         setSuccessToast(`Delete Color '${targetColor.color}' successful`);
      } catch (error) {
         console.log({ message: error });
         setSuccessToast(`Delete Color fail`);
      } finally {
         setApiLoading(false);
         setIsOpenModal(false);
      }
   };

   return { deleteColor, deleteStorage, addStorage, addColor, apiLoading };
}
