import { useState } from "react";
import { useRouter } from "next/router";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = () => {
    const hardcodedUsername = process.env.NEXT_PUBLIC_LOGIN_USERNAME;
    const hardcodedPassword = process.env.NEXT_PUBLIC_LOGIN_PASSWORD;

    if (username === hardcodedUsername && password === hardcodedPassword) {
      sessionStorage.setItem("loggedIn", "true");
      router.push("/");
    } else {
      setError("Грешно потребителско име или парола!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-700 text-center mb-6">
          Вход в системата
        </h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Потребителско име"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 w-full"
          />
        </div>
        <div className="mb-4">
          <input
            type="password"
            placeholder="Парола"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 w-full"
          />
        </div>
        <button
          onClick={handleLogin}
          className="w-full bg-indigo-700 text-white py-2 rounded-lg hover:bg-indigo-900 transition"
        >
          Вход
        </button>
      </div>
    </div>
  );
}
