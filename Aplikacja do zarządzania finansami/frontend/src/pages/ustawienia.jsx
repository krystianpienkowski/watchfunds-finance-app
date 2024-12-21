import React from "react";
import useStore from "../store";
import Title from "../components/title";
import SettingForm from "../components/settingForm";
import ChangePassword from "../components/changePassword";

const Ustawienia = () => {
  const { user } = useStore((state) => state);

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full max-w-4xl px-4 py-2 shadow-lg bg-white md:px-10 md:my-1">
        <div className="border-b-2 border-gray-200 ">
          <Title text="Ustawienia" />
        </div>

        <div className="py-2">
          <SettingForm />
        </div>

        <div className="border-b-2 border-gray-200 ">
          <Title text="Zmiana hasła" />
        </div>

        <div className="py-2">
          <ChangePassword />
        </div>
      </div>
    </div>
  );
};

export default Ustawienia;
