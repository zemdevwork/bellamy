// app/api/user-profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Validation schemas
const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters').optional(),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format')
    .optional(),
  // Accept either a full URL or a local /uploads path
  image: z.string()
    .url('Invalid image URL')
    .or(z.string().startsWith('/uploads/'))
    .optional(),
});

// Types for Cloudinary upload result
interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  [key: string]: unknown;
}

// Type for update data
interface UserUpdateData {
  name?: string;
  email?: string;
  phone?: string;
  image?: string;
}

// GET /api/user-profile
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        role: true,
        branch: true,
      },
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Authenticate
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await request.formData();
    const name = formData.get("name")?.toString();
    const email = formData.get("email")?.toString();
    let phone = formData.get("phone")?.toString();
    const photoFile = formData.get("photoFile") as File | null;

    if (phone?.trim() === "") phone = undefined;

    // Validate the data using the schema
    const validationData: Record<string, unknown> = {};
    if (name) validationData.name = name;
    if (email) validationData.email = email;
    if (phone) validationData.phone = phone;

    const validatedData = updateProfileSchema.parse(validationData);

    // Upload to Cloudinary if photoFile exists
    let image: string | undefined = undefined;
    if (photoFile) {
      const buffer = Buffer.from(await photoFile.arrayBuffer());
      const uploadResult = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: 'users' }, (err, res) => {
          if (err) reject(err);
          else if (res) resolve(res);
          else reject(new Error('Upload failed'));
        });
        stream.end(buffer);
      });
      image = uploadResult.secure_url;
    }

    // Prepare update data
    const updateData: UserUpdateData = {};
    if (validatedData.name) updateData.name = validatedData.name;
    if (validatedData.email) updateData.email = validatedData.email;
    if (validatedData.phone) updateData.phone = validatedData.phone;
    if (image) updateData.image = image;

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}