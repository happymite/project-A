const express = require('express');
const router = express.Router();
const { calculatePricing } = require('../utils/pricing.js');

const GST_RATE = 0.18;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

module.exports.calculatePricing = (pricePerNight, checkIn, checkOut) => {
  const nights = Math.round((checkOut - checkIn) / MS_PER_DAY);
  const subtotal = pricePerNight * nights;
  const taxes = Math.round(subtotal * GST_RATE);
  return { pricePerNight, nights, subtotal, taxes, totalPrice: subtotal + taxes };
  console.log("Price per night:", pricePerNight);
    console.log("Number of nights:", nights);
    console.log("Subtotal:", subtotal);
    console.log("Taxes:", taxes);
    console.log("Total price:", subtotal + taxes);

};