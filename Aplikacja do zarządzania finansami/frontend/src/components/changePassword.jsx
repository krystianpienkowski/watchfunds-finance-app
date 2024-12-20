import React, { useState } from 'react';
import api from '../libs/apiCalls';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { BiLoader } from 'react-icons/bi';

const ChangePassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm();

  const [loading, setLoading] = useState(false);

  const submitPasswordHandler = async (data) => {
    try {
      setLoading(true);

      const { data: res } = await api.put(`/uzytkownik/zmiana-hasla`, data);

      if (res?.status === 'success') {
        toast.success(res?.message || 'Hasło zostało pomyślnie zmienione');
      }
    } catch (error) {
      console.error('Something went wrong:', error);
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center mt-3 mb-6">
      <div className="max-w-md w-full p-6 bg-white rounded shadow-lg">
        <form onSubmit={handleSubmit(submitPasswordHandler)} className="space-y-4">
          {/* Pole Aktualne Hasło */}
          <div>
            <label className="block text-sm font-medium text-gray-500"></label>
            <input
              disabled={loading}
              type="password"
              placeholder="Aktualne Hasło"
              {...register('currentPassword', { required: 'Aktualne hasło jest wymagane' })}
              className="w-full p-2 border border-gray-300 rounded bg-white"
            />
            {errors.currentPassword && <p className="text-red-500">{errors.currentPassword.message}</p>}
          </div>

          {/* Pole Nowe Hasło */}
          <div>
            <label className="block text-sm font-medium text-gray-500"></label>
            <input
              disabled={loading}
              type="password"
              placeholder="Nowe Hasło"
              {...register('newPassword', {
                required: 'Nowe hasło jest wymagane',
                minLength: { value: 1, message: 'Wprowadź dane' },
              })}
              className="w-full p-2 border border-gray-300 rounded bg-white"
            />
            {errors.newPassword && <p className="text-red-500">{errors.newPassword.message}</p>}
          </div>

          {/* Pole Powtórz Nowe Hasło */}
          <div>
            <label className="block text-sm font-medium text-gray-500"></label>
            <input
              disabled={loading}
              type="password"
              placeholder="Powtórz Nowe Hasło"
              {...register('confirmPassword', {
                required: 'Powtórzenie hasła jest wymagane',
                validate: (value) => value === getValues('newPassword') || 'Hasła nie są zgodne',
              })}
              className="w-full p-2 border border-gray-300 rounded bg-white"
            />
            {errors.confirmPassword && <p className="text-red-500">{errors.confirmPassword.message}</p>}
          </div>

          {/* Przycisk Zmień Hasło */}
          <button
            type="submit"
            disabled={loading}
            className="w-full p-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            {loading ? <BiLoader className="text-2xl text-white animate-spin" /> : 'Zmień Hasło'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
