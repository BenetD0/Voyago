import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../src/lib/db";
import Product from "../../src/models/User";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect();                    // ← Lidhja me DB
    console.log("✅ Lidhja me MongoDB u bë me sukses!");

    // Test shtesë: shohim sa produkte ka në DB
    const count = await Product.countDocuments();
    
    res.status(200).json({
      success: true,
      message: "Lidhja me MongoDB është OK!",
      productsInDB: count,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("❌ Gabim lidhjeje:", error);
    res.status(500).json({
      success: false,
      message: "Gabim në lidhjen me DB",
      error: error.message
    });
  }
}