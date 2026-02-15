import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff, FiCheck } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center px-4 md:px-6 py-6 font-sans">
      <div className="mx-auto w-full max-w-[400px] text-center mb-10">
        <div className="w-16 h-16 bg-primary-500 rounded-lg mx-auto mb-4 flex items-center justify-center text-h1 text-onPrimary">
          <FiMail />
        </div>
        <h1 className="text-h1 font-bold text-gray-900 mb-1 leading-tight">
          Welcome back
        </h1>
        <p className="text-body text-gray-500 leading-relaxed">
          Sign in to your Fiscal Focus account
        </p>
      </div>

      <div className="bg-white rounded-lg p-8 max-w-[400px] w-full mx-auto shadow-medium">
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
              Email address
            </label>
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl pointer-events-none" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full py-2 pr-4 pl-12 text-body font-regular text-gray-900 bg-white border-2 border-gray-100 rounded-md outline-2 outline-primary-500 transition-all duration-200 focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(135,215,72,0.1)]"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
              Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl pointer-events-none" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full py-2 pr-12 pl-12 text-body font-regular text-gray-900 bg-white border-2 border-gray-100 rounded-md outline-2 outline-primary-500 transition-all duration-200 focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(135,215,72,0.1)]"
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-none border-none text-gray-500 cursor-pointer text-xl flex items-center justify-center p-1 transition-colors duration-200 hover:text-gray-900"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 relative">
              <div className="relative w-5 h-6">
                <input
                  id="remember-me"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="appearance-none w-5 h-5 border-2 border-gray-100 rounded-sm bg-white checked:bg-primary-500 cursor-pointer relative transition-all duration-200 flex-shrink-0 mt-0.5"
                />
                {formData.rememberMe && (
                  <FiCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-onPrimary text-sm pointer-events-none" />
                )}
              </div>
              <label
                htmlFor="remember-me"
                className="text-sm font-regular text-gray-900 cursor-pointer leading-normal"
                onClick={() =>
                  setFormData({
                    ...formData,
                    rememberMe: !formData.rememberMe
                  })}
              >
                Remember me
              </label>
            </div>

            <div>
              <Link 
                to="/forgot-password" 
                className="text-sm font-semibold text-primary-500 no-underline transition-colors duration-200 hover:text-primaryHover"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 text-body font-semibold text-onPrimary bg-primary-500 border-none rounded-md cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 hover:bg-primaryHover hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(135,215,72,0.2)] ${
                loading ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>

        <div className="relative text-center my-6">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-100" />
          <span className="relative inline-block px-4 bg-white text-sm font-regular text-gray-500">
            Don't have an account?
          </span>
        </div>

        <div>
          <Link 
            to="/register" 
            className="w-full block py-4 text-sm font-semibold text-gray-900 bg-white border-2 border-gray-100 rounded-md cursor-pointer transition-all duration-200 no-underline text-center hover:border-primary-500 hover:bg-gray-50"
          >
            Create new account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;