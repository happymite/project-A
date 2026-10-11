const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    bookingReference:{
        type:String,
        unique:true,
        required:true,
        immutable: true,
    },
    listing : {
        type : Schema.Types.ObjectId,
        ref : "Listing",
        required:true,
    },
    guest :{
        type : Schema.Types.ObjectId,
        ref : "User",
        required:true,
    },
    host :{
        type : Schema.Types.ObjectId,
        ref : "User",
        required:true,
    },

    checkIn:{
        type:Date,
        required:true,
    },
    checkOut:{
        type:Date,
        required:true,
    },
    guestCount :{
        type:Number,
        required:true,  
    },

    pricePerNight :{
        type:Number,
        required:true,
        min: 0,
    },
    numOfNights :{
        type:Number,
        required:true,  
    },
    subtotal :{
        type:Number,
        required:true,
        min: 0,
    },
    taxes :{
        type:Number,
        required:true,
        min: 0,
    },
    totalPrice :{
        type:Number,
        required:true,
        min: 0,
    },
status:{
    type : String,
    enum : ["pending", "confirmed", "cancelled", "completed"],
    default : "pending",
},



payment: {
      status: {
        type: String,
        enum: ["unpaid", "paid", "refunded", "failed"],
        default: "unpaid",
      },
      provider: {
        type: String, 
        default: null,
      },
      orderId: {
        type: String, 
        default: null,
      },
      paymentId: {
        type: String, 
        default: null,
      },
    },

    cancellation: {
      cancelledAt: { type: Date, default: null },
      reason: { type: String, default: null },
    },
  },
  { timestamps: true } 
);


bookingSchema.index({ listing: 1, checkIn: 1, checkOut: 1 });

// Speeds up "my bookings" / "host bookings" (Steps 4 & 5)
bookingSchema.index({ guest: 1 });
bookingSchema.index({ host: 1 });

module.exports = mongoose.model("Booking", bookingSchema);

