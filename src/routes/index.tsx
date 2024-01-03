import {
   Product,
   AddProduct,
   Dashboard,
   EditProduct,
   Home,
   Login,
   Register,
   Search,
   // Unauthorize,
   ProductDetail,
   // Account,
   Brand,
} from "../pages";

import DashboardLayout from "../layouts/DashboardLayout";
import DefaultLayout from "@/layouts/DefaultLayout";

const routes = {
   HOME: "",
   CATEGORY: "/:category_ascii",
   LOGIN: "/login",
   REGISTER: "/register",
   SEARCH: "/search/:key",
   DETAIL: "/:category/:key",
   UNAUTHORIZED: "/unauthorized",
   ACCOUNT: "/account",
};

const publicRoutes = [
   {
      path: routes.HOME,
      component: Home,
      layout: DefaultLayout,
   },
   // {
   //    path: routes.UNAUTHORIZED,
   //    component: UnauthorizedPage,
   // },
   {
      path: routes.LOGIN,
      component: Login,
      layout: null,
   },
   {
      path: routes.REGISTER,
      component: Register,
      layout: null,
   },
   // {
   //    path: routes.ACCOUNT,
   //    component: AccountPage,
   // },
   {
      path: routes.CATEGORY,
      component: Product,
   },
   {
      path: routes.SEARCH,
      component: Search,
   },
   {
      path: routes.DETAIL,
      component: ProductDetail,
   },
];

const privateRoutes = [
   {
      path: "/dashboard",
      role: ["R1"],
      component: Dashboard,
      layout: DashboardLayout,
   },
   {
      path: "/dashboard/add-product",
      role: ["R1"],
      component: AddProduct,
      layout: DashboardLayout,
   },
   {
      path: "/dashboard/brand",
      role: ["R1"],
      component: Brand,
      layout: DashboardLayout,
   },
   {
      path: "/dashboard/product/edit/:id",
      role: ["R1"],
      component: EditProduct,
      layout: DashboardLayout,
   },
];
export { publicRoutes, privateRoutes, routes };
