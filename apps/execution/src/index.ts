import { createClient } from "redis";
import { PrismaClient } from "@repo/shared";
// @ts-ignore
import { Spot } from "@binance/connector";

const prisma = new PrismaClient();

// We need TWO connections: one to listen (subscriber), one to talk (publisher)
const redisSub = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
const redisPub = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });

async function processOrder(message: string) {
  try {
    const command = JSON.parse(message);
    console.log(`⚡ Received Order: ${command.orderId} for ${command.symbol}`);

    // 1. Get User Keys from DB
    const user = await prisma.user.findUnique({ where: { id: command.userId } });
    
    if (!user || !user.binanceApiKey) {
      console.error("User keys not found");
      return;
    }

    // 2. Initialize Binance Client (Testnet)
    const client = new Spot(user.binanceApiKey, user.binanceSecret, {
      baseURL: 'https://testnet.binance.vision'
    });

    console.log("🚀 Sending to Binance...");
    
    // 3. Execute Order
    // Note: We are using a simple MARKET order here for the assignment
    let response;
    try {
        response = await client.newOrder(command.symbol, command.side, command.type, {
            quantity: command.quantity
        });
    } catch (binanceError: any) {
        console.error("Binance Error:", binanceError.response?.data || binanceError.message);
        // TODO: Handle rejection events here
        return;
    }

    const fillPrice = parseFloat(response.data.fills?.[0]?.price || "0");
    const status = response.data.status || "FILLED";

    console.log(`✅ Order Filled at ${fillPrice}`);

    // 4. Update Database (Log Event)
    // We update the main order status AND create an event log
    await prisma.$transaction([
        prisma.orderCommand.update({
            where: { id: command.orderId },
            data: { status: status }
        }),
        prisma.orderEvent.create({
            data: {
                orderId: command.orderId,
                status: status,
                price: fillPrice,
                quantity: command.quantity
            }
        })
    ]);

    // 5. Publish Event to Frontend
    const eventPayload = {
        type: "ORDER_UPDATE",
        data: {
            orderId: command.orderId,
            status: status,
            symbol: command.symbol,
            price: fillPrice,
            userId: command.userId // Important for routing
        }
    };

    await redisPub.publish("events:order:status", JSON.stringify(eventPayload));

  } catch (error) {
    console.error("System Error:", error);
  }
}

async function start() {
  await redisSub.connect();
  await redisPub.connect();
  
  // Subscribe to the channel
  await redisSub.subscribe("commands:order:submit", (message) => {
    processOrder(message);
  });

  console.log("👷 Execution Service waiting for orders...");
}

start();