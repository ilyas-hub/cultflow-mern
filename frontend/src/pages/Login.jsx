import loginImg from "../assets/Images/login.webp"
import Template from "../components/core/Auth/Template"

function Login() {
  return (
    <Template 
    title="Welcome Back"
    description1="Stay on top of your tasks effortlessly."
    description2="Your productivity hub is just a login away."
    image={loginImg}
    formType="login"
  />
  
  )
}

export default Login
