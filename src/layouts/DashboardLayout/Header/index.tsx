import { Link } from "react-router-dom";
import jwtDecode from "jwt-decode";
import { useAuth } from "@/store/AuthContext";
import classNames from "classnames/bind";
import styles from "./Header.module.scss";

const cx = classNames.bind(styles);

function Header({ less }: { less?: boolean }) {
   const { auth } = useAuth();
   let decode: { username: string } | "" = "";

   if (!less && auth) {
      decode = auth.token ? jwtDecode(auth.token) : "";
   }

   return (
      <div className={cx("header__wrapper")}>
         <div className={cx("header")}>
            <h1 className="text-3xl">Hello {decode ? decode.username : "no persist"} !</h1>
         </div>
      </div>
   );
}

export default Header;
