import CryptoJS from 'crypto-js';

export function handleDecrypt(data:any , key = 'yuhi'){
    return CryptoJS.AES.decrypt(data, key).toString(CryptoJS.enc.Utf8);
}