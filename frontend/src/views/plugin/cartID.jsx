import React from 'react';

function CartID() {
    let existingRandomString = localStorage.getItem('randomString');

    if (!existingRandomString || existingRandomString === 'undefined' || existingRandomString === 'null') {
        const length = 30;
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let randomString = '';

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            randomString += characters.charAt(randomIndex);
        }

        localStorage.setItem('randomString', randomString);
        existingRandomString = randomString;
    }

    return existingRandomString;
}

export default CartID;
