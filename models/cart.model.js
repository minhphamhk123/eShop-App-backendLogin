import mongoose from "mongoose";

const cartSchema = new mongoose.AggregateSchema({
  quantity: { type : Number, required: true},
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true},
  user:{ type: Schema.Types.ObjectId, ref: 'User', required: true},
  size: { type : Schema.Types.Mixed},
  color: { type : Schema.Types.Mixed},
})

const virtual  = cartSchema.virtual('id');
virtual.get(function(){
    return this._id;
})
cartSchema.set('toJSON',{
    virtuals: true,
    versionKey: false,
    transform: function (doc,ret) { delete ret._id}
})

const Cart = mongoose.model('Cart',cartSchema)
export default Cart;