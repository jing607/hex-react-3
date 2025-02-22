import axios from 'axios';
import { useState, useEffect } from 'react';
import Pagination from '../components/Pagination';
import ProductModal from '../components/ProductModal';
import DelProductModal from '../components/DelProductModal';

const { VITE_BASE_URL: BASE_URL, VITE_API_PATH: API_PATH } = import.meta.env;

const defaultModalState = {
  imageUrl: '',
  title: '',
  category: '',
  unit: '',
  origin_price: '',
  price: '',
  description: '',
  content: '',
  is_enabled: 0,
  imagesUrl: [],
};

function ProductPage() {
  const [modalMode, setModalMode] = useState(null);
  const [tempProduct, setTempProduct] = useState(defaultModalState);
  const [pageInfo, setPageInfo] = useState({});
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isDelProductModalOpen, setIsDelProductModalOpen] = useState(false);

  const handlePageChange = (page) => {
    getProducts(page);

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const [products, setProducts] = useState([]);

  const getProducts = async (page = 1) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/v2/api/${API_PATH}/admin/products?page=${page}`
      );
      setProducts(response.data.products);
      setPageInfo(response.data.pagination);
    } catch (error) {
      alert(`取得產品列表失敗： ${error.message}`);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  const handleOpenProductModal = (mode, product) => {
    // 判斷是新增還是編輯
    setModalMode(mode);

    // 判斷是否有 product 傳入，有的話就是編輯模式帶入資料
    if (product) {
      // 確保編輯時 imagesUrl 存在. 不然在沒圖片情況下打開會報錯
      setTempProduct({
        ...product,
        imagesUrl: product.imagesUrl || [], // 如果 imagesUrl 不存在，設為空陣列
      });
    } else {
      setTempProduct(defaultModalState);
    }

    // 透過 Modal.getInstance 取得 Modal 實來撰寫開關方法
    setIsProductModalOpen(true);
  };

  const handleOpenDelProductModal = (product) => {
    if (product) {
      setTempProduct({
        ...product,
        imagesUrl: product.imagesUrl || [],
      });
    } else {
      setTempProduct(defaultModalState);
    }

    setIsDelProductModalOpen(true);
  };

  return (
    <>
      <div className="container">
        <div className="row mt-5">
          <div className="col">
            <div className="d-flex justify-content-between">
              <h2>產品列表</h2>
              <button
                onClick={() => {
                  handleOpenProductModal('create');
                }}
                className="btn btn-primary"
              >
                新增產品
              </button>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>產品名稱</th>
                  <th>原價</th>
                  <th>售價</th>
                  <th>是否啟用</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products?.map((product) => (
                  <tr key={product.id}>
                    <td>{product.title}</td>
                    <td>{product.origin_price}</td>
                    <td>{product.price}</td>
                    <td>
                      {product.is_enabled ? (
                        <span className="text-success">已啟用</span>
                      ) : (
                        <span className="text-danger">未啟用</span>
                      )}
                    </td>
                    <td className="text-end">
                      <div className="btn-group ms-auto">
                        <button
                          onClick={() =>
                            handleOpenProductModal('edit', product)
                          }
                          className="btn btn-outline-primary btn-sm"
                        >
                          編輯
                        </button>
                        <button
                          onClick={() => handleOpenDelProductModal(product)}
                          className="btn btn-outline-danger btn-sm"
                        >
                          刪除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Pagination pageInfo={pageInfo} handlePageChange={handlePageChange} />
      </div>

      <ProductModal
        modalMode={modalMode}
        tempProduct={tempProduct}
        isProductModalOpen={isProductModalOpen}
        setIsProductModalOpen={setIsProductModalOpen}
        getProducts={getProducts}
      />

      <DelProductModal
        getProducts={getProducts}
        tempProduct={tempProduct}
        isDelProductModalOpen={isDelProductModalOpen}
        setIsDelProductModalOpen={setIsDelProductModalOpen}
      />
    </>
  );
}

export default ProductPage;
