import axios from 'axios';
import { useState } from 'react';
import PropTypes from 'prop-types';
const { VITE_BASE_URL: BASE_URL } = import.meta.env;

function LoginPage({ getProducts, setIsAuth }) {
    const [account, setAccount] = useState({
        username: '',
        password: '',
      });

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

  return (
    <>
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
    </>
  );
}

LoginPage.propTypes =  {
    getProducts: PropTypes.func.isRequired,
    setIsAuth: PropTypes.func.isRequired
}

export default LoginPage;
