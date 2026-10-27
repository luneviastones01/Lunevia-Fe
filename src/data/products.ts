export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
  featured?: boolean;
}

// Live specimen products & categories are loaded dynamically from MongoDB / API
export const products: Product[] = [];
export const categories: string[] = ["All"];
