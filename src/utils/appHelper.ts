import { Brand, ProductColor, ProductCombine, ProductSchema, ProductSlider, ProductStorage } from "@/types";

export const sleep = (time: number) =>
   new Promise<void>((rs) => {
      setTimeout(() => {
         rs();
      }, time);
   });

export const moneyFormat = (money: string | number) => {
   const formatter = new Intl.NumberFormat("en-US");
   if (!money) return "";
   return formatter.format(+money);
};

export const initProductObject = (data: Partial<ProductSchema>) => {
   const newProduct: ProductSchema = {
      product_name_ascii: "",
      image_url: "",
      installment: false,
      product_name: "",
      brand_id: 0,
      category_id: 0,
      ...data,
   };

   return newProduct;
};

export const initStorageObject = (data: Partial<ProductStorage>) => {
   const initStorage: ProductStorage = {
      id: undefined,
      base_price: 0,
      product_name_ascii: "",
      default: false,
      storage: "",
      storage_ascii: "",
      ...data,
   };

   return initStorage;
};

export const initColorObject = (data: Partial<ProductColor>) => {
   const newColor: ProductColor = {
      color: "",
      id: undefined,
      product_name_ascii: "",
      color_ascii: "",
      default: false,
      ...data,
   };

   return newColor;
};

export function initCombineData(data: Partial<ProductCombine>, color: string, storage: string) {
   // eliminate in order to prevent replace data
   const { storage_data, color_data, ...rest } = data;
   const combineData: ProductCombine = {
      id: undefined,
      default: false,
      price: 0,
      color_id: 0,
      storage_id: 0,
      product_name_ascii: "",
      quantity: 0,
      color_data: { color, color_ascii: generateId(color) },
      storage_data: { storage, storage_ascii: generateId(storage) },
      ...rest,
   };

   return combineData;
}

export const initProductSlider = (data: Partial<ProductSlider>) => {
   const productSlider: ProductSlider = {
      color_id: 0,
      id: 0,
      product_name_ascii: "",
      slider_id: 0,
      color_data: { color: "", color_ascii: "" },
      slider_data: { images: [], slider_name: "", id: 0 },
      ...data,
   };

   return productSlider;
};

export const generateId = (name: string): string => {
   const convertToEn = (str: string) => {
      const newString = str
         .toLocaleLowerCase()
         .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ắ|ằ|ẳ|ẵ|ặ/g, "a")
         .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e")
         .replace(/ì|í|ị|ỉ|ĩ/g, "i")
         .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ/g, "o")
         .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u")
         .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y")
         .replace(/đ/g, "d");
      return newString;
   };
   return convertToEn(name).replaceAll(/[\W_]/g, "-");
};

export const initBrandObject = (data: Partial<Brand>) => {
   const object: Brand = {
      brand_name: "",
      brand_ascii: "",
      image_url: "",
      category_id: 0,
      ...data,
   };

   return object;
};
