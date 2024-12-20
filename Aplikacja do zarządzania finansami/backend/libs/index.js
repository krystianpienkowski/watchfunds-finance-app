import bcrypt from 'bcrypt';
import JWT from "jsonwebtoken";


export const hashPassword = async (userValue) => {
    const salt = await bcrypt.genSalt(10); // Generowanie salt za pomocą bcrypt

    const hashedPassword = await bcrypt.hash(userValue, salt); // Hashowanie hasła
    return hashedPassword;
};

export const comparePassword = async(userPassword, password) => {
    try {
        const isMatch = await bcrypt.compare(userPassword, password);
        return isMatch;
    } catch (error) {
        console.log(error);
    }
};

export const createJWT = (id) => {
    return JWT.sign(
        {
            userId:id
        }, 
        process.env.JWT_SECRET, 
        {
            expiresIn: "1d"
        }
    )
};


export function getMonthName(index) {
    const months = [
        "Styczeń", 
        "Luty", 
        "Marzec", 
        "Kwiecień", 
        "Maj", 
        "Czerwiec", 
        "Lipiec", 
        "Sierpień", 
        "Wrzesień", 
        "Październik", 
        "Listopad", 
        "Grudzień"
    ];
    return months[index];
}