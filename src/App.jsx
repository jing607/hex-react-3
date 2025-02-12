import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import { Modal } from 'bootstrap';
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

function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [products, setProducts] = useState([]);
  const [tempProduct, setTempProduct] = useState(defaultModalState);
  const [modalMode, setModalMode] = useState(null);

  const [account, setAccount] = useState({
    username: '',
    password: '',
  });

  const productModalRef = useRef(null);
  const delProductModalRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setAccount({
      ...account,
      [name]: value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${BASE_URL}/v2/admin/signin`, account);
      const { token, expired } = response.data;

      if (!token || !expired) {
        throw new Error('帳號或密碼錯誤');
      }
      document.cookie = `hexToken=${token}; expires=${new Date(expired)}`;

      axios.defaults.headers.common['Authorization'] = token;

      getProducts();
      setIsAuth(true);
      console.log(response);
    } catch (error) {
      alert('登入失敗：' + error.message);
    }
  };

  const getProducts = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/v2/api/${API_PATH}/admin/products`
      );
      setProducts(response.data.products);
    } catch (error) {
      alert('取得產品列表失敗：' + error.message);
    }
  };

  const checkUserLogin = async () => {
    try {
      await axios.post(`${BASE_URL}/v2/api/user/check`);
      getProducts();
      setIsAuth(true);
      // alert("使用者已登入");
    } catch (error) {
      alert('檢查使用者登入狀態失敗：' + error.message);
    }
  };

  useEffect(() => {
    const token = document.cookie.replace(
      // eslint-disable-next-line no-useless-escape
      /(?:(?:^|.*;\s*)hexToken\s*\=\s*([^;]*).*$)|^.*$/,
      '$1'
    );
    axios.defaults.headers.common.Authorization = token;
    checkUserLogin();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    // 建立 Modal 實例, 並傳入 DOM 元素
    new Modal(productModalRef.current, {
      backdrop: false,
    });

    new Modal(delProductModalRef.current, {
      backdrop: false,
    });

    // 解決關閉 Modal 後跳紅字，焦點停留在 Modal 上的問題
    productModalRef.current.addEventListener('hide.bs.modal', () => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    });
    delProductModalRef.current.addEventListener('hide.bs.modal', () => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    });
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
    const modalInstance = Modal.getInstance(productModalRef.current);
    modalInstance.show();
  };

  const handleCloseProductModal = () => {
    const modalInstance = Modal.getInstance(productModalRef.current);
    modalInstance.hide();
  };

  const handleOpenDelProductModal = (product) => {
    setTempProduct(product);

    if (product) {
      setTempProduct({
        ...product,
        imagesUrl: product.imagesUrl || [],
      });
    } else {
      setTempProduct(defaultModalState);
    }

    const modalInstance = Modal.getInstance(delProductModalRef.current);
    modalInstance.show();
  };

  const handleCloseDelProductModal = () => {
    const modalInstance = Modal.getInstance(delProductModalRef.current);
    modalInstance.hide();
  };

  const handleModalInputChange = (e) => {
    const { name, value, checked, type } = e.target;

    setTempProduct({
      ...tempProduct,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleImageChange = (e, index) => {
    const { value } = e.target;

    const newImages = [...tempProduct.imagesUrl];

    newImages[index] = value;

    setTempProduct({
      ...tempProduct,
      imagesUrl: newImages,
    });
  };

  const handleAddImage = () => {
    const newImages = [...tempProduct.imagesUrl, ''];

    setTempProduct({
      ...tempProduct,
      imagesUrl: newImages,
    });
  };

  const handleRemoveImage = () => {
    const newImages = [...tempProduct.imagesUrl];

    newImages.pop();

    setTempProduct({
      ...tempProduct,
      imagesUrl: newImages,
    });
  };

  const createProduct = async () => {
    // try {
    const response = await axios.post(
      `${BASE_URL}/v2/api/${API_PATH}/admin/product`,
      {
        data: {
          ...tempProduct,
          origin_price: Number(tempProduct.origin_price),
          price: Number(tempProduct.price),
          is_enabled: tempProduct.is_enabled ? 1 : 0,
        },
      }
    );

    if (response.data.success) {
      alert('新增成功');
    } else {
      throw new Error(response.data.message || '新增失敗');
    }

    // } catch (error) {
    //   alert('新增產品失敗：' + error.message);
    // }
  };

  const editProduct = async () => {
    // try {
    const response = await axios.put(
      `${BASE_URL}/v2/api/${API_PATH}/admin/product/${tempProduct.id}`,
      {
        data: {
          ...tempProduct,
          origin_price: Number(tempProduct.origin_price),
          price: Number(tempProduct.price),
          is_enabled: tempProduct.is_enabled ? 1 : 0,
          imagesUrl: tempProduct.imagesUrl || [],
        },
      }
    );
    if (response.data.success) {
      alert('編輯成功');
    } else {
      throw new Error(response.data.message || '編輯失敗');
    }
    // } catch (error) {
    //   alert('編輯產品失敗：' + error.message);
    // }
  };

  const deleteProduct = async () => {
    try {
      await axios.delete(
        `${BASE_URL}/v2/api/${API_PATH}/admin/product/${tempProduct.id}`
      );
    } catch (error) {
      alert('刪除產品失敗：' + error.message);
    }
  };

  const handleUpdateProduct = async () => {
    const apiCall = modalMode === 'create' ? createProduct : editProduct;
    try {
      await apiCall();
      getProducts();
      handleCloseProductModal();
      alert('更新產品成功');
    } catch (error) {
      alert('更新產品失敗：' + error.message);
    }
  };

  const handleDeleteProduct = async () => {
    try {
      await deleteProduct();
      getProducts();
      handleCloseDelProductModal();
    } catch (error) {
      alert('刪除產品失敗：' + error.message);
    }
  };

  return (
    <>
      {isAuth ? (
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
                  {products.map((product) => (
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
        </div>
      ) : (
        <div className="d-flex flex-column justify-content-center align-items-center vh-100">
          <h1 className="mb-5">請先登入</h1>
          <form onSubmit={handleLogin} className="d-flex flex-column gap-3">
            <div className="form-floating mb-3">
              <input
                value={account.username}
                onChange={handleInputChange}
                name="username"
                type="email"
                className="form-control"
                id="username"
                placeholder="name@example.com"
              />
              <label htmlFor="username">Email address</label>
            </div>
            <div className="form-floating">
              <input
                value={account.password}
                onChange={handleInputChange}
                name="password"
                type="password"
                className="form-control"
                id="password"
                placeholder="Password"
              />
              <label htmlFor="password">Password</label>
            </div>
            <button className="btn btn-primary">登入</button>
          </form>
          <p className="mt-5 mb-3 text-muted">&copy; 2024~∞ - 六角學院</p>
        </div>
      )}

      {/* Modal */}
      <div
        ref={productModalRef}
        className="modal"
        id="productModal"
        tabIndex="-1"
        aria-labelledby="productModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className="modal-content">
            <div className="modal-header p-4">
              <h1 className="modal-title fs-4" id="productModalLabel">
                {modalMode === 'create' ? '新增產品' : '編輯產品'}
              </h1>
              <button
                onClick={handleCloseProductModal}
                type="button"
                className="btn-close"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body p-4">
              <div className="row">
                <div className="col-md-4">
                  {/* 主圖 */}
                  <div className="mb-4">
                    <label htmlFor="primary-image" className="form-label">
                      主圖
                    </label>
                    <div className="input-group">
                      <input
                        value={tempProduct.imageUrl}
                        onChange={handleModalInputChange}
                        name="imageUrl"
                        type="text"
                        id="primary-image"
                        className="form-control"
                        placeholder="請輸入圖片連結"
                      />
                    </div>
                    {tempProduct?.imageUrl && (
                      <img
                        src={tempProduct.imageUrl}
                        alt={tempProduct.title}
                        className="img-fluid"
                      />
                    )}
                  </div>

                  {/* 其他圖 */}
                  <div className="border border-2 border-dashed rounded-3 p-3">
                    {tempProduct?.imagesUrl?.map((image, index) => (
                      <div className="mb-2" key={index}>
                        <label
                          htmlFor={`imagesUrl-${index + 1}`}
                          className="form-label"
                        >
                          副圖 {index + 1}
                        </label>
                        <input
                          value={image}
                          onChange={(e) => handleImageChange(e, index)}
                          id={`imagesUrl-${index + 1}`}
                          type="text"
                          placeholder={`圖片網址 ${index + 1}`}
                          className="form-control mb-2"
                        />
                        {image && (
                          <img
                            src={image}
                            className="card-img-top"
                            alt="更多圖片"
                          />
                        )}
                      </div>
                    ))}

                    <div className="btn-group w-100">
                      {tempProduct.imagesUrl.length < 5 &&
                        tempProduct.imagesUrl[
                          tempProduct.imagesUrl.length - 1
                        ] !== '' && (
                          <button
                            onClick={handleAddImage}
                            className="btn btn-outline-primary btn-sm w-100"
                          >
                            新增圖片
                          </button>
                        )}

                      {tempProduct.imagesUrl.length > 0 && (
                        <button
                          onClick={handleRemoveImage}
                          className="btn btn-outline-danger btn-sm w-100"
                        >
                          取消圖片
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-md-8">
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">
                      標題
                    </label>
                    <input
                      value={tempProduct.title}
                      onChange={handleModalInputChange}
                      name="title"
                      id="title"
                      type="text"
                      className="form-control"
                      placeholder="請輸入標題"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="category" className="form-label">
                      分類
                    </label>
                    <input
                      value={tempProduct.category}
                      onChange={handleModalInputChange}
                      name="category"
                      id="category"
                      type="text"
                      className="form-control"
                      placeholder="請輸入分類"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="unit" className="form-label">
                      單位
                    </label>
                    <input
                      value={tempProduct.unit}
                      onChange={handleModalInputChange}
                      name="unit"
                      id="unit"
                      type="text"
                      className="form-control"
                      placeholder="請輸入單位"
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label htmlFor="origin_price" className="form-label">
                        原價
                      </label>
                      <input
                        value={tempProduct.origin_price}
                        onChange={handleModalInputChange}
                        name="origin_price"
                        id="origin_price"
                        type="number"
                        className="form-control"
                        placeholder="請輸入原價"
                      />
                    </div>
                    <div className="col-6">
                      <label htmlFor="price" className="form-label">
                        售價
                      </label>
                      <input
                        value={tempProduct.price}
                        onChange={handleModalInputChange}
                        name="price"
                        id="price"
                        type="number"
                        className="form-control"
                        placeholder="請輸入售價"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">
                      產品描述
                    </label>
                    <textarea
                      value={tempProduct.description}
                      onChange={handleModalInputChange}
                      name="description"
                      id="description"
                      className="form-control"
                      rows={4}
                      placeholder="請輸入產品描述"
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="content" className="form-label">
                      說明內容
                    </label>
                    <textarea
                      value={tempProduct.content}
                      onChange={handleModalInputChange}
                      name="content"
                      id="content"
                      className="form-control"
                      rows={4}
                      placeholder="請輸入說明內容"
                    ></textarea>
                  </div>

                  <div className="form-check">
                    <input
                      checked={tempProduct.is_enabled}
                      onChange={handleModalInputChange}
                      name="is_enabled"
                      type="checkbox"
                      className="form-check-input"
                      id="isEnabled"
                    />
                    <label className="form-check-label" htmlFor="isEnabled">
                      是否啟用
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer p-4">
              <button
                onClick={handleCloseProductModal}
                type="button"
                className="btn btn-secondary"
              >
                Close
              </button>
              <button
                onClick={handleUpdateProduct}
                type="button"
                className="btn btn-primary"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={delProductModalRef}
        className="modal fade"
        id="delProductModal"
        tabIndex="-1"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5">刪除產品</h1>
              <button
                onClick={handleCloseDelProductModal}
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              你是否要刪除
              <span className="text-danger fw-bold">{tempProduct.title}</span>
            </div>
            <div className="modal-footer">
              <button
                onClick={handleCloseDelProductModal}
                type="button"
                className="btn btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleDeleteProduct}
                type="button"
                className="btn btn-danger"
              >
                刪除
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
