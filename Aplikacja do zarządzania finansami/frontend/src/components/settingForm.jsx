import React, { useState } from "react";
import useStore from "../store";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import api from "../libs/apiCalls";
import { BiLoader } from "react-icons/bi";

const SettingForm = () => {
  const { user, setCredentials } = useStore((state) => state);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstname: user?.firstname || "",
      lastname: user?.lastname || "",
      email: user?.email || "",
      currency: user?.currency || "USD",
    },
  });

  const [loading, setLoading] = useState(false);

  const onSubmit = async (values) => {
    try {
      setLoading(true);

      // Aktualizacja danych użytkownika
      const { data: res } = await api.put("/uzytkownik", values);

      if (res?.status === "success") {
        const newUser = { ...res.user, token: user.token };
        localStorage.setItem("user", JSON.stringify(newUser));
        setCredentials(newUser);

        toast.success(res?.message || "Dane zostały zaktualizowane pomyślnie");
      }
    } catch (error) {
      console.error("Something went wrong:", error);

      if (error?.response?.status === 409) {
        toast.error("Podany email już istnieje w innym koncie");
      } else {
        toast.error(error?.response?.data?.message || "Wystąpił błąd podczas aktualizacji danych");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center mt-3 mb-6">
      <div className="max-w-md w-full p-6 bg-white rounded shadow-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Pole Imię */}
          <div>
            <label className="block text-sm font-medium text-gray-500">Imię</label>
            <input
              disabled={loading}
              type="text"
              placeholder="Imię"
              {...register("firstname",)}
              className="w-full p-2 border border-gray-300 rounded bg-white"
            />
            {errors.firstname && <p className="text-red-500">{errors.firstname.message}</p>}
          </div>

          {/* Pole Nazwisko */}
          <div>
            <label className="block text-sm font-medium text-gray-500">Nazwisko</label>
            <input
              disabled={loading}
              type="text"
              placeholder="Nazwisko"
              {...register("lastname", )}
              className="w-full p-2 border border-gray-300 rounded bg-white"
            />
            {errors.lastname && <p className="text-red-500">{errors.lastname.message}</p>}
          </div>

          {/* Pole Email */}
          <div>
            <label className="block text-sm font-medium text-gray-500">Email</label>
            <input
              disabled={loading}
              type="email"
              placeholder="Email"
              {...register("email", {
                
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Podaj poprawny adres email",
                },
              })}
              className="w-full p-2 border border-gray-300 rounded bg-white"
            />
            {errors.email && <p className="text-red-500">{errors.email.message}</p>}
          </div>

          {/* Pole Waluta */}
          <div>
            <label className="block text-sm font-medium text-gray-500">Waluta</label>
            <select
              disabled={loading}
              {...register("currency", { required: "Waluta jest wymagana" })}
              className="w-full p-2 border border-gray-300 rounded bg-white"
            >
              <option value="USD">USD</option>
              <option value="PLN">PLN</option>
              <option value="GBP">GBP</option>
              <option value="EUR">EUR</option>
            </select>
            {errors.currency && <p className="text-red-500">{errors.currency.message}</p>}
          </div>

          {/* Przycisk Zaktualizuj */}
          <button
            type="submit"
            disabled={loading}
            className="w-full p-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            {loading ? <BiLoader className="text-2xl text-white animate-spin" /> : "Zaktualizuj"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettingForm;
