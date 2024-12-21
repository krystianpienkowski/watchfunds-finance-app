import { v4 as uuidv4 } from 'uuid';


export const formatCurrency = (value) => {
    const currency = JSON.parse(localStorage.getItem("user"))?.currency || "PLN";
    const numberValue = Number(value);
    

    if (isNaN(numberValue)) return "Niewłaściwa wartość";

    const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 2
    }).formatToParts(numberValue);

    const amount = formatted.filter(part => part.type === "integer" || part.type === "group" || part.type === "decimal" || part.type === "fraction")
                            .map(part => part.value).join('');

    return `${amount} ${currency}`;
};


export const getDateSevenDaysAgo = () => {
    const today = new Date();
  
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
  
    return sevenDaysAgo.toISOString().split("T")[0];
  };
  