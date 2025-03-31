import axios from "axios";
import Papa from "papaparse";

export interface EcommerceSale {
  id: string;
  orderId: string;
  platform: "Etsy" | "Shopify";
  productName: string;
  category: string;
  price: number;
  quantity: number;
  totalAmount: number;
  date: string;
  customerCountry: string;
  status: string;
}

export const fetchEtsyData = async (): Promise<EcommerceSale[]> => {
  try {
    const response = await axios.get("/data/etsy_sales.json");
    return response.data;
  } catch (error) {
    console.error("Error fetching Etsy data:", error);
    throw error;
  }
};

export const fetchShopifyData = async (): Promise<EcommerceSale[]> => {
  try {
    const response = await axios.get("/data/shopify_sales.csv");
    return new Promise((resolve, reject) => {
      Papa.parse(response.data, {
        header: true,
        complete: (results) => {
          const data: EcommerceSale[] = results.data.map((row: any) => ({
            id: row.id,
            orderId: row.order_id,
            platform: "Shopify" as const,
            productName: row.product_name,
            category: row.category,
            price: parseFloat(row.price),
            quantity: parseInt(row.quantity),
            totalAmount: parseFloat(row.total_amount),
            date: row.date,
            customerCountry: row.customer_country,
            status: row.status,
          }));
          resolve(data);
        },
        error: (error) => {
          reject(error);
        },
      });
    });
  } catch (error) {
    console.error("Error fetching Shopify data:", error);
    throw error;
  }
};
