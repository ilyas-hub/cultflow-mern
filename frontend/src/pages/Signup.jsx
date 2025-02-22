import signupImg from "../assets/Images/signup.webp";
import Template from "../components/core/Auth/Template";

function Signup() {
  return (
    <Template
      title="Join thousands organizing their tasks with Taskify"
      description1="Stay productive today, tomorrow, and beyond."
      description2="Task management designed to simplify your life."
      image={signupImg}
      formType="signup"
    />
  );
}

export default Signup;
