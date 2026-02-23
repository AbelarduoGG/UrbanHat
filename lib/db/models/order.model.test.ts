import mongoose from "mongoose"
import { Order } from "./order.model"

describe("Order model", () => {
  it("crea orden válida y aplica status por defecto", () => {
    const order = new Order({
      buyerId: new mongoose.Types.ObjectId(),
      items: [
        {
          productId: new mongoose.Types.ObjectId(),
          sellerId: new mongoose.Types.ObjectId(),
          name: "Gorra gris",
          quantity: 2,
          priceAtPurchase: 19.99,
        },
      ],
      totalAmount: 39.98,
    })

    const error = order.validateSync()

    expect(error).toBeUndefined()
    expect(order.status).toBe("paid")
    expect(order.createdAt).toBeInstanceOf(Date)
  })

  it("falla cuando faltan campos requeridos", () => {
    const order = new Order({
      items: [],
    })

    const error = order.validateSync()

    expect(error).toBeDefined()
    expect(error?.errors.buyerId).toBeDefined()
    expect(error?.errors.totalAmount).toBeDefined()
  })

  it("falla con status fuera del enum", () => {
    const order = new Order({
      buyerId: new mongoose.Types.ObjectId(),
      items: [],
      totalAmount: 10,
      status: "refunded",
    })

    const error = order.validateSync()

    expect(error).toBeDefined()
    expect(error?.errors.status).toBeDefined()
  })

  it("falla cuando item no tiene quantity o priceAtPurchase", () => {
    const order = new Order({
      buyerId: new mongoose.Types.ObjectId(),
      items: [
        {
          productId: new mongoose.Types.ObjectId(),
          sellerId: new mongoose.Types.ObjectId(),
          name: "Gorra",
        },
      ],
      totalAmount: 5,
    })

    const error = order.validateSync()

    expect(error).toBeDefined()
    expect(error?.errors["items.0.quantity"]).toBeDefined()
    expect(error?.errors["items.0.priceAtPurchase"]).toBeDefined()
  })
})
