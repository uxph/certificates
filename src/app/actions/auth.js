"use server";

import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const AUTH_COOKIE_NAME = "auth_token";

export async function authenticatePassword(password) {
  // Ensure password is not logged or stored anywhere
  if (typeof password !== "string") {
    return { success: false, error: "Invalid input" };
  }

  try {
    // Get password from environment variable
    const correctPassword = process.env.HASH;
    if (!correctPassword) {
      console.error(
        "HASH environment variable not set"
      );
      return { success: false, error: "Authentication system not configured" };
    }

    // Compare password with environment variable using bcrypt
    const isCorrect = await bcrypt.compare(password, correctPassword);

    if (isCorrect) {
      // Set authentication cookie without storing password
      cookies().set(AUTH_COOKIE_NAME, "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24, // 24 hours
      });
      return { success: true };
    }

    return { success: false, error: "Incorrect password" };
  } catch (error) {
    // Don't expose internal errors
    return { success: false, error: "Authentication failed" };
  }
}

export async function checkAuth() {
  const authCookie = cookies().get(AUTH_COOKIE_NAME);
  return authCookie?.value === "authenticated";
}
