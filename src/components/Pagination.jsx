import PropTypes from 'prop-types';

function Pagination({ handlePageChange, pageInfo }) {
  return (
    <div className="d-flex justify-content-center">
      <nav>
        <ul className="pagination">
          <li className={`page-item ${!pageInfo.has_pre && 'disabled'}`}>
            <a
              onClick={() => handlePageChange(pageInfo.current_page - 1)}
              className="page-link"
              href="#"
            >
              上一頁
            </a>
          </li>

          {Array.from({ length: pageInfo.total_pages }).map((_, index) => (
            <li
              className={`page-item ${
                pageInfo.current_page === index + 1 && 'active'
              }`}
              key={index}
            >
              <a
                onClick={() => handlePageChange(index + 1)}
                className="page-link"
                href="#"
              >
                {index + 1}
              </a>
            </li>
          ))}

          <li className={`page-item ${!pageInfo.has_next && 'disabled'}`}>
            <a
              onClick={() => handlePageChange(pageInfo.current_page + 1)}
              className="page-link"
              href="#"
            >
              下一頁
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
}

Pagination.propTypes = {
  handlePageChange: PropTypes.func.isRequired,
  pageInfo: PropTypes.object.isRequired,
};

export default Pagination;
