import mongoose from "mongoose"
import { Product } from "./product.model"

describe("Product model", () => {
  it("crea producto válido con defaults", async () => {
    const product = new Product({
      sellerId: new mongoose.Types.ObjectId(),
      name: "Gorra negra",
      price: 25,
      stock: 10,
      imageUrl: "https://cdn/img-1.png",
    })

    await expect(product.validate()).resolves.toBeUndefined()
    expect(product.brand).toBe("Sin marca")
    expect(product.category).toBe("Snapback")
    expect(product.isActive).toBe(true)
    expect(product.status).toBe("active")
    expect(product.imageUrls).toEqual(["https://cdn/img-1.png"])
  })

  it("sincroniza imageUrl desde imageUrls cuando imageUrl no existe", async () => {
    const product = new Product({
      sellerId: new mongoose.Types.ObjectId(),
      name: "Playera",
      price: 40,
      stock: 5,
      imageUrl: "",
      imageUrls: ["https://cdn/cover.png"],
    })

    await expect(product.validate()).resolves.toBeUndefined()
    expect(product.imageUrl).toBe("https://cdn/cover.png")
  })

  it("falla cuando imageUrls supera 3 elementos", async () => {
    const product = new Product({
      sellerId: new mongoose.Types.ObjectId(),
      name: "Mochila",
      price: 55,
      stock: 2,
      imageUrl: "https://cdn/1.png",
      imageUrls: [
        "https://cdn/1.png",
        "https://cdn/2.png",
        "https://cdn/3.png",
        "https://cdn/4.png",
      ],
    })

    try {
      await product.validate()
      fail("Debió fallar la validación")
    } catch (error) {
      const validationError = error as mongoose.Error.ValidationError
      expect(validationError.errors.imageUrls).toBeDefined()
    }
  })

  it("falla con precio o stock negativos", async () => {
    const product = new Product({
      sellerId: new mongoose.Types.ObjectId(),
      name: "Billetera",
      price: -1,
      stock: -3,
      imageUrl: "https://cdn/img.png",
    })

    try {
      await product.validate()
      fail("Debió fallar la validación")
    } catch (error) {
      const validationError = error as mongoose.Error.ValidationError
      expect(validationError.errors.price).toBeDefined()
      expect(validationError.errors.stock).toBeDefined()
    }
  })
})
