import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './src/models/Order.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

async function showOrders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('--- BUSCANDO COMPRAS EN LA BASE DE DATOS ---');
    
    const orders = await Order.find().sort({ createdAt: -1 });
    
    if (orders.length === 0) {
      console.log('❌ No se encontraron compras registradas en la base de datos.');
    } else {
      console.log(`✅ Se encontraron ${orders.length} compras:\n`);
      orders.forEach((order, index) => {
        console.log(`[Compra #${index + 1}] ID: ${order._id}`);
        console.log(`- Estado: ${order.status}`);
        console.log(`- Total: $${order.total}`);
        console.log(`- ID de Pago Stripe: ${order.stripePaymentId || 'N/A'}`);
        console.log(`- Dirección: ${order.shippingAddress?.street}, ${order.shippingAddress?.city}`);
        console.log(`- Artículos:`);
        order.items.forEach(item => {
          console.log(`  * ${item.name} (Cantidad: ${item.quantity}) - Precio Unitario: $${item.price}`);
        });
        console.log('--------------------------------------------------\n');
      });
    }
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error al consultar la base de datos:', err);
  }
}

showOrders();
