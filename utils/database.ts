import mongoose from "mongoose";
import { print } from "@/utils/print";
import { ETerminal } from "@/enums/terminal.enum";

let isConnected = false;

export const connectToDatabase = async (): Promise<void> => {
  mongoose.set(`strictQuery`, true);

  if (isConnected) {
    print(`Already connected to MongoDB`, ETerminal.FgGreen);
    return; 
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI ?? ``, {
      dbName: ``, 
    });
    isConnected = true;

    print(`Connected to MongoDB`, ETerminal.FgGreen);
  } catch (error) {
    print(`Error Connect to MongoDB: ${error}`, ETerminal.FgGreen);
  }
}
