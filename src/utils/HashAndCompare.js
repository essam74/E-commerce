import bcrypt from 'bcryptjs'


export const hash = ({ plaintext, salt = process.env.SALT_ROUND } = {}) => {
    const hashValue = bcrypt.hashSync(plaintext, parseInt(salt))
    return hashValue;
} 


export const compare = ({ plaintext, hashValue } = {}) => {
    const match = bcrypt.compareSync(plaintext, hashValue)
    return match
}