import React, { useState, useEffect } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import SyncTasksButton from "../Common/SyncTasksButton";

const GoogleLoginButton = () => {
  const [googleAccessToken, setGoogleAccessToken] = useState(
    sessionStorage.getItem("googleAccessToken")
  );

  useEffect(() => {
    setGoogleAccessToken(sessionStorage.getItem("googleAccessToken"));
  }, []);

  const login = useGoogleLogin({
    flow: "auth-code",
    scope: "https://www.googleapis.com/auth/tasks",
    onSuccess: async (response) => {
      try {
        const res = await axios.post(
          "https://cultflow-mern.onrender.com/api/auth/google-login",
          {
            code: response.code,
          }
        );

        sessionStorage.setItem("googleAccessToken", res.data.access_token);
        sessionStorage.setItem("googleIdToken", res.data.id_token);
        setGoogleAccessToken(res.data.access_token);
      } catch (error) {
        console.error("Google login failed", error);
      }
    },
    onError: () => console.log("Login Failed"),
  });

  return (
    <div>
      {!googleAccessToken ? (
        <button onClick={() => login()} className=" bg-yellow-50 ">
        Login to sync tasks with Google.
        </button>
      ) : (
        <SyncTasksButton />
      )}
    </div>
  );
};

export default GoogleLoginButton;
