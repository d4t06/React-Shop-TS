import { Brand, Category } from "@/types";
import { Dispatch, SetStateAction, useState } from "react";
import { usePrivateRequest } from ".";
import { useToast } from "@/store/ToastContext";

type Props = {
   setBrands: Dispatch<SetStateAction<Brand[]>>;
   setCategories: Dispatch<SetStateAction<Category[]>>;
   setIsOpenModal: Dispatch<SetStateAction<boolean>>;
   categories: Category[];
   brands: Brand[];
};

const CAT_URL = "/app/categories";
const BRAND_URL = "/app/brands";

export default function useBrandAction({ brands, categories, setBrands, setCategories, setIsOpenModal }: Props) {
   const [apiLoading, setApiLoading] = useState(false);

   const privateRequest = usePrivateRequest();
   const { setSuccessToast, setErrorToast } = useToast();

   const deleteCategory = async (category?: Category) => {
      try {
         if (category === undefined) throw new Error("no have id");
         setApiLoading(true);

         await privateRequest.delete(`${CAT_URL}/${category.id}`);

         const newCategories = categories.filter((c) => c.id !== category.id);
         setCategories(newCategories);

         setSuccessToast(`Delete category '${category.category_name}' successful`);
      } catch (error) {
         console.log({ message: error });
         setSuccessToast(`Delete category fail`);
      } finally {
         setApiLoading(false);
         setIsOpenModal(false);
      }
   };

   const addCategory = async (category: Category, type: "Add" | "Edit", curIndex?: number) => {
      try {
         switch (type) {
            case "Add":
               setApiLoading(true);
               const catRes = await privateRequest.post(CAT_URL, category);

               const newCategoryData = catRes.data;
               setCategories((prev) => [...prev, newCategoryData]);
               break;
            case "Edit":
               if (curIndex === undefined || !!category.id) throw new Error("missing current index");
               setApiLoading(true);

               await privateRequest.put(`${CAT_URL}/${category.id}`, category);

               const newCategories = [...categories];
               newCategories[curIndex] = category;
               setCategories(newCategories);
         }
         setSuccessToast(`${type} category successful`);
      } catch (error) {
         console.log({ message: error });
         setErrorToast(`${type} category fail`);
      } finally {
         setApiLoading(false);
         setIsOpenModal(false);
      }
   };

   const addBrand = async (brand: Brand, type: "Add" | "Edit", curIndex?: number) => {
      try {
         switch (type) {
            case "Add":
               setApiLoading(true);

               const brandRes = await privateRequest.post(BRAND_URL, brand);

               const newBrandData = brandRes.data.data as Brand;
               setBrands((prev) => [...prev, newBrandData]);
               break;

            case "Edit":
               if (curIndex === undefined || !brand.id) throw new Error("missing current index");
               setApiLoading(true);

               await privateRequest.put(`${BRAND_URL}/${brand.id}`, brand);

               const newBrands = [...brands];
               newBrands[curIndex] = brand;
               setBrands(newBrands);
         }
         setSuccessToast(`${type} brand successful`);
      } catch (error) {
         console.log({ message: error });
         setErrorToast(`${type} brand fail`);
      } finally {
         setApiLoading(false);
         setIsOpenModal(false);
      }
   };

   const deleteBrand = async (curIndex?: number) => {
      try {
         if (curIndex === undefined) throw new Error("no have id");
         const targetBrand = brands[curIndex];

         setApiLoading(true);
         await privateRequest.delete(`${BRAND_URL}/${targetBrand.id}`);

         const newBrands = brands.filter((b) => b.id !== targetBrand.id);
         setBrands(newBrands);
         setSuccessToast(`Delete brand '${targetBrand.brand_name}' successful`);
      } catch (error) {
         console.log({ message: error });
         setSuccessToast(`Delete brand fail`);
      } finally {
         setApiLoading(false);
         setIsOpenModal(false);
      }
   };

   return { deleteBrand, deleteCategory, addCategory, addBrand, apiLoading };
}
