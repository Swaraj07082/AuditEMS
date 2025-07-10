// import { Repeat1 } from "lucide-react";
// import { NextResponse  } from "next/server";

import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { userSchema } from "@/app/schema/userSchema";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select : {
        id : true,
        email : true,
        name : true,
        role : true,
        createdAt : true,
        updatedAt : true,
        isActive : true,
        lastLogin : true,
        _count : {
          select : {
            pdfs : true
          }
        }

      }
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { email, name, password } = userSchema.parse(body);

    if (!email || !password || !name) {
      console.log("Missing required fields");
      return NextResponse.json(
        { user: null, message: "Name, email and password are required" },
        { status: 400 }
      );
    }

    const existingUserByEmail = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (existingUserByEmail) {
      return NextResponse.json(
        { user: null, message: "user with this email already exists" },
        { status: 409 }
      );
    }

    const existingUserByName = await prisma.user.findUnique({
      where: {
        name: name,
      },
    });

    if (existingUserByName) {
      return NextResponse.json(
        { user: null, message: "user with this username already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword,
      },
    });

    const { password: userPassword, ...rest } = newUser;

    return NextResponse.json(
      { user: rest, message: "user created successfully" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error });
  }
}

