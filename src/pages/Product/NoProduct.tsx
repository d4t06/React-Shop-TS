import classNames from 'classnames/bind';
import styles from './Products.module.scss';
const cx = classNames.bind(styles);

const NoProduct = () => {
   return (
      <div className={cx('no-product')}>
         <div className={cx('image-frame')}>
            <img
               src="https://fptshop.com.vn/Content/v5d/images/noti-search.png"
               alt=""
            />
         </div>
         <h1 className='text-3xl mt-[30px]'>Rất tiếc chúng tôi không tìm thấy kết quả theo yêu cầu của bạn</h1>
      </div>
   );
};

export default NoProduct;
