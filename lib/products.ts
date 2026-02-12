export interface Product {
  id: number
  name: string
  price: number
  image: string
  category: string
  description: string
  stock: number
  isNew?: boolean
  isBestseller?: boolean
}

export const defaultProducts: Product[] = [
  {
    id: 1,
    name: "Snapback Negra Classic",
    price: 549,
    image: "/caps/cap-black.jpg",
    category: "Snapback",
    description:
      "Gorra snapback negra con visera plana y ajuste trasero de broche. Ideal para un look urbano limpio.",
    stock: 25,
    isNew: true,
  },
  {
    id: 2,
    name: "Fitted Navy Street",
    price: 649,
    image: "/caps/cap-navy.jpg",
    category: "Fitted",
    description:
      "Gorra fitted en azul marino con bordado frontal. Estilo premium para los que buscan exclusividad.",
    stock: 18,
    isBestseller: true,
  },
  {
    id: 3,
    name: "Trucker Gris Urban",
    price: 449,
    image: "/caps/cap-gray.jpg",
    category: "Trucker",
    description:
      "Gorra trucker en gris con malla trasera transpirable. Perfecta para el verano urbano.",
    stock: 30,
  },
  {
    id: 4,
    name: "Snapback Roja Fire",
    price: 549,
    image: "/caps/cap-red.jpg",
    category: "Snapback",
    description:
      "Gorra snapback roja con detalles en contraste. Para quienes no tienen miedo de destacar.",
    stock: 15,
    isNew: true,
  },
  {
    id: 5,
    name: "Flat Brim Blanca Ice",
    price: 499,
    image: "/caps/cap-white.jpg",
    category: "Flat Brim",
    description:
      "Gorra flat brim blanca con acabado premium. Minimalismo urbano en su maxima expresion.",
    stock: 22,
    isBestseller: true,
  },
  {
    id: 6,
    name: "Camo Military Cap",
    price: 599,
    image: "/caps/cap-camo.jpg",
    category: "Military",
    description:
      "Gorra estilo militar con patron de camuflaje. Actitud callejera con toque tactico.",
    stock: 12,
  },
]

export const categories = ["Todas", "Snapback", "Fitted", "Trucker", "Flat Brim", "Military"]
