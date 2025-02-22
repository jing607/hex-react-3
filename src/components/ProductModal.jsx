import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Modal } from 'bootstrap';
import PropTypes from 'prop-types';

const { VITE_BASE_URL: BASE_URL, VITE_API_PATH: API_PATH } = import.meta.env;

function ProductModal({
  modalMode,
  tempProduct,
  isProductModalOpen,
  setIsProductModalOpen,
  getProducts,
}) {
  const [modalData, setModalData] = useState(tempProduct);

  const productModalRef = useRef(null);

  useEffect(() => {
    // 建立 Modal 實例, 並傳入 DOM 元素
    new Modal(productModalRef.current, {
      backdrop: false,
    });

    // 解決關閉 Modal 後跳紅字，焦點停留在 Modal 上的問題
    productModalRef.current.addEventListener('hide.bs.modal', () => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    });
  }, []);

  useEffect(() => {
    if (isProductModalOpen) {
      const modalInstance = Modal.getInstance(productModalRef.current);
      if (modalInstance) {
        modalInstance.show();
      }
    }
  }, [isProductModalOpen]);

  useEffect(() => {
    setModalData(tempProduct);
  }, [tempProduct]);

  const handleCloseProductModal = () => {
    const modalInstance = Modal.getInstance(productModalRef.current);
    modalInstance.hide();
    setIsProductModalOpen(false);
  };

  const createProduct = async () => {
    const response = await axios.post(
      `${BASE_URL}/v2/api/${API_PATH}/admin/product`,
      {
        data: {
          ...modalData,
          origin_price: Number(modalData.origin_price),
          price: Number(modalData.price),
          is_enabled: modalData.is_enabled ? 1 : 0,
        },
      }
    );

    if (response.data.success) {
      alert('新增成功');
    } else {
      throw new Error(response.data.message || '新增失敗');
    }
  };

  const editProduct = async () => {
    const response = await axios.put(
      `${BASE_URL}/v2/api/${API_PATH}/admin/product/${modalData.id}`,
      {
        data: {
          ...modalData,
          origin_price: Number(modalData.origin_price),
          price: Number(modalData.price),
          is_enabled: modalData.is_enabled ? 1 : 0,
          imagesUrl: modalData.imagesUrl || [],
        },
      }
    );
    if (response.data.success) {
      alert('更新產品成功');
    } else {
      throw new Error(response.data.message || '更新產品失敗');
    }
  };

  const handleModalInputChange = (e) => {
    const { name, value, checked, type } = e.target;

    setModalData({
      ...modalData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleImageChange = (e, index) => {
    const { value } = e.target;

    const newImages = [...modalData.imagesUrl];

    newImages[index] = value;

    setModalData({
      ...modalData,
      imagesUrl: newImages,
    });
  };

  const handleAddImage = () => {
    const newImages = [...modalData.imagesUrl, ''];

    setModalData({
      ...modalData,
      imagesUrl: newImages,
    });
  };

  const handleRemoveImage = () => {
    const newImages = [...modalData.imagesUrl];

    newImages.pop();

    setModalData({
      ...modalData,
      imagesUrl: newImages,
    });
  };

  const handleUpdateProduct = async () => {
    const apiCall = modalMode === 'create' ? createProduct : editProduct;
    try {
      await apiCall();
      getProducts();
      handleCloseProductModal();
    } catch (error) {
      alert('更新產品失敗：' + error.message);
    }
  };
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file-to-upload', file);

    try {
      const res = await axios.post(
        `${BASE_URL}/v2/api/${API_PATH}/admin/upload`,
        formData
      );

      const uploadeImageUrl = res.data.imageUrl;

      setModalData({
        ...modalData,
        imageUrl: uploadeImageUrl,
      });
    } catch (error) {
      alert('上傳圖片失敗：' + error.message);
    }
    e.target.value = ''; // 清空input值
  };

  return (
    <>
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
                  <div className="mb-3">
                    <label htmlFor="fileInput" className="form-label">
                      {' '}
                      圖片上傳{' '}
                    </label>
                    <input
                      onChange={handleFileChange}
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      className="form-control"
                      id="fileInput"
                    />
                  </div>
                  <p>or</p>
                  <div className="mb-4">
                    <label htmlFor="primary-image" className="form-label">
                      輸入圖片網址
                    </label>
                    <div className="input-group">
                      <input
                        value={modalData.imageUrl}
                        onChange={handleModalInputChange}
                        name="imageUrl"
                        type="text"
                        id="primary-image"
                        className="form-control"
                        placeholder="請輸入圖片連結"
                      />
                    </div>
                    {modalData?.imageUrl && (
                      <img
                        src={modalData.imageUrl}
                        alt={modalData.title}
                        className="img-fluid"
                      />
                    )}
                  </div>

                  {/* 其他圖 */}
                  <div className="border border-2 border-dashed rounded-3 p-3">
                    {modalData?.imagesUrl?.map((image, index) => (
                      <div className="mb-2" key={index}>
                        <label
                          htmlFor={`imagesUrl-${index + 1}`}
                          className="form-label"
                        >
                          副圖 {index + 1}
                        </label>
                        <input
                          min="0"
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
                      {modalData.imagesUrl.length < 5 &&
                        modalData.imagesUrl[modalData.imagesUrl.length - 1] !==
                          '' && (
                          <button
                            onClick={handleAddImage}
                            className="btn btn-outline-primary btn-sm w-100"
                          >
                            新增圖片
                          </button>
                        )}

                      {modalData.imagesUrl.length > 0 && (
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
                      min="0"
                      value={modalData.title}
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
                      min="0"
                      value={modalData.category}
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
                      min="0"
                      value={modalData.unit}
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
                        min="0"
                        value={modalData.origin_price}
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
                        min="0"
                        value={modalData.price}
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
                      value={modalData.description}
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
                      value={modalData.content}
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
                      min="0"
                      checked={modalData.is_enabled}
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
    </>
  );
}

ProductModal.propTypes = {
  modalMode: PropTypes.string.isRequired,
  tempProduct: PropTypes.object.isRequired,
  isProductModalOpen: PropTypes.bool.isRequired,
  setIsProductModalOpen: PropTypes.func.isRequired,
  getProducts: PropTypes.func.isRequired,
};

export default ProductModal;
