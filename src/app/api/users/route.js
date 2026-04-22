import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma.js";
import bcrypt from "bcryptjs";

/* ---------------- CREATE USER ---------------- */
export async function POST(req) {
  try {
    const body = await req.json();

    const {
      userType,
      password,
      relievedDate,

      // Client fields
      companyName,
      contactNo,
      address,

      // Employee fields
      department,
      designation,
      empId,
      companyEmpId,
      isRelieved,

      // Common
      name,
      email,
      gender,
    } = body;

    if (!userType || !name || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    let clientRecord = null;

    // 🧠 CREATE CLIENT FIRST
    if (userType === "client") {
      clientRecord = await prisma.client.create({
        data: {
          name,
          email,
          companyName: companyName?.trim() || null,
          contactNo: contactNo || null,
          address: address || null,
        },
      });
    }

    // 🧱 CREATE USER
    const user = await prisma.user.create({
      data: {
        name,
        email,
        gender: gender || null,
        userType,
        password: hashedPassword,

        contactNo: contactNo || null,
        address: address || null,

        department: department || null,
        designation: designation || null,
        empId: empId || null,
        companyEmpId: companyEmpId || null,

        isRelieved: isRelieved ?? false,
        relievedDate: relievedDate ? new Date(relievedDate) : null,

        clientId: clientRecord?.id || null,
      },
    });

    return NextResponse.json(user);

  } catch (err) {
    console.error("❌ Create error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* ---------------- UPDATE USER ---------------- */
export async function PUT(req) {
  try {
    const body = await req.json();

    const {
      id,
      password,
      relievedDate,
      userType,

      companyName,
      contactNo,
      address,

      department,
      designation,
      empId,
      companyEmpId,
      isRelieved,

      name,
      email,
      gender,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    let clientRecord = null;

    // 🧠 UPDATE CLIENT
    if (userType === "client") {
      const user = await prisma.user.findUnique({ where: { id } });

      if (user?.clientId) {
        clientRecord = await prisma.client.update({
          where: { id: user.clientId },
          data: {
            companyName: companyName?.trim() || null,
            contactNo: contactNo || null,
            address: address || null,
          },
        });
      }
    }

    // 🧱 UPDATE USER
    const user = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        gender: gender || null,
        userType,

        ...(hashedPassword && { password: hashedPassword }),

        contactNo: contactNo || null,
        address: address || null,

        department: department || null,
        designation: designation || null,
        empId: empId || null,
        companyEmpId: companyEmpId || null,

        isRelieved: isRelieved ?? false,
        relievedDate: relievedDate ? new Date(relievedDate) : null,
      },
    });

    return NextResponse.json(user);

  } catch (err) {
    console.error("❌ Update error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

  /* ---------------- GET USERS ---------------- */
  export async function GET(req) {
    try {
      const { searchParams } = new URL(req.url);
      const userType = searchParams.get("userType");
      const clientId = searchParams.get("clientId");

      const where = {};
      if (userType) where.userType = userType;
      if (clientId) where.clientId = Number(clientId);

      const users = await prisma.user.findMany({
        where,
        include: { client: true },
      });

      return NextResponse.json(users);
    } catch (err) {
      console.error("❌ Fetch users error:", err);
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
  }

  /* ---------------- DELETE USER ---------------- */

  export async function DELETE(req) {
    try {
      const { searchParams } = new URL(req.url);
      const id = Number(searchParams.get("id"));

      if (!id) {
        return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
      }

      await prisma.user.delete({
        where: { id },
      });

      return NextResponse.json({ success: true });
    } catch (err) {
      console.error("❌ Delete error:", err);

      return NextResponse.json(
        { error: "Delete failed" },
        { status: 500 }
      );
    }
  }
