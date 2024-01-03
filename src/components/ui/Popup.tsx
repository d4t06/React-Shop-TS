import TippyHeadless, { TippyProps } from "@tippyjs/react/headless";
import { ReactElement } from "react";

type Props = {
   children: ReactElement;
   content: ReactElement;
   opts: TippyProps;
};
function Popup({ children, opts, content }: Props) {
   return (
      <TippyHeadless
         interactive
         placement="bottom"
         render={(attrs) => (
            <div tabIndex={-1} {...attrs}>
               {content}
            </div>
         )}
         {...opts}
      >
         {children}
      </TippyHeadless>
   );
}

export default Popup;
