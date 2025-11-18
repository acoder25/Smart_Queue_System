import react,{useState} from 'react';
import "./Login.css";

function Login() {
  const [form, setForm] = useState({
    phone: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.phone.trim() || !form.password.trim()) {
      setError('Please fill all the fields.');
      return;
    }
  
    setLoading(true);
    try{
      const res=await fetch('http://localhost:5000/api/auth/login',{
          method:'POST',
          credentials:'include',
          headers:{
            'Content-Type':'application/json',
          },
          body:JSON.stringify(form),
      });

      const data=await res.json();

      if(!res.ok){
        throw new Error(data.message||'Login Failed');
      }
      alert('login successful!');
    }
    catch(err){
      setError(err.message||"Something went wrong");
    }
    finally{
      setLoading(false);
    }
  }
    
  return(
    <>
    <div className="login-page">
      <div className="login-box">
        <div className="login-title">Login</div>

        <form className="login-form" onSubmit={handleSubmit} autoComplete="off">
          <div className="form-group">
            <label htmlFor="phone">Phone No</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              placeholder="Enter your phone number"
              value={form.phone}
              onChange={handleChange}
              required
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>
          <div className="form-group">
            <label htmlFor="system">System</label>
            <select
              id="system"
              name="system"
              value={form.system}
              onChange={handleChange}
              required
            >
              <option>Hospital Queue Predictor System</option>
            </select>
          </div>

          {error && (
            <div style={{ color: '#ffb4b4', textAlign: 'center', marginTop: '0.5rem' }}>
              {error}
            </div>
          )}

          <button className="login-btn" type="submit" disabled={loading}>
            Login
          </button>
        </form>
      </div>
    </div>
    </>
  );

}

export default Login;