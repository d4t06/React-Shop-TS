export interface ProductCombine {
   id?: number;
   product_name_ascii: string;
   color_id: number;
   storage_id: number;
   quantity: number;
   price: number;
   default: boolean;
   color_data: {
      color: string;
      color_ascii: string;
   };
   storage_data: {
      storage: string;
      storage_ascii: string;
   };
}

export type ProductCombineSchema = Omit<
   ProductCombine,
   "color_data" | "storage_data" | "color_id" | "storage_id" | "id"
> & {
   color_id: number;
   // id: number;
   storage_id: number;
};

export interface ProductSlider {
   id: number;
   product_name_ascii: string;
   slider_id: number;
   color_id: number;
   color_data: {
      color: string;
      color_ascii: string;
   };
   slider_data: Slider;
}

export type ProductSliderSchema = Omit<ProductSlider, "color_data" | "slider_data">;

export type SliderImage = {
   image_url: string;
   id: number;
};
export type SliderImageSchema = {
   slider_id: number;
   image_url: string;
};

export type Slider = {
   id: number;
   images: SliderImage[];
   slider_name: string;
};

export type SliderSchema = Omit<Slider, "images" | "id">;

export type ProductStorage = {
   id?: number;
   product_name_ascii: string;
   storage_ascii: string;
   storage: string;
   default: boolean;
   base_price: number;
};

export type ProductColor = {
   id?: number;
   product_name_ascii: string;
   color_ascii: string;
   color: string;
   default: boolean;
};

export interface Product {
   id?: number;
   product_name: string;
   product_name_ascii: string;
   category_id: number;
   brand_id: number;
   image_url: string;
   installment: boolean;
   category_data: {
      category_name: string;
      category_ascii: string;
   };
   brand_data: {
      brand_name: string;
      brand_ascii: string;
   };
   storages_data: ProductStorage[];
   colors_data: ProductColor[];
   combines_data: ProductCombine[];
   sliders_data: ProductSlider[];
}

export type ProductSchema = Omit<
   Product,
   "storages_data" | "colors_data" | "combines_data" | "sliders_data" | "brand_data" | "category_data"
>;

export type Detail = {
   item_id: string;
   product_id: string;
   gallery: string[];
};

export type Category = {
   id?: number;
   category_ascii: string;
   category_name: string;
   icon: string;
};

export type Brand = {
   id?: number;
   brand_ascii: string;
   brand_name: string;
   image_url: string;
   category_id: number;
};

export type User = {
   user_name: string;
   password: string;
   role_code: string;
};

export type ImageType = {
   id: number;
   image_url: string;
   image_file_path: string;
   name: string;
   size: number;
   link_to: string;
};

export type Toast = {
   title?: "success" | "error" | "warning";
   desc: string;
   id: string;
};

export type GetArrayType<T extends any[]> = T extends (infer U)[] ? U : never;
