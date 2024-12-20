import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import useStore from '../store';
import { useNavigate } from 'react-router-dom';
import {BiLoader} from 'react-icons/bi';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../libs/apiCalls';


const Rejestracja = () => {
  const { user } = useStore((state) => state);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const navigate = useNavigate();
  const [loading, setLoading] = useState();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      const {data:res} = await api.post("/autoryzacja/rejestracja", data);

      if(res?.user) {
        toast.success("Konto zostało utworzone. Teraz możesz się zalogować.");
        setTimeout(() => {
          navigate("/logowanie");
        }, 1500);
      }

    } catch (error) {
      console.log(error)
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-iceBlue">
      <div className="max-w-md w-full p-6 bg-white rounded shadow-lg">
      <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">Rejestracja</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Pole Email */}
          <div className="mb-4">
            <input
              disabled={loading}
              type="text"
              placeholder="Email"
              {...register('email', {
                required: 'To pole jest wymagane',
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: 'Niepoprawny adres email',
                },
              })}
              className="w-full p-2 border border-gray-300 rounded bg-white"
            />
            {errors.email && <p className="text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          {/* Pole Imię */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Imię"
              {...register('firstName', {
                required: 'To pole jest wymagane',
              })}
              className="w-full p-2 border border-gray-300 rounded bg-white"
            />
            {errors.firstName && <p className="text-red-500 mt-1">{errors.firstName.message}</p>}
          </div>

          {/* Pole Nazwisko */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Nazwisko"
              {...register('lastName', {
                required: 'To pole jest wymagane',
              })}
              className="w-full p-2 border border-gray-300 rounded bg-white"
            />
            {errors.lastName && <p className="text-red-500 mt-1">{errors.lastName.message}</p>}
          </div>

          {/* Pole Hasło */}
          <div className="mb-4">
            <input
              type="password"
              placeholder="Hasło"
              {...register('password', {
                required: 'To pole jest wymagane',
              })}
              className="w-full p-2 border border-gray-300 rounded bg-white"
            />
            {errors.password && <p className="text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          {/* Przycisk Rejestracji */}
          <button
            type="submit"
            disabled={loading}
            className="w-full p-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105"          >
            {loading ? <BiLoader className="text-2xl text-white animate-spin"/> : "Zarejestruj się"}
          </button>
        </form>
        
        <div className="mt-6">
          <hr className="border-gray-300 mb-4" />
          <div className="text-center">
            <Link to="/logowanie" className="text-gray-500 hover:text-gray-700 transition duration-200">
              Mam już konto
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rejestracja;
