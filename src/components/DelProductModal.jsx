import { useEffect, useRef } from 'react';
import axios from 'axios';
import { Modal } from 'bootstrap';
import PropTypes from 'prop-types';

const { VITE_BASE_URL: BASE_URL, VITE_API_PATH: API_PATH } = import.meta.env;

function DelProductModal({
  getProducts,
  tempProduct,
  isDelProductModalOpen,
  setIsDelProductModalOpen,
}) {
  const delProductModalRef = useRef(null);

  useEffect(() => {
    // 建立 Modal 實例, 並傳入 DOM 元素
    new Modal(delProductModalRef.current, {
      backdrop: false,
    });

    // 解決關閉 Modal 後跳紅字，焦點停留在 Modal 上的問題
    delProductModalRef.current.addEventListener('hide.bs.modal', () => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    });
  }, []);

  useEffect(() => {
    if (isDelProductModalOpen) {
      const modalInstance = Modal.getInstance(delProductModalRef.current);
      if (modalInstance) {
        modalInstance.show();
      }
    }
  }, [isDelProductModalOpen]);

  const handleCloseDelProductModal = () => {
    const modalInstance = Modal.getInstance(delProductModalRef.current);
    modalInstance.hide();

    setIsDelProductModalOpen(false);
  };

  const deleteProduct = async () => {
    try {
      await axios.delete(
        `${BASE_URL}/v2/api/${API_PATH}/admin/product/${tempProduct.id}`
      );
    } catch (error) {
      alert(`刪除產品失敗： ${error.message}`);
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
  );
}

DelProductModal.propTypes = {
  getProducts: PropTypes.func.isRequired,
  tempProduct: PropTypes.object.isRequired,
  isDelProductModalOpen: PropTypes.bool.isRequired,
  setIsDelProductModalOpen: PropTypes.func.isRequired,
};

export default DelProductModal;
