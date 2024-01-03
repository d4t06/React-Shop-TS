import { Button, Gallery, Modal } from "@/components";
import AddItem from "@/components/Modal/AddItem";
import AddItemMulti from "@/components/Modal/AddItemMulti";
import { Brand } from "@/types";
import { generateId, initBrandObject } from "@/utils/appHelper";
import { Dispatch, SetStateAction, useState } from "react";

import styles from "../Brand.module.scss";
import classNames from "classnames/bind";

const cx = classNames.bind(styles);

type OpenType = "Add" | "Edit";

type Props = {
   setIsOpenModalParent: Dispatch<SetStateAction<boolean>>;
   apiLoading: boolean;
   addBrand: (brand: Brand, type: OpenType, curIndex?: number) => Promise<void>;
   type: OpenType;
   curBrand?: Brand & { curIndex: number };
   catId: number;
};
export default function EditBrand({ setIsOpenModalParent, addBrand, apiLoading, type, curBrand, catId }: Props) {
   const [brandData, setBrandData] = useState<Brand>(curBrand || initBrandObject({}));
   const [isOpenModal, setIsOpenModal] = useState(false);

   const handleChoseBrandImage = (image_url: string) => {
      const newBrandData: Brand = { ...brandData, image_url };
      setBrandData(newBrandData);
   };

   const handleAddBrand = async (value: string, type: "Add" | "Edit", curCategoryId: number) => {
      const newBrandData: Brand = {
         ...brandData,
         brand_name: value,
         brand_ascii: generateId(value),
         category_id: curCategoryId,
      };
      await addBrand(newBrandData, type, curBrand?.curIndex);
   };

   const tileMap: Record<OpenType, string> = {
      Add: "Add new brand",
      Edit: `Edit brand ${curBrand?.brand_name}`,
   };

   // console.log('check curBrand', curBrand);

   return (
      <AddItem
         title={tileMap[type]}
         cbWhenSubmit={async (brandName) => await handleAddBrand(brandName, type, catId)}
         setIsOpenModal={setIsOpenModalParent}
         initValue={type === "Edit" ? curBrand?.brand_name : ""}
         loading={apiLoading}
      >
         <>
            <div className="mt-[10px] mb-[20px]">
               {brandData.image_url && (
                  <div className={cx("brand-image")}>
                     <img src={brandData.image_url} />
                     <Button onClick={() => handleChoseBrandImage("")} className="ml-[8px]">
                        <i className="material-icons text-[20px]">close</i>
                     </Button>
                  </div>
               )}

               {!brandData.image_url && (
                  <Button onClick={() => setIsOpenModal(true)} primary>
                     Choose image
                  </Button>
               )}
            </div>

            {isOpenModal && (
               <Modal child setShowModal={setIsOpenModal}>
                  <Gallery
                     setIsOpenModal={setIsOpenModal}
                     setImageUrl={(image_url) => handleChoseBrandImage(image_url)}
                  />
               </Modal>
            )}
         </>
      </AddItem>
   );
}
