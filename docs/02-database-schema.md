# 02. Esquema de Base de Datos (MongoDB / Mongoose)

[cite_start]El proyecto utiliza una base de datos centralizada [cite: 22] con tres modelos principales. Se utiliza Mongoose para la validación de esquemas.

## 1. Modelo: User (Usuarios)
Colección unificada para todos los actores del sistema.

```typescript
const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Encriptada con bcrypt
  role: {
    type: String,
    enum: ['superadmin', 'seller', 'buyer'],
    default: 'buyer'
  },
  shopName: { type: String }, // Solo requerido si role === 'seller'
  isActive: { type: Boolean, default: true }, // Para banear usuarios
  createdAt: { type: Date, default: Date.now }
});


const ProductSchema = new Schema({
  sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Dueño del producto
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0 }, // Inventario físico
  imageUrl: { type: String, required: true }, // URL externa
  category: {
    type: String,
    enum: ['Snapback', 'Fitted', 'Trucker', 'Dad Hat', 'Flat Brim', '5 Panels', 'Bucket Hat', 'Military'],
    default: 'Snapback'
  },
  isActive: { type: Boolean, default: true } // Soft delete
});

const OrderSchema = new Schema({
  buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    sellerId: { type: Schema.Types.ObjectId, ref: 'User' }, // Para calcular comisiones después
    name: { type: String }, // Snapshot del nombre al momento de compra
    quantity: { type: Number, required: true },
    priceAtPurchase: { type: Number, required: true } // Precio congelado
  }],
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'paid', 'shipped', 'cancelled'],
    default: 'paid' // Simplificado: se asume pagado al crear
  },
  createdAt: { type: Date, default: Date.now }
});