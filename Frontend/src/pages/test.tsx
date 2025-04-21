import { generateRandomness } from "@mysten/sui/zklogin";
import React, { useEffect } from "react";
import { useZKLogin, ZKLogin } from "react-sui-zk-login-kit";
import { useNavigate } from "react-router-dom"

const SUI_PROVER_ENDPOINT = "https://prover-dev.mystenlabs.com/v1"

const providers = {
  google: {
    clientId:
      "597908533856-nbjs1pps1l2igo4b6v9uio6d8ho15vl2.apps.googleusercontent.com",
    redirectURI: "http://localhost:5173/test",
  },
  twitch: {
    clientId: "YOUR_TWITCH_CLIENT_ID",
    redirectURI: "http://localhost:5173/test",
  },
}

const Test = () => {
  const { encodedJwt, userSalt, setUserSalt, address, logout } = useZKLogin()
  const navigate = useNavigate()

  useEffect(() => {
    if (encodedJwt) {
      const requestMock = new Promise((resolve): void =>
        resolve(localStorage.getItem("userSalt") || generateRandomness())
      )

      requestMock.then((salt) => {
        setUserSalt(String(salt))
        // Only navigate if we have both the JWT and salt
        if (userSalt) {
          navigate("/dashboard")
        }
      })
    }
  }, [encodedJwt, userSalt, navigate])

  if (address) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <span className="text-xl mb-4">Connected Address: {address}</span>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <ZKLogin
        onSuccess={() => {
          // The navigation is now handled in the useEffect
          console.log("Login successful")
        }}
        loadingText="Loading..."
        providers={providers}
        proverProvider={SUI_PROVER_ENDPOINT}
      />
    </div>
  )
}

export default Test;
